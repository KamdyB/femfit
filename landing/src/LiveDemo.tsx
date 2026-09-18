// landing/src/LiveDemo.tsx
import { useEffect, useMemo, useState } from "react";
import { DEMO_PLAYER, DEMO_SESSIONS, walkForward, Assessment } from "./engine";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const shortDate = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}`;

const BAND_LABEL: Record<Assessment["band"], string> = {
  UNDERTRAINED: "Undertrained",
  OPTIMAL: "Optimal",
  CAUTION: "Caution",
  HIGH_RISK: "High risk",
};

function explanation(a: Assessment): string[] {
  const lines = [
    `Acute:chronic workload ratio is ${a.acwr.toFixed(2)} — the last 7 days of load against the rolling baseline.`,
  ];
  if (a.band === "HIGH_RISK") {
    lines.push("Acute load is far above the chronic baseline. The standard suggestion in the literature: cut high-intensity volume next session and rebuild gradually.");
  } else if (a.band === "CAUTION") {
    lines.push("Load is creeping past the optimal range. Worth keeping the next session moderate rather than adding intensity.");
  } else if (a.band === "UNDERTRAINED") {
    lines.push("Acute load sits well below the baseline — common after a layoff. Volume is rebuilt gradually, not jumped.");
  } else {
    lines.push("Load sits inside the standard optimal range, 0.8 to 1.3.");
  }
  if (a.daysOfHistory < 28) {
    lines.push(`Only ${a.daysOfHistory} day(s) of history so far — confidence is capped until a full 28-day baseline exists.`);
  }
  return lines;
}

function DemoChart({ points }: { points: Assessment[] }) {
  const W = 640;
  const H = 260;
  const pad = { top: 12, right: 14, bottom: 26, left: 38 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const yMax = Math.max(2, ...points.map(p => p.acwr)) * 1.05;
  const xAt = (i: number) =>
    pad.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yAt = (v: number) => pad.top + innerH * (1 - v / yMax);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(p.acwr).toFixed(1)}`)
    .join(" ");
  const zones = [
    { from: 0, to: 0.8, fill: "#94a3b8" },
    { from: 0.8, to: 1.3, fill: "#22c55e" },
    { from: 1.3, to: 1.5, fill: "#f59e0b" },
  ];
  return (
    <div className="demo-chart">
      <div className="demo-legend">
        <span style={{ background: "rgba(148,163,184,0.25)" }}>Under 0.8</span>
        <span style={{ background: "rgba(34,197,94,0.25)" }}>0.8 to 1.3</span>
        <span style={{ background: "rgba(245,158,11,0.25)" }}>1.3 to 1.5</span>
        <span style={{ background: "rgba(239,68,68,0.25)" }}>Over 1.5</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="ACWR building over the season">
        {zones.map(z => (
          <rect key={z.from} x={pad.left} y={yAt(z.to)} width={innerW}
            height={Math.max(0, yAt(z.from) - yAt(z.to))} fill={z.fill} fillOpacity={0.16} />
        ))}
        <rect x={pad.left} y={pad.top} width={innerW} height={Math.max(0, yAt(1.5) - pad.top)}
          fill="#ef4444" fillOpacity={0.16} />
        {[0.5, 1.0, 1.5, 2.0].filter(v => v <= yMax).map(v => (
          <g key={v}>
            <line x1={pad.left} x2={W - pad.right} y1={yAt(v)} y2={yAt(v)}
              stroke="currentColor" strokeOpacity={0.15} strokeDasharray="3 3" />
            <text x={pad.left - 6} y={yAt(v) + 3} fontSize={10} textAnchor="end" fill="currentColor" fillOpacity={0.7}>{v}</text>
          </g>
        ))}
        <path d={path} fill="none" stroke="currentColor" strokeWidth={2.5} />
        {points.map((p, i) => (
          <circle key={p.date + i} cx={xAt(i)} cy={yAt(p.acwr)} r={3.5}
            fill="currentColor" />
        ))}
        <text x={pad.left} y={H - 6} fontSize={11} fill="currentColor" fillOpacity={0.7}>
          {shortDate(points[0].date)}
        </text>
        <text x={W - pad.right} y={H - 6} fontSize={11} textAnchor="end" fill="currentColor" fillOpacity={0.7}>
          {shortDate(points[points.length - 1].date)}
        </text>
      </svg>
    </div>
  );
}

export function LiveDemo() {
  const [logged, setLogged] = useState(1);
  const [playing, setPlaying] = useState(false);
  const all = useMemo(() => walkForward(DEMO_SESSIONS), []);
  const total = DEMO_SESSIONS.length;
  const visible = all.slice(0, logged);
  const current = visible[visible.length - 1];
  const session = DEMO_SESSIONS[logged - 1];

  useEffect(() => {
    if (!playing) return;
    if (logged >= total) {
      setPlaying(false);
      return;
    }
    const id = window.setInterval(
      () => setLogged(n => Math.min(n + 1, total)),
      900,
    );
    return () => window.clearInterval(id);
  }, [playing, logged, total]);

  return (
    <div className="demo">
      <div className="demo-col">
        <p className="demo-kicker">Simulated example for {DEMO_PLAYER} — running the same calculations as the tool. Not your data.</p>
        <div className="demo-session-card">
          <span className="demo-session-card__date">{shortDate(session.date)}</span>
          <span className="demo-session-card__math">{session.minutes} min &times; RPE {session.rpe}</span>
          <span className="demo-session-card__load">{session.minutes * session.rpe} load units</span>
        </div>
        <div className="demo-controls">
          <button className="btn btn--primary" onClick={() => setLogged(n => Math.min(n + 1, total))} disabled={logged >= total}>
            Log next session
          </button>
          <button className="btn" onClick={() => setPlaying(p => !p)} disabled={logged >= total && !playing}>
            {playing ? "Pause" : "Play all"}
          </button>
          <button className="btn" onClick={() => { setPlaying(false); setLogged(1); }}>
            Replay
          </button>
        </div>
        <p className="demo-progress">{logged} of {total} sessions logged</p>
      </div>
      <div className="demo-col">
        <div className="demo-score" data-band={current.band}>
          <span className="demo-score__band">{BAND_LABEL[current.band]}</span>
          <span className="demo-score__value">ACWR {current.acwr.toFixed(2)}</span>
        </div>
        <DemoChart points={visible} />
        <ul className="demo-explanation">
          {explanation(current).map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
