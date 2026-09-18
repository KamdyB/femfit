// landing/src/engine.ts
// Mirrors backend/scoring/load_calculator.py and the composite banding so the
// landing demo shows the same math the tool runs. Intentionally a small
// duplicate: this is a separate app with no shared module boundary.

export interface DemoSession {
  date: string; // ISO yyyy-mm-dd
  minutes: number;
  rpe: number;
}

export interface Assessment {
  date: string;
  sessionLoad: number;
  acute: number;
  chronic: number;
  acwr: number;
  band: "UNDERTRAINED" | "OPTIMAL" | "CAUTION" | "HIGH_RISK";
  daysOfHistory: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtc(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

function toIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function sessionLoad(s: DemoSession): number {
  return s.minutes * s.rpe;
}

function dailyLoads(sessions: DemoSession[]): Map<string, number> {
  const daily = new Map<string, number>();
  for (const s of sessions) {
    daily.set(s.date, (daily.get(s.date) ?? 0) + sessionLoad(s));
  }
  return daily;
}

function rollingAverage(
  daily: Map<string, number>,
  asOfMs: number,
  windowDays: number,
  daysAvailable: number,
): number {
  const effective = Math.min(windowDays, Math.max(daysAvailable, 1));
  let total = 0;
  for (let i = 0; i < effective; i++) {
    total += daily.get(toIso(asOfMs - i * DAY_MS)) ?? 0;
  }
  return total / effective;
}

function band(acwr: number): Assessment["band"] {
  if (acwr < 0.8) return "UNDERTRAINED";
  if (acwr <= 1.3) return "OPTIMAL";
  if (acwr <= 1.5) return "CAUTION";
  return "HIGH_RISK";
}

export function assess(sessions: DemoSession[], asOf: string): Assessment {
  const daily = dailyLoads(sessions);
  const asOfMs = toUtc(asOf);
  const earliest = Math.min(...sessions.map(s => toUtc(s.date)));
  const daysAvailable = Math.floor((asOfMs - earliest) / DAY_MS) + 1;
  const acute = rollingAverage(daily, asOfMs, 7, daysAvailable);
  const chronic = rollingAverage(daily, asOfMs, 28, daysAvailable);
  // The demo only feeds sessions with positive load, so chronic is never zero.
  const acwr = acute / chronic;
  return {
    date: asOf,
    sessionLoad: sessionLoad(sessions[sessions.length - 1]),
    acute,
    chronic,
    acwr,
    band: band(acwr),
    daysOfHistory: daysAvailable,
  };
}

export function walkForward(sessions: DemoSession[]): Assessment[] {
  const out: Assessment[] = [];
  for (let i = 1; i <= sessions.length; i++) {
    const prefix = sessions.slice(0, i);
    out.push(assess(prefix, prefix[prefix.length - 1].date));
  }
  return out;
}

// Scripted example, same shape as the backend test scenario whose numbers were
// hand-verified: a steady week, a layoff, then a spike past 1.5, then a deload.
export const DEMO_PLAYER = "Amaka";

export const DEMO_SESSIONS: DemoSession[] = [
  { date: "2026-01-01", minutes: 60, rpe: 5 },
  { date: "2026-01-08", minutes: 60, rpe: 5 },
  { date: "2026-01-09", minutes: 60, rpe: 5 },
  { date: "2026-01-10", minutes: 60, rpe: 5 },
  { date: "2026-01-11", minutes: 60, rpe: 5 },
  { date: "2026-01-12", minutes: 60, rpe: 5 },
  { date: "2026-01-13", minutes: 60, rpe: 5 },
  { date: "2026-01-14", minutes: 60, rpe: 5 },
  { date: "2026-01-15", minutes: 30, rpe: 5 },
  { date: "2026-01-16", minutes: 30, rpe: 5 },
];
