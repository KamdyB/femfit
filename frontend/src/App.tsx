// frontend/src/App.tsx
import { useState } from "react";
import { ScoreResponse } from "./types";
import { SessionEntryForm } from "./SessionEntryForm";
import { RosterView, RiskLevel } from "./RosterView";
import { Glossary } from "./Glossary";

type TeamType = "girls" | "boys" | "mixed";

const TEAM_TITLES: Record<TeamType, string> = {
  girls: "Girls' workload intelligence",
  boys: "Boys' workload intelligence",
  mixed: "Unisex team intelligence",
};

function riskLevel(band: string): RiskLevel {
  if (band === "OPTIMAL") return "stable";
  if (band === "HIGH_RISK") return "elevated";
  return "watch";
}

const TODAY = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default function App() {
  const [roster, setRoster] = useState<Record<string, ScoreResponse>>({});
  const [teamType, setTeamType] = useState<TeamType>(() => {
    document.documentElement.dataset.team = "girls";
    return "girls";
  });

  const handleTeamChange = (next: TeamType) => {
    document.documentElement.dataset.team = next;
    setTeamType(next);
  };

  const handleScored = (playerName: string, result: ScoreResponse) => {
    setRoster(prev => ({ ...prev, [playerName]: result }));
  };

  const counts: Record<RiskLevel, number> = { stable: 0, watch: 0, elevated: 0 };
  Object.values(roster).forEach(r => {
    counts[riskLevel(r.risk_band)] += 1;
  });
  const total = Object.keys(roster).length;

  const needsCheck = Object.entries(roster)
    .filter(([, r]) => riskLevel(r.risk_band) !== "stable")
    .sort((a, b) => b[1].adjusted_score - a[1].adjusted_score);

  return (
    <div className="page">
      <div className="header-row">
        <div>
          <p className="eyebrow">Fieldnote</p>
          <h1 className="display-title">{TEAM_TITLES[teamType]}</h1>
          <label className="team-type">
            Team
            <select value={teamType} onChange={e => handleTeamChange(e.target.value as TeamType)}>
              <option value="girls">Girls</option>
              <option value="boys">Boys</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
        </div>
        <p className="today-date">{TODAY}</p>
      </div>

      <div className="dashboard">
        <div>
          {total > 0 && (
            <div className="check-today">
              <p className="section-title">Who to check today</p>
              {needsCheck.length === 0 ? (
                <p className="check-today__clear">Nobody flagged today, all clear.</p>
              ) : (
                <ul className="check-today__list">
                  {needsCheck.map(([name, r]) => (
                    <li key={name} data-level={riskLevel(r.risk_band)}>
                      <span>{name}</span>
                      <span>{r.risk_band.replace("_", " ")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

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
          <SessionEntryForm onScored={handleScored} showCycleField={teamType !== "boys"} />
          <hr className="rule" />
          <Glossary />
        </div>
      </div>

      <p className="disclaimer">
        Fieldnote is a workload-monitoring tool for coaches, not a medical device. It does not
        diagnose, treat, or predict injury. Cycle and growth modifiers shown here are currently
        neutral placeholders pending validation, not clinical findings. For any health concern,
        consult a qualified medical professional.
      </p>
    </div>
  );
}