# Hand-verified against _rolling_average (windows scale down honestly):
# one 300 AU session on Jan 1, then 300 AU daily Jan 8-14. At each session
# date, acute is a 7-day window, chronic is min(28, days_available) days:
#   Jan  8  acute 300/7,  chronic 600/8    -> 0.571 UNDERTRAINED
#   Jan 10  acute 900/7,  chronic 1200/10  -> 1.071 OPTIMAL
#   Jan 12  acute 1500/7, chronic 1800/12  -> 1.429 CAUTION
#   Jan 14  acute 2100/7, chronic 2400/14  -> 1.750 HIGH_RISK
from datetime import date

import pytest

from backend.scoring.history import history_points


def _sessions():
    return [{"date": "2026-01-01", "duration_minutes": 30, "rpe": 10}] + [
        {"date": f"2026-01-{day:02d}", "duration_minutes": 30, "rpe": 10}
        for day in range(8, 15)
    ]


def test_every_logged_session_appears_in_order():
    points = history_points(_sessions(), {})
    assert [p["date"] for p in points] == [
        "2026-01-01", "2026-01-08", "2026-01-09", "2026-01-10",
        "2026-01-11", "2026-01-12", "2026-01-13", "2026-01-14",
    ]


def test_risk_bands_climb_through_all_bands():
    by_date = {p["date"]: p for p in history_points(_sessions(), {})}
    assert by_date["2026-01-08"]["risk_band"] == "UNDERTRAINED"
    assert by_date["2026-01-10"]["risk_band"] == "OPTIMAL"
    assert by_date["2026-01-12"]["risk_band"] == "CAUTION"
    assert by_date["2026-01-14"]["risk_band"] == "HIGH_RISK"


def test_acwr_values_match_hand_computation():
    by_date = {p["date"]: p for p in history_points(_sessions(), {})}
    assert by_date["2026-01-08"]["adjusted_score"] == pytest.approx(0.571, abs=0.001)
    assert by_date["2026-01-10"]["adjusted_score"] == pytest.approx(1.071, abs=0.001)
    assert by_date["2026-01-12"]["adjusted_score"] == pytest.approx(1.429, abs=0.001)
    assert by_date["2026-01-14"]["adjusted_score"] == pytest.approx(1.750, abs=0.001)


def test_within_first_seven_days_ratio_is_exactly_one():
    points = history_points(
        [{"date": "2026-03-01", "duration_minutes": 40, "rpe": 6}], {}
    )
    assert points[0]["adjusted_score"] == pytest.approx(1.0)


def test_zero_load_legacy_point_is_kept_and_flagged():
    points = history_points(
        [{"date": "2026-03-01", "duration_minutes": 60, "rpe": 0}], {}
    )
    assert len(points) == 1  # never silently dropped
    assert points[0]["adjusted_score"] is None
    assert points[0]["session_load"] == 0.0


def test_points_carry_the_raw_load_that_drives_the_trend():
    points = history_points(_sessions(), {})
    assert all(p["session_load"] == 300.0 for p in points)
