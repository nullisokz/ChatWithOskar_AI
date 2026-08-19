import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from pydantic import BaseModel, Field

logger = logging.getLogger("chat")

load_dotenv()

FACTS_PATH = Path(__file__).parent / "facts.md"
MODEL = "gemini-2.5-flash"
MAX_MESSAGE_LENGTH = 500
MAX_HISTORY_MESSAGES = 10

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

app = FastAPI(title="Ask Me Anything — Oskar Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=MAX_MESSAGE_LENGTH)
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str


def load_facts() -> str:
    return FACTS_PATH.read_text(encoding="utf-8")


def build_system_prompt() -> str:
    facts = load_facts()
    return f"""You are Oskar, answering questions from recruiters visiting his portfolio
website. Speak in first person, in a warm, honest, and slightly informal tone.

Only use the facts provided below — never invent biographical details, projects, or
opinions that aren't in this file. If a question goes beyond what's covered here, say so
gracefully (e.g. "That's not something I've shared here, but feel free to reach out
directly!") instead of guessing.

Keep answers short and conversational — 2 to 4 sentences is usually right.

FACTS ABOUT OSKAR:
{facts}
"""


def to_gemini_role(role: str) -> str:
    return "model" if role == "assistant" else "user"


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    trimmed_history = req.history[-MAX_HISTORY_MESSAGES:]
    history = [
        types.Content(
            role=to_gemini_role(m.role),
            parts=[types.Part(text=m.content)],
        )
        for m in trimmed_history
    ]

    chat_session = client.chats.create(
        model=MODEL,
        config=types.GenerateContentConfig(
            system_instruction=build_system_prompt(),
            max_output_tokens=500,
        ),
        history=history,
    )

    try:
        response = chat_session.send_message(req.message)
    except genai_errors.APIError:
        logger.exception("Gemini API call failed")
        raise HTTPException(
            status_code=502,
            detail="Sorry, I'm having trouble responding right now. Please try again in a moment.",
        )

    if not response.text:
        raise HTTPException(
            status_code=502,
            detail="Sorry, I'm having trouble responding right now. Please try again in a moment.",
        )

    return ChatResponse(reply=response.text)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}
