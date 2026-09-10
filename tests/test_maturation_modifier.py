# tests/test_maturation_modifier.py
from backend.scoring.maturation_modifier import maturation_modifier


def test_maturation_modifier_neutral_with_heights():
    assert maturation_modifier(height_cm=160, height_cm_6mo_ago=155) == 1.0


def test_maturation_modifier_neutral_when_missing_data():
    assert maturation_modifier(height_cm=None, height_cm_6mo_ago=None) == 1.0