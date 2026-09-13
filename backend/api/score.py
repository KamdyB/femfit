# backend/api/score.py
"""
Shared response shape for a player's risk assessment. Returned by
/sessions, the only scoring endpoint now that session-based load
calculation has replaced raw acute_load/chronic_load input.
"""

from pydantic import BaseModel


class ScoreResponse(BaseModel):
    player_id: str
    base_acwr: float
    cycle_modifier: float
    maturation_modifier: float
    adjusted_score: float
    risk_band: str
    explanation: list[str]
    confidence: float