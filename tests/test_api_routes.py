from datetime import date

import pytest
from pydantic import ValidationError

from backend.api import players as players_api
from backend.api import sessions as sessions_api
from backend.data.player_store import PlayerStore
from backend.data.session_store import SessionStore


@pytest.fixture()
def stores(tmp_path, monkeypatch):
    db = str(tmp_path / "api.db")
    player_store, session_store = PlayerStore(db), SessionStore(db)
    monkeypatch.setattr(players_api, "player_store", player_store)
    monkeypatch.setattr(players_api, "session_store", session_store)
    monkeypatch.setattr(sessions_api, "player_store", player_store)
    monkeypatch.setattr(sessions_api, "session_store", session_store)
    return player_store, session_store


def _register(name, team):
    return players_api.register_player(
        players_api.PlayerRequest(name=name, team_type=team)
    )


def _log(player_id, date_str, minutes, rpe):
    return sessions_api.log_session(
        sessions_api.SessionRequest(
            player_id=player_id, date_str=date_str,
            duration_minutes=minutes, rpe=rpe,
        )
    )


def test_register_returns_id_and_today(stores):
    player = _register(" Amaka  Obi ", "girls")
    assert player.player_id
    assert player.name == "Amaka Obi"  # whitespace normalized
    assert player.registered_date == date.today().isoformat()


def test_duplicate_on_same_team_is_409(stores):
    _register("Amaka", "girls")
    with pytest.raises(players_api.HTTPException) as err:
        _register("Amaka", "girls")
    assert err.value.status_code == 409


def test_roster_listing_is_scoped_to_team(stores):
    _register("Amaka", "girls")
    _register("Tunde", "boys")
    girls = players_api.list_players("girls")
    assert [p.name for p in girls] == ["Amaka"]


def test_history_walks_forward_and_bands_climb(stores):
    player = _register("Amaka", "girls")
    _log(player.player_id, "2026-01-01", 30, 10)
    for day in range(8, 15):
        _log(player.player_id, f"2026-01-{day:02d}", 30, 10)
    points = players_api.player_history(player.player_id)
    assert len(points) == 8
    assert points[3].adjusted_score == pytest.approx(1.071, abs=0.001)   # Jan 10
    assert points[7].risk_band == "HIGH_RISK"                            # Jan 14


def test_same_named_players_histories_never_blend(stores):
    girls_amaka = _register("Amaka", "girls")
    boys_amaka = _register("Amaka", "boys")
    for date_str in ("2026-01-01", "2026-01-08", "2026-01-12", "2026-01-13", "2026-01-14"):
        _log(girls_amaka.player_id, date_str, 60, 10)      # 600 AU, heavy
    _log(boys_amaka.player_id, "2026-01-10", 30, 5)        # 150 AU, light
    girls_hist = players_api.player_history(girls_amaka.player_id)
    boys_hist = players_api.player_history(boys_amaka.player_id)
    assert girls_hist[-1].risk_band == "HIGH_RISK"         # her heavy load only
    assert len(boys_hist) == 1 and boys_hist[0].adjusted_score == pytest.approx(1.0)
    assert boys_hist[0].date not in {p.date for p in girls_hist}


def test_history_unknown_player_is_404(stores):
    with pytest.raises(players_api.HTTPException) as err:
        players_api.player_history("no-such-id")
    assert err.value.status_code == 404


def test_session_for_unregistered_player_is_404(stores):
    with pytest.raises(sessions_api.HTTPException) as err:
        _log("unregistered-id", "2026-01-10", 60, 5)
    assert err.value.status_code == 404


def test_future_session_date_still_422(stores):
    player = _register("Amaka", "girls")
    with pytest.raises(sessions_api.HTTPException) as err:
        _log(player.player_id, "2099-01-01", 60, 5)
    assert err.value.status_code == 422


@pytest.mark.parametrize("field,value", [
    ("rpe", 0), ("rpe", 11), ("duration_minutes", 0), ("duration_minutes", 181),
])
def test_backend_bounds_reject_implausible_input(stores, field, value):
    player = _register("Amaka", "girls")
    payload = {
        "player_id": player.player_id, "date_str": "2026-01-10",
        "duration_minutes": 60, "rpe": 5,
    }
    payload[field] = value
    with pytest.raises(ValidationError):
        sessions_api.SessionRequest(**payload)


def test_bounds_allow_the_valid_extremes(stores):
    player = _register("Amaka", "girls")
    result = _log(player.player_id, "2026-01-10", 180, 10)
    assert result.risk_band == "OPTIMAL"  # first session: acute == chronic
