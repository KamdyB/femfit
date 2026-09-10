# backend/api/sessions.py
"""
backend/api/sessions.py

Logs a single training session for a player, then immediately returns
that player's current risk assessment computed from their full session
history. This is the endpoint SessionEntryForm calls.
"""

from datetime import date

from fastapi import APIRouter

from backend.data.session_store import session_store
from backend.scoring.composite_score import composite_score
from backend.scoring.load_calculator import acute_chronic_from_sessions

router = APIRouter()


class SessionScoreResponse:
    pass  # shape reused from score.py's ScoreResponse below


from backend.api.score import ScoreResponse  # noqa: E402


@router.post("/sessions", response_model=ScoreResponse)
def log_session(
    player_id: str,
    date_str: str,
    duration_minutes: float,
    rpe: float,
    menstruating: bool | None = None,
    height_cm: float | None = None,
    height_cm_6mo_ago: float | None = None,
) -> ScoreResponse:
    session_store.log_session(
        player_id,
        {"date": date_str, "duration_minutes": duration_minutes, "rpe": rpe},
    )
    session_store.update_profile(player_id, menstruating, height_cm, height_cm_6mo_ago)

    profile = session_store.get_profile(player_id)
    sessions = session_store.get_sessions(player_id)
    acute, chronic = acute_chronic_from_sessions(sessions, date.fromisoformat(date_str))

    result = composite_score(
        acute_load=acute,
        chronic_load=chronic,
        menstruating=profile.get("menstruating"),
        height_cm=profile.get("height_cm"),
        height_cm_6mo_ago=profile.get("height_cm_6mo_ago"),
    )

    return ScoreResponse(
        player_id=player_id,
        base_acwr=result["base_acwr"],
        cycle_modifier=result["cycle_modifier"],
        maturation_modifier=result["maturation_modifier"],
        adjusted_score=result["adjusted_score"],
        risk_band=result["risk_band"],
        explanation=result["explanation"],
        confidence=result["confidence"],
    )