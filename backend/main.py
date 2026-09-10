# backend/main.py
"""
backend/main.py

FastAPI entry point. Run from the repo root with:
    uvicorn backend.main:app --reload

Then check http://127.0.0.1:8000/docs to smoke-test /sessions and /score.
"""

from fastapi import FastAPI

from backend.api.score import router as score_router
from backend.api.sessions import router as sessions_router

app = FastAPI(title="FemFit Load API")

app.include_router(score_router)
app.include_router(sessions_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}