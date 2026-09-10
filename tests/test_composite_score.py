# tests/test_composite_score.py
import pytest
from backend.scoring.composite_score import composite_score


def test_composite_score_shape():
    result = composite_score(acute_load=100, chronic_load=80)
    assert set(result.keys()) == {
        "base_acwr",
        "cycle_modifier",
        "maturation_modifier",
        "adjusted_score",
    }


def test_composite_score_matches_acwr_when_modifiers_neutral():
    result = composite_score(acute_load=100, chronic_load=80)
    assert result["adjusted_score"] == pytest.approx(result["base_acwr"])


def test_composite_score_zero_chronic_raises():
    with pytest.raises(ValueError):
        composite_score(acute_load=100, chronic_load=0)