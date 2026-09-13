// frontend/src/api.ts
export async function getScore(payload: {
  acute_load: number;
  chronic_load: number;
  cycle_phase?: string;
  height_cm?: number;
  height_cm_6mo_ago?: number;
}) {
  const res = await fetch("http://localhost:8000/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}