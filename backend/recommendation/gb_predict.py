import json
import os
import sys
import argparse
from pathlib import Path

import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Thư mục hiện tại: .../backend/recommendation
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "data" / "quiz_dataset.json"
MODEL_PATH = BASE_DIR / "quiz_gb_model.pkl"

# Ngưỡng xác định "yếu" theo accuracy
# Mặc định < 0.6 là yếu, có thể override bằng biến môi trường WEAK_THRESHOLD
WEAK_THRESHOLD = float(os.getenv("WEAK_THRESHOLD", 0.6))


def convert_np(obj):
    """Chuyển các kiểu numpy sang Python chuẩn để JSON serialize được"""
    if isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        return obj


def load_dataset():
    if not DATA_PATH.exists():
        print(json.dumps({"error": f"{DATA_PATH} not found"}, ensure_ascii=False))
        sys.exit(1)

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    df = pd.DataFrame(data)
    if df.empty:
        print(json.dumps({"error": "quiz_dataset empty"}, ensure_ascii=False))
        sys.exit(1)

    # 1) createdAt -> createdAt_ts (số giây từ epoch)
    if "createdAt" in df.columns:
        df["createdAt_ts"] = (
            pd.to_datetime(df["createdAt"], errors="coerce").astype("int64") // 1_000_000_000
        )

    # 2) Convert tất cả cột (trừ createdAt) sang numeric nếu possible
    for col in df.columns:
        if col == "createdAt":
            continue
        df[col] = pd.to_numeric(df[col], errors="ignore")

    # 3) Fill NaN cho các cột số
    numeric_cols = df.select_dtypes(include=["number"]).columns
    df[numeric_cols] = df[numeric_cols].fillna(0.0)

    # 4) Thêm nhãn is_weak dựa trên accuracy
    if "accuracy" not in df.columns:
        print(json.dumps({"error": "accuracy column missing in dataset"}, ensure_ascii=False))
        sys.exit(1)

    df["is_weak"] = (df["accuracy"] < WEAK_THRESHOLD).astype(int)

    return df


def train_model():
    """
    Train mô hình Gradient Boosting để dự đoán is_weak từ toàn bộ feature dạng số.
    """
    df = load_dataset()

    # Lấy tất cả cột numeric làm feature (trừ is_weak & createdAt)
    feature_cols = [
        col
        for col in df.columns
        if col not in ["is_weak", "createdAt"] and pd.api.types.is_numeric_dtype(df[col])
    ]

    if not feature_cols:
        print(
            json.dumps(
                {"error": "Không tìm được cột số nào để làm feature."},
                ensure_ascii=False,
            )
        )
        sys.exit(1)

    X = df[feature_cols]
    y = df["is_weak"]

    # Nếu tất cả nhãn đều 0 hoặc 1 thì model sẽ không học được 2 lớp
    if y.nunique() < 2:
        print(
            json.dumps(
                {
                    "error": "Dataset chỉ có một lớp (toàn yếu hoặc toàn không yếu). Cần thêm dữ liệu đa dạng hơn để train."
                },
                ensure_ascii=False,
            )
        )
        sys.exit(1)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = GradientBoostingClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=3,
        subsample=0.9,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, digits=3)

    print("=== Accuracy (test) ===")
    print(f"{acc:.3f}")
    print("=== Classification report ===")
    print(report)
    joblib.dump({"model": model, "feature_cols": feature_cols}, MODEL_PATH)
    print(f"✅ Saved model + feature_cols to {MODEL_PATH}")


def diagnose_all_users():
    """
    Dự đoán topic yếu và xác định thứ tự ưu tiên học cho tất cả user.
    """
    if not MODEL_PATH.exists():
        print(json.dumps({"error": "model_not_trained"}, ensure_ascii=False))
        sys.exit(1)

    bundle = joblib.load(MODEL_PATH)
    model = bundle["model"]
    feature_cols = bundle["feature_cols"]

    df = load_dataset()
    if "user_id" not in df.columns:
        print(json.dumps({"error": "user_id column missing in dataset"}, ensure_ascii=False))
        sys.exit(1)

    user_ids = df["user_id"].unique()
    results = []

    for user_id in user_ids:
        df_user = df[df["user_id"] == user_id].copy()

        if df_user.empty:
            results.append({
                "user_id": int(user_id),
                "priority_topic": None,
                "learning_order": []
            })
            continue

        # Đảm bảo đủ feature cho model
        for col in feature_cols:
            if col not in df_user.columns:
                df_user[col] = 0.0

        X = df_user[feature_cols]
        df_user["prob_weak"] = model.predict_proba(X)[:, 1]

        weak_topics = []

        for _, row in df_user.iterrows():
            raw_topic_id = row.get("topic_id", None)
            topic_id = None if pd.isna(raw_topic_id) else str(raw_topic_id)

            accuracy = float(row["accuracy"]) if "accuracy" in row else 0.0
            attempt_number = int(row["attempt_number"]) if "attempt_number" in row else 0

            # 🎯 TÍNH ĐIỂM ƯU TIÊN HỌC
            priority_score = (
                float(row["prob_weak"])          # mức độ yếu theo model
                + (1 - accuracy)                 # mức độ sai
                + np.log1p(attempt_number)       # học nhiều lần nhưng vẫn yếu
            )

            weak_topics.append({
                "topic_id": topic_id,
                "prob_weak": float(row["prob_weak"]),
                "priority_score": float(priority_score),
                "accuracy": accuracy,
                "score": float(row["score"]) if "score" in row else None,
                "correct_count": int(row["correct_count"]) if "correct_count" in row else None,
                "total_questions": int(row["total_questions"]) if "total_questions" in row else None,
                "attempt_number": attempt_number
            })

        # 🔥 SẮP XẾP THEO ĐỘ ƯU TIÊN HỌC (CAO → THẤP)
        weak_topics.sort(key=lambda x: x["priority_score"], reverse=True)

        priority_topic = weak_topics[0] if weak_topics else None

        results.append({
            "user_id": int(user_id),
            "priority_topic": priority_topic,   # topic / khóa học nên học trước
            "learning_order": weak_topics        # thứ tự học đề xuất
        })

    print(json.dumps({"users": results}, ensure_ascii=False, default=convert_np))



def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--mode",
        choices=["train", "diagnose"],
        required=True,
        help="train: huấn luyện model, diagnose: phân tích user",
    )
    parser.add_argument(
        "--user",
        type=int,
        default=None,
        help="user_id để phân tích (chỉ dùng khi --mode diagnose)",
    )
    args = parser.parse_args()

    if args.mode == "train":
        train_model()
    elif args.mode == "diagnose":
        diagnose_all_users()


if __name__ == "__main__":
    main()
