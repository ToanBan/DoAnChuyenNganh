# backend/ml/gb_train.py
import json
import os
import sys
from pathlib import Path

import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "data" / "quiz_dataset.json"
MODEL_PATH = BASE_DIR / "quiz_gb_model.pkl"

# Ngưỡng accuracy để gán nhãn "yếu"
WEAK_THRESHOLD = float(os.getenv("WEAK_THRESHOLD", 0.6))


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

  # createdAt -> timestamp
  if "createdAt" in df.columns:
      df["createdAt_ts"] = (
          pd.to_datetime(df["createdAt"], errors="coerce").astype("int64") // 1_000_000_000
      )

  # Convert tất cả cột (trừ createdAt) sang numeric nếu được
  for col in df.columns:
      if col == "createdAt":
          continue
      df[col] = pd.to_numeric(df[col], errors="ignore")

  numeric_cols = df.select_dtypes(include=["number"]).columns
  df[numeric_cols] = df[numeric_cols].fillna(0.0)

  # Nhãn is_weak dựa trên accuracy
  if "accuracy" not in df.columns:
      print(json.dumps({"error": "accuracy column missing in dataset"}, ensure_ascii=False))
      sys.exit(1)

  df["is_weak"] = (df["accuracy"] < WEAK_THRESHOLD).astype(int)

  return df


def train_model():
  df = load_dataset()

  # Lấy tất cả cột số làm feature (trừ is_weak, createdAt)
  feature_cols = [
      col
      for col in df.columns
      if col not in ["is_weak", "createdAt"] and pd.api.types.is_numeric_dtype(df[col])
  ]

  if not feature_cols:
      print(json.dumps({"error": "Không tìm được cột số nào để làm feature."}, ensure_ascii=False))
      sys.exit(1)

  X = df[feature_cols]
  y = df["is_weak"]

  if y.nunique() < 2:
      print(
          json.dumps(
              {"error": "Dataset chỉ có 1 lớp (toàn yếu hoặc toàn không yếu). Cần thêm dữ liệu đa dạng."},
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


if __name__ == "__main__":
  train_model()
