// frontend/src/api.ts
import { SessionPayload, ScoreResponse } from "./types";

const API_BASE = "http://localhost:8000";

export async function logSession(payload: SessionPayload): Promise<ScoreResponse> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}