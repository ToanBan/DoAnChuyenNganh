import os
import json
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_FILE = os.path.join(BASE_DIR, "data", "content_dataset_cleaned.json")
EMBED_FILE = os.path.join(BASE_DIR, "data", "content_dataset_embeddings.json")
META_FILE = os.path.join(BASE_DIR, "data", "content_embedding_meta.json")

# Load dataset cleaned
dataset = json.load(open(DATA_FILE, "r", encoding="utf-8"))

# Load model
model = SentenceTransformer("intfloat/multilingual-e5-base")

# Load old embeddings (không đổi cấu trúc)
old_embeddings = {}
if os.path.exists(EMBED_FILE):
    for item in json.load(open(EMBED_FILE, "r", encoding="utf-8")):
        old_embeddings[str(item["id"])] = item

# Load meta: lưu createdAt từng bài
if os.path.exists(META_FILE):
    meta = json.load(open(META_FILE, "r", encoding="utf-8"))
else:
    meta = {}

output = []
new_meta = {}

for item in tqdm(dataset, desc="Generating embeddings"):
    content_id = str(item["id"])
    created_at = item["createdAt"]

    # Nếu bài này đã encode và createdAt KHÔNG đổi → dùng lại embedding cũ
    if content_id in meta and meta[content_id] == created_at:
        output.append(old_embeddings[content_id])
        new_meta[content_id] = created_at
        continue

    # Nếu mới hoặc createdAt thay đổi → encode lại
    texts_to_embed = [item["caption"]]

    if item.get("top_comment") and item["top_comment"].get("content"):
        texts_to_embed.append(item["top_comment"]["content"])

    if item.get("keywords") and isinstance(item["keywords"], list):
        texts_to_embed.append(" ".join(item["keywords"]))

    combined_text = " ".join(texts_to_embed)
    embedding = model.encode(combined_text).tolist()

    output.append({
        "id": item["id"],
        "userId": item["userId"],
        "embedding": embedding
    })

    new_meta[content_id] = created_at

# Ghi lại embedding
json.dump(output, open(EMBED_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

# Ghi lại meta
json.dump(new_meta, open(META_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print("Finished generating embeddings!")
