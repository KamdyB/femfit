import pytest
from backend.scoring.composite_score import composite_score


def test_composite_score_shape():
    result = composite_score(acute_load=100, chronic_load=80)
    assert set(result.keys()) == {
        "base_acwr",
        "cycle_modifier",
        "maturation_modifier",
        "adjusted_score",
        "risk_band",
        "explanation",
        "confidence",
    }


def test_composite_score_matches_acwr_when_modifiers_neutral():
    result = composite_score(acute_load=100, chronic_load=80)
    assert result["adjusted_score"] == pytest.approx(result["base_acwr"])


def test_composite_score_zero_chronic_raises():
    with pytest.raises(ValueError):
        composite_score(acute_load=100, chronic_load=0)


def test_risk_band_undertrained():
    result = composite_score(acute_load=50, chronic_load=100)
    assert result["risk_band"] == "UNDERTRAINED"


def test_risk_band_optimal():
    result = composite_score(acute_load=100, chronic_load=100)
    assert result["risk_band"] == "OPTIMAL"


def test_risk_band_caution():
    result = composite_score(acute_load=140, chronic_load=100)
    assert result["risk_band"] == "CAUTION"


def test_risk_band_high_risk():
    result = composite_score(acute_load=160, chronic_load=100)
    assert result["risk_band"] == "HIGH_RISK"