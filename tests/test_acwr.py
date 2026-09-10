# tests/test_acwr.py
import pytest
from backend.scoring.acwr import calculate_acwr


def test_calculate_acwr_normal_ratio():
    assert calculate_acwr(acute_load=100, chronic_load=80) == pytest.approx(1.25)


def test_calculate_acwr_equal_load():
    assert calculate_acwr(acute_load=50, chronic_load=50) == pytest.approx(1.0)


def test_calculate_acwr_zero_chronic_raises():
    with pytest.raises(ValueError):
        calculate_acwr(acute_load=100, chronic_load=0)


def test_calculate_acwr_negative_chronic_raises():
    with pytest.raises(ValueError):
        calculate_acwr(acute_load=100, chronic_load=-10)