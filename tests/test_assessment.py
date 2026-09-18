from datetime import date

import pytest

from backend.scoring.assessment import assess
from backend.scoring.composite_score import composite_score
from backend.scoring.load_calculator import acute_chronic_from_sessions


def _sessions():
    return [
        {"date": "2026-01-08", "duration_minutes": 60, "rpe": 5},
        {"date": "2026-01-10", "duration_minutes": 60, "rpe": 7},
    ]


def test_assess_matches_direct_composition():
    sessions = _sessions()
    acute, chronic, days = acute_chronic_from_sessions(sessions, date(2026, 1, 10))
    expected = composite_score(
        acute_load=acute,
        chronic_load=chronic,
        menstruating=None,
        height_cm=None,
        height_cm_6mo_ago=None,
        days_of_history=days,
    )
    assert assess(sessions, date(2026, 1, 10), {}) == expected


def test_assess_carries_profile_context():
    result = assess(_sessions(), date(2026, 1, 10), {"menstruating": True})
    assert result["cycle_modifier"] == 1.0  # neutral placeholder, unchanged
    assert any("Cycle-based adjustment" in line for line in result["explanation"])


def test_assess_empty_history_raises_like_the_engine():
    with pytest.raises(ValueError):
        assess([], date(2026, 1, 10), {})
