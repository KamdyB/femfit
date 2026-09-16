// frontend/src/App.tsx, full file
import { useState } from "react";
import { ScoreResponse } from "./types";
import { SessionEntryForm } from "./SessionEntryForm";
import { RosterView, RiskLevel } from "./RosterView";

function riskLevel(band: string): RiskLevel {
  if (band === "OPTIMAL") return "stable";
  if (band === "HIGH_RISK") return "elevated";
  return "watch";
}

export default function App() {
  const [roster, setRoster] = useState<Record<string, ScoreResponse>>({});

  const handleScored = (playerName: string, result: ScoreResponse) => {
    setRoster(prev => ({ ...prev, [playerName]: result }));
  };

  const counts: Record<RiskLevel, number> = { stable: 0, watch: 0, elevated: 0 };
  Object.values(roster).forEach(r => {
    counts[riskLevel(r.risk_band)] += 1;
  });
  const total = Object.keys(roster).length;

  return (
    <div className="page">
      <div className="header-row">
        <div>
          <p className="eyebrow">FemFit</p>
          <h1 className="display-title">Girls' workload intelligence</h1>
        </div>
      </div>

      <div className="dashboard">
        <div>
          <p className="section-title">Roster</p>
          {total === 0 ? (
            <p style={{ color: "var(--muted)" }}>No sessions logged yet.</p>
          ) : (
            <RosterView roster={roster} riskLevel={riskLevel} />
          )}
        </div>

        <div>
          <div className="panel">
            <p className="section-title">Monitoring</p>
            <div className="metric-row">
              <div className="metric-block" data-level="stable">
                <div className="metric">{counts.stable}</div>
                <div className="metric-block__label">Stable</div>
              </div>
              <div className="metric-block" data-level="watch">
                <div className="metric">{counts.watch}</div>
                <div className="metric-block__label">Watch</div>
              </div>
              <div className="metric-block" data-level="elevated">
                <div className="metric">{counts.elevated}</div>
                <div className="metric-block__label">Elevated</div>
              </div>
            </div>
          </div>
          <hr className="rule" />
          <SessionEntryForm onScored={handleScored} />
        </div>
      </div>
    </div>
  );
}