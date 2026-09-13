// frontend/src/RosterView.tsx
import { useState } from "react";
import { ScoreResponse } from "./types";
import { SessionEntryForm } from "./SessionEntryForm";
import { PlayerRiskCard } from "./PlayerRiskCard";

export function RosterView() {
  const [roster, setRoster] = useState<Record<string, ScoreResponse>>({});

  const handleScored = (playerName: string, result: ScoreResponse) => {
    setRoster(prev => ({ ...prev, [playerName]: result }));
  };

  return (
    <div>
      <SessionEntryForm onScored={handleScored} />
      {Object.entries(roster).map(([name, result]) => (
        <PlayerRiskCard key={name} name={name} result={result} />
      ))}
    </div>
  );
}