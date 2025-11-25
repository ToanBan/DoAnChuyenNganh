import json
import os
import sys
import argparse
from pathlib import Path

import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Thư mục hiện tại: .../backend/ml
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "data" / "quiz_dataset.json"
MODEL_PATH = BASE_DIR / "quiz_gb_model.pkl"

# Ngưỡng xác định "yếu" theo accuracy
# Mặc định < 0.6 là yếu, có thể override bằng biến môi trường WEAK_THRESHOLD
WEAK_THRESHOLD = float(os.getenv("WEAK_THRESHOLD", 0.6))


def load_dataset():
    """
    Đọc quiz_dataset.json, tiền xử lý và tạo nhãn is_weak.
    - Dùng TẤT CẢ các trường dạng số (kể cả quiz_id, user_id, topic_id, ...).
    - Thêm createdAt_ts (timestamp) để model có thêm thông tin thời gian.
    """
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
    Train mô hình Gradient Boosting để dự đoán is_weak từ TOÀN BỘ các feature dạng số.
    Không giới hạn ở vài cột, mà lấy tất cả cột numeric (trừ nhãn & createdAt).
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
                    "error": "Dataset chỉ có một lớp (chỉ toàn yếu hoặc toàn không yếu). Cần thêm dữ liệu đa dạng hơn để train."
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

    # Lưu cả model + feature_cols để lúc diagnose dùng đúng thứ tự
    joblib.dump({"model": model, "feature_cols": feature_cols}, MODEL_PATH)
    print(f"✅ Saved model + feature_cols to {MODEL_PATH}")


def diagnose_user(user_id: int):
    """
    Dự đoán mức độ yếu của từng topic mà user này đã làm.

    Logic chính:
    - Dùng TẤT CẢ các trường dữ liệu dạng số (giống lúc train).
    - Lấy lần làm MỚI NHẤT cho mỗi topic (theo createdAt / createdAt_ts).
    - Nếu lần làm mới nhất ĐÚNG HẾT (100% đúng) → BỎ topic đó ra khỏi weak_topics.
    - Tính xác suất yếu (class 1) cho từng topic bằng GradientBoosting.
    - SẮP XẾP toàn bộ topic của user theo:
        + Nếu model phân biệt được: prob_weak giảm dần (yếu nhất trên cùng).
        + Nếu các prob_weak gần như bằng nhau:
            · accuracy tăng dần (thấp nhất trước),
            · attempt_number giảm dần (nhiều lần làm hơn trước),
            · createdAt_ts giảm dần (mới hơn trước),
            · topic_id tăng dần (tie-break cuối).
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

    # Lọc theo user (hỗ trợ cả trường hợp user_id là số hoặc string)
    col_dtype = df["user_id"].dtype
    if pd.api.types.is_numeric_dtype(col_dtype):
        df_user = df[df["user_id"] == user_id].copy()
    else:
        df_user = df[df["user_id"].astype(str) == str(user_id)].copy()

    if df_user.empty:
        print(
            json.dumps(
                {"user_id": user_id, "weak_topics": [], "weakest_topic": None},
                ensure_ascii=False,
            )
        )
        return

    # Chuẩn hóa thời gian, lấy lần làm mới nhất cho mỗi topic
    try:
        if "createdAt" in df_user.columns:
            df_user["createdAt"] = pd.to_datetime(df_user["createdAt"], errors="coerce")
            df_user = df_user.sort_values("createdAt")
        elif "createdAt_ts" in df_user.columns:
            df_user = df_user.sort_values("createdAt_ts")

        # Giữ lại lần làm MỚI NHẤT cho mỗi topic
        df_user = df_user.groupby("topic_id", as_index=False).tail(1)
    except Exception:
        # Nếu lỗi thì cứ để nguyên (mỗi record vẫn là một hàng)
        pass

    # BỎ những topic mà lần làm mới nhất đã ĐÚNG HẾT (100%)
    # Điều kiện: correct_count >= total_questions hoặc accuracy ~ 1.0
    if "correct_count" in df_user.columns and "total_questions" in df_user.columns:
        mastered_mask = (df_user["total_questions"] > 0) & (
            df_user["correct_count"] >= df_user["total_questions"]
        )
        df_user = df_user[~mastered_mask].copy()

    if "accuracy" in df_user.columns:
        df_user = df_user[df_user["accuracy"] < 0.999999].copy()

    # Sau khi lọc, nếu không còn topic nào "chưa master" → không gợi ý nữa
    if df_user.empty:
        print(
            json.dumps(
                {"user_id": user_id, "weak_topics": [], "weakest_topic": None},
                ensure_ascii=False,
            )
        )
        return

    # Đảm bảo đầy đủ cột feature (nếu thiếu thì thêm 0)
    for col in feature_cols:
        if col not in df_user.columns:
            df_user[col] = 0.0

    X = df_user[feature_cols]

    # predict_proba -> cột thứ 1 là xác suất class 1 (yếu)
    probs = model.predict_proba(X)[:, 1]
    df_user["prob_weak"] = probs

    # ---- SORT LOGIC ----
    # Nếu model phân biệt kém (prob_weak gần như nhau) hoặc chỉ có 1 topic
    use_fallback = df_user["prob_weak"].std() < 1e-6 or df_user.shape[0] == 1

    if use_fallback:
        # Fallback: ưu tiên accuracy thấp, attempt nhiều, mới hơn
        sort_cols = []
        ascending = []

        if "accuracy" in df_user.columns:
            sort_cols.append("accuracy")
            ascending.append(True)  # accuracy thấp hơn yếu hơn → lên trước

        if "attempt_number" in df_user.columns:
            sort_cols.append("attempt_number")
            ascending.append(False)  # attempt nhiều hơn → yếu hơn → lên trước

        if "createdAt_ts" in df_user.columns:
            sort_cols.append("createdAt_ts")
            ascending.append(False)  # mới hơn → ưu tiên hơn

        if "topic_id" in df_user.columns:
            sort_cols.append("topic_id")
            ascending.append(True)  # tie-break ổn định

        if sort_cols:
            df_user = df_user.sort_values(sort_cols, ascending=ascending)
    else:
        # Bình thường: sort theo prob_weak giảm dần,
        # tie-break thêm theo accuracy / attempt / thời gian
        sort_cols = ["prob_weak"]
        ascending = [False]  # prob_weak cao hơn → yếu hơn → lên trước

        if "accuracy" in df_user.columns:
            sort_cols.append("accuracy")
            ascending.append(True)

        if "attempt_number" in df_user.columns:
            sort_cols.append("attempt_number")
            ascending.append(False)

        if "createdAt_ts" in df_user.columns:
            sort_cols.append("createdAt_ts")
            ascending.append(False)

        if "topic_id" in df_user.columns:
            sort_cols.append("topic_id")
            ascending.append(True)

        df_user = df_user.sort_values(sort_cols, ascending=ascending)

    # Build JSON trả về cho Node
    weak_topics = []
    for _, row in df_user.iterrows():
        # topic_id có thể là số hoặc string (vd: "intro") → convert về string cho an toàn
        raw_topic_id = row["topic_id"]
        if pd.isna(raw_topic_id):
            topic_id = None
        else:
            topic_id = str(raw_topic_id)

        weak_topics.append(
            {
                "topic_id": topic_id,
                "prob_weak": float(row["prob_weak"]),
                "accuracy": float(row["accuracy"]) if "accuracy" in row else None,
                "score": float(row["score"]) if "score" in row else None,
                "correct_count": int(row["correct_count"])
                if "correct_count" in row
                else None,
                "total_questions": int(row["total_questions"])
                if "total_questions" in row
                else None,
                "attempt_number": int(row["attempt_number"])
                if "attempt_number" in row
                else None,
            }
        )

    # Lấy topic yếu nhất (nếu có)
    weakest_topic = weak_topics[0] if weak_topics else None

    result = {
        "user_id": user_id,
        "weakest_topic": weakest_topic,
        "weak_topics": weak_topics,
    }
    print(json.dumps(result, ensure_ascii=False))


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
        if args.user is None:
            print(json.dumps({"error": "user id required"}, ensure_ascii=False))
            sys.exit(1)
        diagnose_user(args.user)


if __name__ == "__main__":
    main()