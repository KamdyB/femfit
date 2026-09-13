// frontend/src/types.ts
export interface Player {
  id: string;
  name: string;
  acuteLoad: number;
  chronicLoad: number;
  cyclePhase?: string;
  heightCm?: number;
  heightCm6moAgo?: number;
}

export interface ScoreResult {
  base_acwr: number;
  cycle_modifier: number;
  maturation_modifier: number;
  adjusted_score: number;
}