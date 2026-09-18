// frontend/src/PlayerDetailView.tsx
import { HistoryPoint, Player } from "./types";
import { AcwrChart, LoadSparkline } from "./PlayerCharts";
import { riskLevel } from "./risk";

export function PlayerDetailView({
  player,
  history,
  loading,
  error,
  onClose,
}: {
  player: Player;
  history: HistoryPoint[] | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const scored = (history ?? []).filter(p => p.adjusted_score !== null);
  const latest = scored.length > 0 ? scored[scored.length - 1] : null;
  return (
    <div className="panel player-detail">
      <div className="player-detail__head">
        <div>
          <p className="section-title">Player history</p>
          <h2 className="player-detail__name">{player.name}</h2>
          <p className="player-detail__meta">
            Registered {player.registered_date} &middot; {history?.length ?? 0} sessions logged
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
      {latest && (
        <div className="player-detail__summary">
          <span>
            Latest ACWR <strong>{latest.adjusted_score !== null ? latest.adjusted_score.toFixed(2) : "--"}</strong>
          </span>
          <span data-level={riskLevel(latest.risk_band)}>
            {latest.risk_band !== null ? latest.risk_band.replace("_", " ") : ""}
          </span>
        </div>
      )}
      {loading && <p className="empty-note">Loading history...</p>}
      {error && <div className="form-error">{error}</div>}
      {!loading && !error && history !== null && (
        history.length === 0 ? (
          <p className="empty-note">No sessions logged yet. Log one and the trend will appear here.</p>
        ) : (
          <>
            <AcwrChart history={history} />
            <LoadSparkline history={history} />
            <p className="chart-note">
              Shaded zones are the standard ACWR bands. A session with no computable ratio
              shows in the load bars but not the line.
            </p>
          </>
        )
      )}
    </div>
  );
}
