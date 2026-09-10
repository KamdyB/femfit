# backend/api/score.py
"""
backend/api/score.py

The scoring endpoint. Thin by design, same pattern as TRACE: this file
only translates HTTP requests into a call to composite_score() and
shapes the response. No scoring logic lives here.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.scoring.composite_score import composite_score

router = APIRouter()


class ScoreRequest(BaseModel):
    player_id: str
    acute_load: float
    chronic_load: float
    menstruating: bool | None = None
    height_cm: float | None = None
    height_cm_6mo_ago: float | None = None


class ScoreResponse(BaseModel):
    player_id: str
    base_acwr: float
    cycle_modifier: float
    maturation_modifier: float
    adjusted_score: float
    risk_band: str
    explanation: list[str]
    confidence: float


@router.post("/score", response_model=ScoreResponse)
def score(req: ScoreRequest) -> ScoreResponse:
    try:
        result = composite_score(
            acute_load=req.acute_load,
            chronic_load=req.chronic_load,
            menstruating=req.menstruating,
            height_cm=req.height_cm,
            height_cm_6mo_ago=req.height_cm_6mo_ago,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

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