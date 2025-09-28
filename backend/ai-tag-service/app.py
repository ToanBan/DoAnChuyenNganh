from fastapi import FastAPI, Request
from pydantic import BaseModel
from keybert import KeyBERT

app = FastAPI()
kw_model = KeyBERT()  

class TagRequest(BaseModel):
    name_course: str
    description_course: str
    top_n: int = 5

@app.post("/generate-tags")
async def generate_tags(data: TagRequest):
    text = f"{data.name_course}. {data.description_course}"
    keywords = kw_model.extract_keywords(
        text,
        keyphrase_ngram_range=(1, 2),
        stop_words=[
            "là", "và", "của", "trong", "một", "những", "các", "được", "để",
            "với", "khi", "này", "có", "đó", "thì", "sẽ", "nên", "đã", "đang",
            "học", "khóa", "bài", "giúp", "nâng", "cao", "cơ", "bản", "về"
        ],
        top_n=data.top_n
    )
    return {"tags": [kw[0] for kw in keywords]}
