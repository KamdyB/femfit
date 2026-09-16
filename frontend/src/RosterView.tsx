// frontend/src/RosterView.tsx, full file
import { ScoreResponse } from "./types";

export type RiskLevel = "stable" | "watch" | "elevated";

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
        return (
          <div className="athlete-row" key={name}>
            <span className="athlete-row__name">{name}</span>
            <span className="athlete-row__acwr">{result.adjusted_score.toFixed(2)}</span>
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