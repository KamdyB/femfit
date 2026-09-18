// frontend/src/types.ts

export interface SessionPayload {
  player_id: string;
  date_str: string;
  duration_minutes: number;
  rpe: number;
  menstruating?: boolean;
  height_cm?: number;
  height_cm_6mo_ago?: number;
}

export interface ScoreResponse {
  player_id: string;
  base_acwr: number;
  cycle_modifier: number;
  maturation_modifier: number;
  adjusted_score: number;
  previous_adjusted_score: number | null;
  risk_band: string;
  explanation: string[];
  confidence: number;
}

export type TeamType = "girls" | "boys" | "mixed";

export interface Player {
  player_id: string;
  name: string;
  team_type: TeamType;
  registered_date: string;
}

export interface HistoryPoint {
  date: string;
  session_load: number;
  base_acwr: number | null;
  adjusted_score: number | null;
  risk_band: string | null;
  confidence: number | null;
}
