# tests/test_cylcle_modifier.py
from backend.scoring.cycle_modifier import cycle_modifier


def test_cycle_modifier_neutral_when_menstruating_true():
    assert cycle_modifier(True) == 1.0


def test_cycle_modifier_neutral_when_menstruating_false():
    assert cycle_modifier(False) == 1.0


def test_cycle_modifier_neutral_when_none():
    assert cycle_modifier(None) == 1.0