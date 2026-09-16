import os

from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel

router = APIRouter()

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="GROQ_API_KEY is not set, /explain is unavailable. "
                "/sessions still returns the full explanation array on its own.",
            )
        _client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=api_key)
    return _client


class ExplainRequest(BaseModel):
    player_id: str
    risk_band: str
    adjusted_score: float
    explanation: list[str]


class ExplainResponse(BaseModel):
    player_id: str
    summary: str


@router.post("/explain", response_model=ExplainResponse)
def explain(req: ExplainRequest) -> ExplainResponse:
    client = _get_client()
    prompt = (
        "Rephrase the following athlete workload assessment as one short, "
        "plain-language sentence a youth sports coach can read at a glance. "
        "Do not invent a different risk level than the one given, and do not "
        f"add medical claims beyond what's stated.\n\n"
        f"Risk band: {req.risk_band}\n"
        f"Adjusted score: {req.adjusted_score}\n"
        f"Details: {' '.join(req.explanation)}"
    )
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=120,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as api_error:
        raise HTTPException(status_code=502, detail=f"Could not reach the explanation service: {api_error}")

    summary = response.choices[0].message.content.strip()
    return ExplainResponse(player_id=req.player_id, summary=summary)