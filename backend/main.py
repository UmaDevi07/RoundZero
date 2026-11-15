import io
import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel
from pypdf import PdfReader

load_dotenv()

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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

HM_PROMPT = """You are a strict but fair hiring manager interviewing a fresher.
The answer was captured by speech recognition, so ignore misheard words and spelling.
Judge only the content. Scoring rules:
- Repeating the question, or a one-line answer: 1 to 2.
- Generic claims with no named project, tool, number or outcome: at most 5.
- A specific project or example that shows the candidate's own role: 6 to 7.
- A specific example plus a measurable result or a clear lesson: 8 to 10.
- If the answer is too long to say aloud in about 90 seconds, or reads like a written essay, subtract 2.
- Never give above 6 unless a real, specific example is named.
Return ONLY JSON in exactly this shape:
{"score": <integer from 1 to 10>, "reason": "<one sentence explaining the score>"}"""


class ScoreRequest(BaseModel):
    question: str
    gap: str
    answer: str


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


@app.post("/score")
def score(req: ScoreRequest):
    prompt = (
        HM_PROMPT
        + "\n\nQUESTION: " + req.question
        + "\nWHY IT WAS ASKED: " + req.gap
        + "\nANSWER: " + req.answer[:3000]
    )
    client = genai.Client()
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    try:
        data = json.loads(response.text)
        return {"score": int(data["score"]), "reason": str(data["reason"])}
    except (json.JSONDecodeError, KeyError, ValueError, TypeError):
        return {"score": None, "reason": "Could not score this answer. Try again."}

COACH_PROMPT = """You are a supportive HR coach helping a fresher improve interview answers.
The answer was captured by speech recognition, so ignore misheard words.
Never invent experience for the candidate. Give:
1. "fix": one or two sentences on the most important thing to improve.
2. "try_saying": a short answer template (2 to 3 sentences) with [brackets] where
the candidate fills in their own real details.
Return ONLY JSON in exactly this shape:
{"fix": "...", "try_saying": "..."}"""


@app.post("/coach")
def coach(req: ScoreRequest):
    prompt = (
        COACH_PROMPT
        + "\n\nQUESTION: " + req.question
        + "\nWHY IT WAS ASKED: " + req.gap
        + "\nANSWER: " + req.answer[:3000]
    )
    client = genai.Client()
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    try:
        data = json.loads(response.text)
        return {"fix": str(data["fix"]), "try_saying": str(data["try_saying"])}
    except (json.JSONDecodeError, KeyError, TypeError):
        return {"fix": "Could not generate coaching. Try again.", "try_saying": ""}