// frontend/src/PlayerRiskCard.tsx
import { useEffect, useState } from "react";
import { Player, ScoreResult } from "./types";
import { getScore } from "./api";

export function PlayerRiskCard({ player }: { player: Player }) {
  const [result, setResult] = useState<ScoreResult | null>(null);

  useEffect(() => {
    getScore({
      acute_load: player.acuteLoad,
      chronic_load: player.chronicLoad,
      cycle_phase: player.cyclePhase,
    }).then(setResult);
  }, [player]);

  if (!result) return <div>Loading...</div>;

  const flag = result.adjusted_score > 1.5 ? "red" : result.adjusted_score < 0.8 ? "amber" : "green";

  return (
    <div style={{ border: `2px solid ${flag}`, padding: "8px" }}>
      <strong>{player.name}</strong>
      <div>Adjusted score: {result.adjusted_score.toFixed(2)}</div>
    </div>
  );
}