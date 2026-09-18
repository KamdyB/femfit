// frontend/src/PlayerCharts.tsx — no-dependency version
// Same exports as the Recharts version. Swap back when npm works.
import { HistoryPoint } from "./types";

const W = 640;
const H = 280;
const PAD = { top: 10, right: 12, bottom: 26, left: 40 };

const ZONES = [
  { from: 0, to: 0.8, fill: "#94a3b8" },
  { from: 0.8, to: 1.3, fill: "#22c55e" },
  { from: 1.3, to: 1.5, fill: "#f59e0b" },
];

function isScored(p: HistoryPoint): p is HistoryPoint & { adjusted_score: number } {
  return p.adjusted_score !== null;
}

export function AcwrChart({ history }: { history: HistoryPoint[] }) {
  const scored = history.filter(isScored);
  if (scored.length === 0) {
    return <p className="empty-note">No scoreable sessions yet.</p>;
  }
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const yMax = Math.max(2, ...scored.map(p => p.adjusted_score)) * 1.05;
  const xAt = (i: number) =>
    PAD.left + (scored.length <= 1 ? innerW / 2 : (i / (scored.length - 1)) * innerW);
  const yAt = (v: number) => PAD.top + innerH * (1 - v / yMax);
  const path = scored
    .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(p.adjusted_score).toFixed(1)}`)
    .join(" ");
  const gridLines = [0.5, 1.0, 1.5, 2.0].filter(v => v <= yMax);
  return (
    <div className="acwr-chart">
      <div className="chart-legend" aria-hidden="true">
        <span style={{ background: "rgba(148,163,184,0.25)" }}>Undertrained, under 0.8</span>
        <span style={{ background: "rgba(34,197,94,0.25)" }}>Optimal, 0.8 to 1.3</span>
        <span style={{ background: "rgba(245,158,11,0.25)" }}>Caution, 1.3 to 1.5</span>
        <span style={{ background: "rgba(239,68,68,0.25)" }}>High risk, over 1.5</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="ACWR over time">
        {ZONES.map(zone => (
          <rect
            key={zone.from}
            x={PAD.left}
            y={yAt(zone.to)}
            width={innerW}
            height={Math.max(0, yAt(zone.from) - yAt(zone.to))}
            fill={zone.fill}
            fillOpacity={0.14}
          />
        ))}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={innerW}
          height={Math.max(0, yAt(1.5) - PAD.top)}
          fill="#ef4444"
          fillOpacity={0.15}
        />
        {gridLines.map(v => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeDasharray="3 3"
            />
            <text x={PAD.left - 6} y={yAt(v) + 3} fontSize={10} textAnchor="end" fill="currentColor" fillOpacity={0.7}>
              {v}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="currentColor" strokeWidth={2} />
        {scored.map((p, i) => (
          <circle key={`${p.date}-${i}`} cx={xAt(i)} cy={yAt(p.adjusted_score)} r={3} fill="currentColor" />
        ))}
        <text x={PAD.left} y={H - 6} fontSize={11} fill="currentColor" fillOpacity={0.7}>
          {history[0]?.date.slice(5)}
        </text>
        <text x={W - PAD.right} y={H - 6} fontSize={11} textAnchor="end" fill="currentColor" fillOpacity={0.7}>
          {history[history.length - 1]?.date.slice(5)}
        </text>
      </svg>
    </div>
  );
}

export function LoadSparkline({ history }: { history: HistoryPoint[] }) {
  if (history.length === 0) return null;
  const innerW = W - PAD.left - PAD.right;
  const max = Math.max(...history.map(p => p.session_load), 1);
  const barW = Math.max(2, innerW / history.length - 4);
  return (
    <div className="load-sparkline">
      <p className="sparkline-label">Session load, minutes &times; RPE</p>
      <svg viewBox={`0 0 ${W} 72`} width="100%" height={64} role="img" aria-label="Session load per session">
        {history.map((p, i) => {
          const barH = (p.session_load / max) * 56;
          return (
            <rect
              key={`${p.date}-${i}`}
              x={PAD.left + (i * innerW) / history.length + 2}
              y={64 - barH}
              width={barW}
              height={barH}
              rx={4}
              fill="currentColor"
              fillOpacity={0.45}
            />
          );
        })}
      </svg>
    </div>
  );
}
