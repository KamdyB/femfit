# backend/data/session_store.py
"""
backend/data/session_store.py

In-memory session log, same pattern as TRACE's consent/ledger.py:
append-only per player, swappable for a real DB later without any
other module needing to change.
"""

from typing import Dict, List

from backend.scoring.load_calculator import Session


class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, List[Session]] = {}
        self._profile: Dict[str, dict] = {}

    def log_session(self, player_id: str, session: Session) -> None:
        self._sessions.setdefault(player_id, []).append(session)

    def get_sessions(self, player_id: str) -> List[Session]:
        return list(self._sessions.get(player_id, []))

    def update_profile(
        self,
        player_id: str,
        menstruating: bool | None,
        height_cm: float | None,
        height_cm_6mo_ago: float | None,
    ) -> None:
        profile = self._profile.setdefault(player_id, {})
        if menstruating is not None:
            profile["menstruating"] = menstruating
        if height_cm is not None:
            profile["height_cm"] = height_cm
        if height_cm_6mo_ago is not None:
            profile["height_cm_6mo_ago"] = height_cm_6mo_ago

    def get_profile(self, player_id: str) -> dict:
        return dict(self._profile.get(player_id, {}))


# Module-level default instance, same idiom as TRACE's ledger.
session_store = SessionStore()