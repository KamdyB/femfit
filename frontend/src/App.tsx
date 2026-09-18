// frontend/src/App.tsx
import { useEffect, useState } from "react";
import { HistoryPoint, Player, ScoreResponse, TeamType } from "./types";
import { fetchPlayerHistory, fetchPlayers, registerPlayer } from "./api";
import { SessionEntryForm } from "./SessionEntryForm";
import { PlayerDirectory } from "./PlayerDirectory";
import { PlayerDetailView } from "./PlayerDetailView";
import { RosterView, RosterEntry } from "./RosterView";
import { RiskLevel, riskLevel } from "./risk";
import { Glossary } from "./Glossary";

const TEAM_TITLES: Record<TeamType, string> = {
  girls: "Girls' workload intelligence",
  boys: "Boys' workload intelligence",
  mixed: "Unisex team intelligence",
};

const TODAY = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default function App() {
  const [teamType, setTeamType] = useState<TeamType>(() => {
    document.documentElement.dataset.team = "girls";
    return "girls";
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [roster, setRoster] = useState<Record<string, ScoreResponse>>({});
  const [detailId, setDetailId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPlayers(teamType)
      .then(list => { if (!cancelled) setPlayers(list); })
      .catch(() => { if (!cancelled) setPlayers([]); });
    return () => { cancelled = true; };
  }, [teamType]);

  useEffect(() => {
    if (!detailId) {
      setHistory(null);
      setHistoryError(null);
      return;
    }
    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError(null);
    fetchPlayerHistory(detailId)
      .then(points => { if (!cancelled) setHistory(points); })
      .catch(() => { if (!cancelled) setHistoryError("Could not load this player's history."); })
      .finally(() => { if (!cancelled) setHistoryLoading(false); });
    return () => { cancelled = true; };
  }, [detailId]);

  const handleTeamChange = (next: TeamType) => {
    document.documentElement.dataset.team = next;
    setTeamType(next);
    setDetailId(null); // never carry a player from one team into another
  };

  const handleAddPlayer = async (name: string) => {
    await registerPlayer(name, teamType);
    setPlayers(await fetchPlayers(teamType));
  };

  const handleScored = (id: string, result: ScoreResponse) => {
    setRoster(prev => ({ ...prev, [id]: result }));
  };

  const playersById = new Map(players.map((p): [string, Player] => [p.player_id, p]));
  const teamRoster: RosterEntry[] = Object.entries(roster)
    .filter(([id]) => playersById.has(id))
    .map(([id, result]) => ({
      playerId: id,
      name: playersById.get(id)?.name ?? id,
      result,
    }))
    .sort((a, b) => b.result.adjusted_score - a.result.adjusted_score);

  const counts: Record<RiskLevel, number> = { stable: 0, watch: 0, elevated: 0 };
  teamRoster.forEach(entry => { counts[riskLevel(entry.result.risk_band)] += 1; });

  const needsCheck = teamRoster.filter(entry => riskLevel(entry.result.risk_band) !== "stable");
  const detailPlayer = detailId ? playersById.get(detailId) ?? null : null;

  return (
    <div className="page">
      <div className="header-row">
        <div>
          <p className="eyebrow">Fieldnote</p>
          <h1 className="display-title">{TEAM_TITLES[teamType]}</h1>
          <label className="team-type">
            Team
            <select value={teamType} onChange={e => handleTeamChange(e.target.value as TeamType)}>
              <option value="girls">Girls</option>
              <option value="boys">Boys</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
        </div>
        <p className="today-date">{TODAY}</p>
      </div>
      <div className="dashboard">
        <div>
          {detailPlayer && (
            <PlayerDetailView
              player={detailPlayer}
              history={history}
              loading={historyLoading}
              error={historyError}
              onClose={() => setDetailId(null)}
            />
          )}
          <PlayerDirectory
            players={players}
            selectedPlayerId={detailId}
            onSelect={setDetailId}
            onAdd={handleAddPlayer}
          />
          {teamRoster.length > 0 && (
            <div className="check-today">
              <p className="section-title">Who to check today</p>
              {needsCheck.length === 0 ? (
                <p className="check-today__clear">Nobody flagged today, all clear.</p>
              ) : (
                <ul className="check-today__list">
                  {needsCheck.map(entry => (
                    <li
                      key={entry.playerId}
                      data-level={riskLevel(entry.result.risk_band)}
                      onClick={() => setDetailId(entry.playerId)}
                    >
                      <span>{entry.name}</span>
                      <span>{entry.result.risk_band.replace("_", " ")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p className="section-title">Roster</p>
          {teamRoster.length === 0 ? (
            <p className="empty-note">No sessions logged yet for this team.</p>
          ) : (
            <RosterView entries={teamRoster} onSelect={setDetailId} />
          )}
        </div>
        <div>
          <div className="panel">
            <p className="section-title">Monitoring</p>
            <div className="metric-row">
              <div className="metric-block" data-level="stable">
                <div className="metric">{counts.stable}</div>
                <div className="metric-block__label">Stable</div>
              </div>
              <div className="metric-block" data-level="watch">
                <div className="metric">{counts.watch}</div>
                <div className="metric-block__label">Watch</div>
              </div>
              <div className="metric-block" data-level="elevated">
                <div className="metric">{counts.elevated}</div>
                <div className="metric-block__label">Elevated</div>
              </div>
            </div>
          </div>
          <hr className="rule" />
          <SessionEntryForm
            players={players}
            showCycleField={teamType !== "boys"}
            onScored={handleScored}
          />
          <hr className="rule" />
          <Glossary />
        </div>
      </div>
      <p className="disclaimer">
        Fieldnote is a workload-monitoring tool for coaches, not a medical device. It does not
        diagnose, treat, or predict injury. Cycle and growth modifiers shown here are currently
        neutral placeholders pending validation, not clinical findings. For any health concern,
        consult a qualified medical professional.
      </p>
    </div>
  );
}
