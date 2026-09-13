// frontend/src/SessionEntryForm.tsx
import { useState } from "react";
import { SessionPayload, ScoreResponse } from "./types";
import { logSession } from "./api";

export function SessionEntryForm({
  onScored,
}: {
  onScored: (playerName: string, result: ScoreResponse) => void;
}) {
  const [name, setName] = useState("");
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [rpe, setRpe] = useState(0);
  const [menstruating, setMenstruating] = useState(false);
  const [heightCm, setHeightCm] = useState("");
  const [heightCm6moAgo, setHeightCm6moAgo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Player name is required.");
      return;
    }
    if (durationMinutes <= 0 || rpe <= 0) {
      setError("Enter a duration and RPE greater than zero.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload: SessionPayload = {
      player_id: name.trim(),
      date_str: dateStr,
      duration_minutes: durationMinutes,
      rpe,
      menstruating,
      height_cm: heightCm ? Number(heightCm) : undefined,
      height_cm_6mo_ago: heightCm6moAgo ? Number(heightCm6moAgo) : undefined,
    };
    try {
      const result = await logSession(payload);
      onScored(name.trim(), result);
    } catch {
      setError("Could not reach the scoring service. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <input placeholder="Player name" value={name} onChange={e => setName(e.target.value)} />
      <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} />
      <input type="number" placeholder="Duration (minutes)" value={durationMinutes} onChange={e => setDurationMinutes(+e.target.value)} />
      <input type="number" placeholder="RPE (0-10)" value={rpe} min={0} max={10} onChange={e => setRpe(+e.target.value)} />
      <label>
        <input type="checkbox" checked={menstruating} onChange={e => setMenstruating(e.target.checked)} />
        Menstruating today
      </label>
      <input type="number" placeholder="Height cm (optional)" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
      <input type="number" placeholder="Height cm, 6mo ago (optional)" value={heightCm6moAgo} onChange={e => setHeightCm6moAgo(e.target.value)} />
      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Scoring..." : "Log session"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}