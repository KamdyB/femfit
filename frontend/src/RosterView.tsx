// frontend/src/RosterView.tsx
import { useState } from "react";
import { Player } from "./types";
import { SessionEntryForm } from "./SessionEntryForm";
import { PlayerRiskCard } from "./PlayerRiskCard";

export function RosterView() {
  const [players, setPlayers] = useState<Player[]>([]);

  return (
    <div>
      <SessionEntryForm onSubmit={p => setPlayers([...players, p])} />
      {players.map(p => <PlayerRiskCard key={p.id} player={p} />)}
    </div>
  );
}