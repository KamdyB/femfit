# backend/api/sessions.py
"""
Logs a single training session for a player, then immediately returns
that player's current risk assessment computed from their full session
history. This is the endpoint SessionEntryForm calls.
"""

from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.data.session_store import session_store
from backend.scoring.composite_score import composite_score
from backend.scoring.load_calculator import acute_chronic_from_sessions

router = APIRouter()


class ScoreResponse(BaseModel):
    player_id: str
    base_acwr: float
    cycle_modifier: float
    maturation_modifier: float
    adjusted_score: float
    risk_band: str
    explanation: list[str]
    confidence: float


class SessionRequest(BaseModel):
    player_id: str
    date_str: str
    duration_minutes: float
    rpe: float
    menstruating: bool | None = None
    height_cm: float | None = None
    height_cm_6mo_ago: float | None = None


@router.post("/sessions", response_model=ScoreResponse)
def log_session(req: SessionRequest) -> ScoreResponse:
    if req.duration_minutes <= 0 or req.rpe <= 0:
        raise HTTPException(
            status_code=422,
            detail="Duration and RPE must both be greater than zero.",
        )
    session_store.log_session(
        req.player_id,
        {"date": req.date_str, "duration_minutes": req.duration_minutes, "rpe": req.rpe},
    )
    session_store.update_profile(req.player_id, req.menstruating, req.height_cm, req.height_cm_6mo_ago)

    profile = session_store.get_profile(req.player_id)
    sessions = session_store.get_sessions(req.player_id)
    acute, chronic, days_of_history = acute_chronic_from_sessions(sessions, date.fromisoformat(req.date_str))

    result = composite_score(
        acute_load=acute,
        chronic_load=chronic,
        menstruating=profile.get("menstruating"),
        height_cm=profile.get("height_cm"),
        height_cm_6mo_ago=profile.get("height_cm_6mo_ago"),
        days_of_history=days_of_history,
    )

    return ScoreResponse(
        player_id=req.player_id,
        base_acwr=result["base_acwr"],
        cycle_modifier=result["cycle_modifier"],
        maturation_modifier=result["maturation_modifier"],
        adjusted_score=result["adjusted_score"],
        risk_band=result["risk_band"],
        explanation=result["explanation"],
        confidence=result["confidence"],
    )