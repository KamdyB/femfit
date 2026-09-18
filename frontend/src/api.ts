// frontend/src/api.ts
import { HistoryPoint, Player, ScoreResponse, SessionPayload, TeamType } from "./types";

const API_BASE = "http://localhost:8000";

async function parseError(res: Response): Promise<Error> {
  const body = (await res.json().catch(() => null)) as { detail?: unknown } | null;
  const detail =
    typeof body?.detail === "string" ? body.detail : `Request failed: ${res.status}`;
  return new Error(detail);
}

async function post<T>(path: string, payload: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function logSession(payload: SessionPayload): Promise<ScoreResponse> {
  return post<ScoreResponse>("/sessions", payload);
}

export async function registerPlayer(name: string, teamType: TeamType): Promise<Player> {
  return post<Player>("/players", { name, team_type: teamType });
}

export async function fetchPlayers(teamType: TeamType): Promise<Player[]> {
  const res = await fetch(`${API_BASE}/players?team_type=${encodeURIComponent(teamType)}`);
  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function fetchPlayerHistory(playerId: string): Promise<HistoryPoint[]> {
  const res = await fetch(`${API_BASE}/players/${encodeURIComponent(playerId)}/history`);
  if (!res.ok) throw await parseError(res);
  return res.json();
}
