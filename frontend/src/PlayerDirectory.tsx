// frontend/src/PlayerDirectory.tsx
import { useState } from "react";
import { Player } from "./types";

export function PlayerDirectory({
  players,
  selectedPlayerId,
  onSelect,
  onAdd,
}: {
  players: Player[];
  selectedPlayerId: string | null;
  onSelect: (playerId: string) => void;
  onAdd: (name: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalized = query.trim().toLowerCase();
  const visible = players.filter(p => p.name.toLowerCase().includes(normalized));

  const handleAdd = async () => {
    if (!newName.trim()) {
      setError("Enter a name to register.");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      await onAdd(newName.trim());
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register the player.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="panel player-directory">
      <p className="section-title">Team directory</p>
      <div className="field-row">
        <div className="field-group">
          <label className="field-group__label" htmlFor="player-search">Search roster</label>
          <input
            id="player-search"
            type="search"
            value={query}
            placeholder="Type a name"
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="field-group">
          <label className="field-group__label" htmlFor="add-player">
            Add player, once per season
          </label>
          <input
            id="add-player"
            type="text"
            value={newName}
            placeholder="Full name"
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
        </div>
        <button className="record-btn" onClick={handleAdd} disabled={adding}>
          {adding ? "Adding..." : "Add player"}
        </button>
      </div>
      {error && <div className="form-error">{error}</div>}
      {players.length === 0 ? (
        <p className="empty-note">
          Nobody registered for this team yet. Add each player once, then log sessions against them.
        </p>
      ) : visible.length === 0 ? (
        <p className="empty-note">No player matches &ldquo;{query}&rdquo;.</p>
      ) : (
        <ul className="directory-list">
          {visible.map(p => (
            <li key={p.player_id}>
              <button
                type="button"
                className={`directory-row${p.player_id === selectedPlayerId ? " directory-row--active" : ""}`}
                onClick={() => onSelect(p.player_id)}
              >
                <span className="directory-row__name">{p.name}</span>
                <span className="directory-row__meta">since {p.registered_date}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
