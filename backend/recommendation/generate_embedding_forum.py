import os
import json
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Xác định đường dẫn tuyệt đối đến file content_dataset.json
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_FILE = os.path.join(BASE_DIR, "data", "forum_dataset_cleaned.json")

# Load dataset
with open(DATA_FILE, "r", encoding="utf-8") as f:
    dataset = json.load(f)

# Load model
model = SentenceTransformer("intfloat/multilingual-e5-base")

# Tạo embedding như bình thường
output = []

for item in tqdm(dataset, desc="Generating embeddings"):
    texts_to_embed = [item["name"]]

    # Thêm top comment nếu có
    if item.get("description"):
        texts_to_embed.append(item["description"])

    # Thêm keywords nếu có
    if item.get("keywords") and isinstance(item["keywords"], list):
        texts_to_embed.append(" ".join(item["keywords"]))

    combined_text = " ".join(texts_to_embed)
    embedding = model.encode(combined_text).tolist()
    
    output.append({
        "forumId": item["id"],
        "embedding": embedding
    })


# Xuất ra file content_dataset_embeddings.json trong cùng thư mục data/
OUTPUT_FILE = os.path.join(BASE_DIR, "data", "forum_dataset_embeddings.json")
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("Finished generating embeddings!")
