// frontend/src/PlayerRiskCard.tsx
import { ScoreResponse } from "./types";

const BAND_COLOR: Record<string, string> = {
  UNDERTRAINED: "#d4a017",
  OPTIMAL: "#2e7d32",
  CAUTION: "#e65100",
  HIGH_RISK: "#c62828",
};

export function PlayerRiskCard({ name, result }: { name: string; result: ScoreResponse }) {
  const color = BAND_COLOR[result.risk_band] ?? "#666";

  return (
    <div style={{ border: `2px solid ${color}`, padding: "8px", marginBottom: "8px" }}>
      <strong>{name}</strong>
      <div>Risk band: <span style={{ color }}>{result.risk_band}</span></div>
      <div>Adjusted score: {result.adjusted_score.toFixed(2)}</div>
      <ul>
        {result.explanation.map((line, i) => <li key={i}>{line}</li>)}
      </ul>
    </div>
  );
}