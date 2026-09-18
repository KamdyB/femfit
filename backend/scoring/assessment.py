"""One player's complete workload assessment at a single point in time:
rolling loads computed from their sessions, then scored through the
composite engine. Pure Python, no framework and no storage dependency."""
from datetime import date

from backend.scoring.composite_score import composite_score
from backend.scoring.load_calculator import Session, acute_chronic_from_sessions


def assess(sessions: list[Session], as_of: date, profile: dict) -> dict:
    acute, chronic, days_of_history = acute_chronic_from_sessions(sessions, as_of)
    return composite_score(
        acute_load=acute,
        chronic_load=chronic,
        menstruating=profile.get("menstruating"),
        height_cm=profile.get("height_cm"),
        height_cm_6mo_ago=profile.get("height_cm_6mo_ago"),
        days_of_history=days_of_history,
    )
