// frontend/src/SessionEntryForm.tsx
import { FormEvent, useRef, useState } from "react";
import { Player, ScoreResponse, SessionPayload } from "./types";
import { logSession } from "./api";

const TODAY_ISO = new Date().toISOString().slice(0, 10);

export function SessionEntryForm({
  players,
  showCycleField,
  onScored,
}: {
  players: Player[];
  showCycleField: boolean;
  onScored: (playerId: string, result: ScoreResponse) => void;
}) {
  const [playerId, setPlayerId] = useState("");
  const [dateStr, setDateStr] = useState(TODAY_ISO);
  // Duration is set once for the whole squad and carries across submissions,
  // since the team trains the same length of time together.
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [rpe, setRpe] = useState(0);
  const [showContext, setShowContext] = useState(false);
  const [menstruating, setMenstruating] = useState(false);
  const [heightCm, setHeightCm] = useState("");
  const [heightCm6moAgo, setHeightCm6moAgo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerSelectRef = useRef<HTMLSelectElement>(null);

  const calculatedLoad = durationMinutes * rpe;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!playerId) {
      setError("Choose a player first. Register them in the directory if they are missing.");
      return;
    }
    if (durationMinutes <= 0 || rpe <= 0) {
      setError("Enter a duration and RPE greater than zero.");
      return;
    }
    if (dateStr > TODAY_ISO) {
      setError("Session date cannot be in the future.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload: SessionPayload = {
      player_id: playerId,
      date_str: dateStr,
      duration_minutes: durationMinutes,
      rpe,
      // Cycle context only exists for teams where the field is shown at all.
      ...(showCycleField ? { menstruating } : {}),
      ...(heightCm ? { height_cm: Number(heightCm) } : {}),
      ...(heightCm6moAgo ? { height_cm_6mo_ago: Number(heightCm6moAgo) } : {}),
    };
    try {
      const result = await logSession(payload);
      onScored(playerId, result);
      setRpe(0); // next player, same sitting
      playerSelectRef.current?.focus(); // back to the top, no mouse needed
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the scoring service. Is the backend running?",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="log-session" onSubmit={handleSubmit}>
      <p className="section-title">Log session</p>
      <div className="field-group">
        <label className="field-group__label" htmlFor="who">Who</label>
        <select
          id="who"
          ref={playerSelectRef}
          value={playerId}
          onChange={e => setPlayerId(e.target.value)}
        >
          <option value="">
            {players.length === 0 ? "No players registered yet" : "Choose a player"}
          </option>
          {players.map(p => (
            <option key={p.player_id} value={p.player_id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="field-row">
        <div className="field-group">
          <label className="field-group__label" htmlFor="session-date">Date</label>
          <input
            id="session-date"
            type="date"
            value={dateStr}
            max={TODAY_ISO}
            onChange={e => setDateStr(e.target.value)}
          />
        </div>
        <div className="field-group">
          <label className="field-group__label" htmlFor="duration">
            Session, minutes &mdash; set once for the squad
          </label>
          <input
            id="duration"
            type="number"
            min={1}
            max={180}
            value={durationMinutes || ""}
            placeholder="0"
            onChange={e => setDurationMinutes(+e.target.value)}
          />
        </div>
        <div className="field-group">
          <label className="field-group__label" htmlFor="rpe">Effort, 0 to 10</label>
          <input
            id="rpe"
            type="number"
            min={0}
            max={10}
            value={rpe || ""}
            placeholder="0"
            onChange={e => setRpe(+e.target.value)}
          />
        </div>
      </div>
      <div className="calculated-load">
        <div className="calculated-load__label">Calculated load</div>
        <div className="calculated-load__value">{calculatedLoad || 0}</div>
        <div className="calculated-load__unit">minutes &times; RPE</div>
      </div>
      <div className="context-toggle">
        <input
          type="checkbox"
          id="context-toggle"
          checked={showContext}
          onChange={e => setShowContext(e.target.checked)}
        />
        <label htmlFor="context-toggle">Add cycle or growth context, optional</label>
      </div>
      {showContext && (
        <>
          {showCycleField && (
            <div className="field-group">
              <label className="field-group__label" htmlFor="menstruating">
                <input
                  id="menstruating"
                  type="checkbox"
                  checked={menstruating}
                  onChange={e => setMenstruating(e.target.checked)}
                  style={{ marginRight: "0.5rem" }}
                />
                Menstruating today
              </label>
            </div>
          )}
          <div className="field-row">
            <div className="field-group">
              <label className="field-group__label" htmlFor="height-now">Height cm</label>
              <input
                id="height-now"
                type="number"
                value={heightCm}
                onChange={e => setHeightCm(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-group__label" htmlFor="height-6mo">Height cm, 6mo ago</label>
              <input
                id="height-6mo"
                type="number"
                value={heightCm6moAgo}
                onChange={e => setHeightCm6moAgo(e.target.value)}
              />
            </div>
          </div>
        </>
      )}
      <button className="record-btn" type="submit" disabled={submitting}>
        {submitting ? "Recording..." : "Record session \u2192"}
      </button>
      {error && <div className="form-error">{error}</div>}
    </form>
  );
}
