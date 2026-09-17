// frontend/src/RosterView.tsx
import { ScoreResponse } from "./types";

export type RiskLevel = "stable" | "watch" | "elevated";

function trend(current: number, previous: number | null): { symbol: string; label: string } | null {
  if (previous === null) return null;
  const delta = current - previous;
  if (Math.abs(delta) < 0.02) return { symbol: "\u2192", label: "steady" };
  return delta > 0 ? { symbol: "\u2197", label: "rising" } : { symbol: "\u2198", label: "falling" };
}

export function RosterView({
  roster,
  riskLevel,
}: {
  roster: Record<string, ScoreResponse>;
  riskLevel: (band: string) => RiskLevel;
}) {
  return (
    <div>
      {Object.entries(roster).map(([name, result]) => {
        const level = riskLevel(result.risk_band);
        const t = trend(result.adjusted_score, result.previous_adjusted_score);
        return (
          <div className="athlete-row" key={name}>
            <span className="athlete-row__name">{name}</span>
            <span className="athlete-row__acwr">
              {result.adjusted_score.toFixed(2)}
              {t && (
                <span className={`athlete-row__trend athlete-row__trend--${t.label}`} title={`Trending ${t.label}`}>
                  {" "}{t.symbol}
                </span>
              )}
            </span>
            <span className="athlete-row__status" data-level={level}>
              {result.risk_band.replace("_", " ")}
            </span>
            <div className="athlete-detail">
              <ul>
                {result.explanation.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}