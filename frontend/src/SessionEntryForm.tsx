// frontend/src/SessionEntryForm.tsx — replace the entire file
import { useState } from "react";
import { SessionPayload, ScoreResponse } from "./types";
import { logSession } from "./api";

const TODAY_ISO = new Date().toISOString().slice(0, 10);

export function SessionEntryForm({
  onScored,
}: {
  onScored: (playerName: string, result: ScoreResponse) => void;
}) {
  const [name, setName] = useState("");
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [rpe, setRpe] = useState(0);
  const [showContext, setShowContext] = useState(false);
  const [menstruating, setMenstruating] = useState(false);
  const [heightCm, setHeightCm] = useState("");
  const [heightCm6moAgo, setHeightCm6moAgo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatedLoad = durationMinutes * rpe;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Player name is required.");
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
      setName("");
      setDurationMinutes(0);
      setRpe(0);
    } catch {
      setError("Could not reach the scoring service. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="log-session">
      <p className="section-title">Log session</p>

      <div className="field-group">
        <label className="field-group__label" htmlFor="who">Who</label>
        <input id="who" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Player name" />
      </div>

      <div className="field-row">
        <div className="field-group">
          <label className="field-group__label" htmlFor="session-date">Date</label>
          <input id="session-date" type="date" value={dateStr} max={TODAY_ISO} onChange={e => setDateStr(e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-group__label" htmlFor="duration">Session, minutes</label>
          <input id="duration" type="number" min={0} value={durationMinutes || ""} placeholder="0" onChange={e => setDurationMinutes(+e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-group__label" htmlFor="rpe">Effort, 0 to 10</label>
          <input id="rpe" type="number" min={0} max={10} value={rpe || ""} placeholder="0" onChange={e => setRpe(+e.target.value)} />
        </div>
      </div>

      <div className="calculated-load">
        <div className="calculated-load__label">Calculated load</div>
        <div className="calculated-load__value">{calculatedLoad || 0}</div>
        <div className="calculated-load__unit">minutes &times; RPE</div>
      </div>

      <div className="context-toggle">
        <input type="checkbox" checked={showContext} onChange={e => setShowContext(e.target.checked)} />
        <span>Add cycle or growth context, optional</span>
      </div>

      {showContext && (
        <>
          <div className="field-group">
            <label className="field-group__label" htmlFor="menstruating">
              <input id="menstruating" type="checkbox" checked={menstruating} onChange={e => setMenstruating(e.target.checked)} style={{ marginRight: "0.5rem" }} />
              Menstruating today
            </label>
          </div>
          <div className="field-row">
            <div className="field-group">
              <label className="field-group__label" htmlFor="height-now">Height cm</label>
              <input id="height-now" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-group__label" htmlFor="height-6mo">Height cm, 6mo ago</label>
              <input id="height-6mo" type="number" value={heightCm6moAgo} onChange={e => setHeightCm6moAgo(e.target.value)} />
            </div>
          </div>
        </>
      )}

      <button className="record-btn" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Recording..." : "Record session \u2192"}
      </button>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}