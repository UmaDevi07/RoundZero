import io
import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
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

GAP_PROMPT = """You are a strict hiring manager. Compare the RESUME with the JOB DESCRIPTION.
Find up to 5 gaps: things the job asks for that the resume does not prove,
or resume claims that are vague or have no numbers.
Return ONLY JSON in exactly this shape:
{"gaps": [{"requirement": "what the job asks for",
"evidence": "what the resume shows, or 'nothing found'",
"gap": "why this is a weakness",
"question": "one interview question that probes it"}]}"""


def read_pdf(data: bytes) -> str:
    reader = PdfReader(io.BytesIO(data))
    return "\n".join((page.extract_text() or "") for page in reader.pages)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/extract")
async def extract(resume: UploadFile = File(...)):
    data = await resume.read()
    text = read_pdf(data)
    return {"filename": resume.filename, "text": text}


@app.get("/llm-test")
def llm_test():
    client = genai.Client()
    response = client.models.generate_content(
        model=MODEL,
        contents="Say hello in one short sentence.",
    )
    return {"model": MODEL, "reply": response.text}


@app.post("/gaps")
async def gaps(resume: UploadFile = File(...), jd: str = Form(...)):
    data = await resume.read()
    resume_text = read_pdf(data)
    if not resume_text.strip():
        return {"gaps": [], "error": "No text found in the PDF."}

    prompt = (
        GAP_PROMPT
        + "\n\nJOB DESCRIPTION:\n" + jd[:6000]
        + "\n\nRESUME:\n" + resume_text[:12000]
    )
    client = genai.Client()
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        return {"gaps": [], "error": "Could not read the AI reply. Try again."}