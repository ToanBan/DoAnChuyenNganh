import os
import json
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Đường dẫn tới behavior_dataset.json
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_FILE = os.path.join(BASE_DIR, "data", "behavior_dataset.json")

# Load dataset
with open(DATA_FILE, "r", encoding="utf-8") as f:
    dataset = json.load(f)

# Load model
model = SentenceTransformer("intfloat/multilingual-e5-base")

output = []

for item in tqdm(dataset, desc="Generating embeddings"):
    # Chuyển các trường thành string để encode
    texts_to_embed = [
        str(item["userId"]),
        str(item["courseId"]),
        str(item["percentProgress"]),
        str(item["startDate"])
    ]
    combined_text = " ".join(texts_to_embed)

    # Tạo embedding
    embedding = model.encode(combined_text).tolist()

    output.append({
        "userId": item["userId"],
        "courseId": item["courseId"],
        "embedding": embedding
    })

# Xuất ra file behavior_dataset_embeddings.json
OUTPUT_FILE = os.path.join(BASE_DIR, "data", "behavior_dataset_embeddings.json")
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("Finished generating embeddings for behavior dataset!")
