# backend/scoring/load_calculator.py
"""
backend/scoring/load_calculator.py

Converts a player's logged training sessions into acute (7-day) and
chronic (28-day) rolling load, using the standard session-RPE method
(session_load = duration_minutes * RPE, Foster et al.) and the
classic rolling-average ACWR windows (Gabbett).
"""

from datetime import date, timedelta
from typing import TypedDict


class Session(TypedDict):
    date: str  # ISO format, e.g. "2026-09-10"
    duration_minutes: float
    rpe: float  # 0-10 CR10 scale


def session_load(duration_minutes: float, rpe: float) -> float:
    return duration_minutes * rpe


def _daily_loads(sessions: list[Session]) -> dict[date, float]:
    daily: dict[date, float] = {}
    for s in sessions:
        d = date.fromisoformat(s["date"])
        daily[d] = daily.get(d, 0.0) + session_load(s["duration_minutes"], s["rpe"])
    return daily


def _rolling_average(daily: dict[date, float], as_of: date, window_days: int) -> float:
    total = sum(
        daily.get(as_of - timedelta(days=i), 0.0)
        for i in range(window_days)
    )
    return total / window_days


def acute_chronic_from_sessions(
    sessions: list[Session], as_of: date
) -> tuple[float, float]:
    daily = _daily_loads(sessions)
    acute = _rolling_average(daily, as_of, 7)
    chronic = _rolling_average(daily, as_of, 28)
    return acute, chronic