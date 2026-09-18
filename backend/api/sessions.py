# backend/api/sessions.py, replace the whole file
"""
Logs a single training session for a registered player, then immediately
returns that player's current risk assessment computed from their full
session history. This is the endpoint SessionEntryForm calls.
"""
from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.data.player_store import player_store
from backend.data.session_store import session_store
from backend.scoring.assessment import assess

router = APIRouter()

# There is no legitimate youth training session several hours long.
MAX_SESSION_MINUTES = 180


class ScoreResponse(BaseModel):
    player_id: str
    base_acwr: float
    cycle_modifier: float
    maturation_modifier: float
    adjusted_score: float
    previous_adjusted_score: float | None
    risk_band: str
    explanation: list[str]
    confidence: float


class SessionRequest(BaseModel):
    player_id: str
    date_str: str
    duration_minutes: float = Field(gt=0, le=MAX_SESSION_MINUTES)
    rpe: float = Field(gt=0, le=10)
    menstruating: bool | None = None
    height_cm: float | None = None
    height_cm_6mo_ago: float | None = None


@router.post("/sessions", response_model=ScoreResponse)
def log_session(req: SessionRequest) -> ScoreResponse:
    if player_store.get(req.player_id) is None:
        raise HTTPException(
            status_code=404,
            detail="Player not found. Register the player first, then log sessions against their id.",
        )
    session_date = date.fromisoformat(req.date_str)
    if session_date > date.today():
        raise HTTPException(
            status_code=422,
            detail="Session date cannot be in the future. Log a session after it happens, not before.",
        )

    prior_sessions = session_store.get_sessions(req.player_id)
    previous_adjusted_score: float | None = None
    if prior_sessions:
        # The previous standing uses the profile as it stood before this
        # session's context was saved, exactly as before.
        prior_profile = session_store.get_profile(req.player_id)
        last_prior_date = date.fromisoformat(max(s["date"] for s in prior_sessions))
        previous_adjusted_score = assess(prior_sessions, last_prior_date, prior_profile)[
            "adjusted_score"
        ]

    session_store.log_session(
        req.player_id,
        {"date": req.date_str, "duration_minutes": req.duration_minutes, "rpe": req.rpe},
    )
    session_store.update_profile(
        req.player_id, req.menstruating, req.height_cm, req.height_cm_6mo_ago
    )

    profile = session_store.get_profile(req.player_id)
    sessions = session_store.get_sessions(req.player_id)
    result = assess(sessions, session_date, profile)

    return ScoreResponse(
        player_id=req.player_id,
        base_acwr=result["base_acwr"],
        cycle_modifier=result["cycle_modifier"],
        maturation_modifier=result["maturation_modifier"],
        adjusted_score=result["adjusted_score"],
        previous_adjusted_score=previous_adjusted_score,
        risk_band=result["risk_band"],
        explanation=result["explanation"],
        confidence=result["confidence"],
    )
