import os
import json
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_FILE = os.path.join(BASE_DIR, "data", "behavior_dataset.json")
EMBED_FILE = os.path.join(BASE_DIR, "data", "behavior_dataset_embeddings.json")
META_FILE = os.path.join(BASE_DIR, "data", "behavior_embedding_meta.json")
OUTPUT_FILE = os.path.join(BASE_DIR, "data", "behavior_dataset_embeddings.json")
# Load dataset
with open(DATA_FILE, "r", encoding="utf-8") as f:
    dataset = json.load(f)

# Load model
model = SentenceTransformer("intfloat/multilingual-e5-base")

# Load old embeddings
old_embeddings = {}
if os.path.exists(EMBED_FILE):
    with open(EMBED_FILE, "r", encoding="utf-8") as f:
        for item in json.load(f):
            key = f"{item['userId']}_{item['courseId']}"
            old_embeddings[key] = item

# Load meta
if os.path.exists(META_FILE):
    with open(META_FILE, "r", encoding="utf-8") as f:
        meta = json.load(f)
else:
    meta = {}

output = []
new_meta = {}

for item in tqdm(dataset, desc="Generating embeddings"):

    key = f"{item['userId']}_{item['courseId']}"
    start_date = item["startDate"]
    progress = float(item["percentProgress"])

    # Nếu dữ liệu KHÔNG đổi → dùng lại embedding cũ
    if key in meta:
        old = meta[key]
        if old["startDate"] == start_date and old["percentProgress"] == progress:
            output.append(old_embeddings[key])
            new_meta[key] = old
            continue

    # Nếu mới hoặc đổi → encode lại
    behavior_text = (
        f"User is learning the course {item['courseName']}. "
        f"Progress: {item['percentProgress']:.1f} percent."
    )

    embedding = model.encode(behavior_text).tolist()

    output.append({
        "userId": item["userId"],
        "courseId": item["courseId"],
        "embedding": embedding
    })

    # Cập nhật meta
    new_meta[key] = {
        "startDate": start_date,
        "percentProgress": progress
    }

# Lưu output
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

# Lưu meta
with open(META_FILE, "w", encoding="utf-8") as f:
    json.dump(new_meta, f, ensure_ascii=False, indent=2)

print("Finished generating embeddings for behavior dataset!")
