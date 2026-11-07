import io
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pypdf import PdfReader

load_dotenv()

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/extract")
async def extract(resume: UploadFile = File(...)):
    data = await resume.read()
    reader = PdfReader(io.BytesIO(data))
    text = "\n".join((page.extract_text() or "") for page in reader.pages)
    return {"filename": resume.filename, "pages": len(reader.pages), "text": text}


@app.get("/llm-test")
def llm_test():
    client = genai.Client()
    response = client.models.generate_content(
        model=MODEL,
        contents="Say hello in one short sentence.",
    )
    return {"model": MODEL, "reply": response.text}