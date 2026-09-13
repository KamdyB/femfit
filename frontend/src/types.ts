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
  risk_band: string;
  explanation: string[];
  confidence: number;
}