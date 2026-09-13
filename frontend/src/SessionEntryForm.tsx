// frontend/src/SessionEntryForm.tsx
import { useState } from "react";
import { Player } from "./types";

export function SessionEntryForm({ onSubmit }: { onSubmit: (p: Player) => void }) {
  const [name, setName] = useState("");
  const [acuteLoad, setAcuteLoad] = useState(0);
  const [chronicLoad, setChronicLoad] = useState(0);
  const [cyclePhase, setCyclePhase] = useState("");

  const handleSubmit = () => {
    onSubmit({ id: crypto.randomUUID(), name, acuteLoad, chronicLoad, cyclePhase: cyclePhase || undefined });
  };

  return (
    <div>
      <input placeholder="Player name" value={name} onChange={e => setName(e.target.value)} />
      <input type="number" placeholder="Acute load" value={acuteLoad} onChange={e => setAcuteLoad(+e.target.value)} />
      <input type="number" placeholder="Chronic load" value={chronicLoad} onChange={e => setChronicLoad(+e.target.value)} />
      <select value={cyclePhase} onChange={e => setCyclePhase(e.target.value)}>
        <option value="">No cycle data</option>
        <option value="follicular">Follicular</option>
        <option value="ovulatory">Ovulatory</option>
        <option value="luteal">Luteal</option>
        <option value="menstrual">Menstrual</option>
      </select>
      <button onClick={handleSubmit}>Add player</button>
    </div>
  );
}