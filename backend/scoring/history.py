"""Reconstructs a player's ACWR and risk band as they stood at every past
session by walking forward through the session list and re-running the
existing engine at each date. No second copy of past scores is ever
stored, so the sessions table stays the single source of truth."""
from datetime import date

from backend.scoring.assessment import assess
from backend.scoring.load_calculator import Session, session_load

_UNSCOREABLE = {
    "base_acwr": None,
    "adjusted_score": None,
    "risk_band": None,
    "confidence": None,
}


def history_points(sessions: list[Session], profile: dict) -> list[dict]:
    ordered = sorted(sessions, key=lambda s: s["date"])
    points: list[dict] = []
    past: list[Session] = []
    for s in ordered:
        past.append(s)
        point: dict = {
            "date": s["date"],
            "session_load": round(session_load(s["duration_minutes"], s["rpe"]), 1),
            **_UNSCOREABLE,
        }
        try:
            point.update(assess(past, date.fromisoformat(s["date"]), profile))
        except ValueError:
            # Zero chronic load (only possible in legacy rows with zero RPE):
            # the session is still returned, it just has no computable ratio.
            pass
        points.append(point)
    return points
