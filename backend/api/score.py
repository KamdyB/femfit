# backend/api/score.py
from fastapi import APIRouter
from pydantic import BaseModel
from scoring.composite_score import composite_score

router = APIRouter()

class ScoreRequest(BaseModel):
    acute_load: float
    chronic_load: float
    cycle_phase: str | None = None
    height_cm: float | None = None
    height_cm_6mo_ago: float | None = None

@router.post("/score")
def score(req: ScoreRequest):
    return composite_score(
        req.acute_load,
        req.chronic_load,
        req.cycle_phase,
        req.height_cm,
        req.height_cm_6mo_ago,
    )