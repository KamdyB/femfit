from .acwr import calculate_acwr
from .cycle_modifier import cycle_modifier
from .maturation_modifier import maturation_modifier


def composite_score(
    acute_load: float,
    chronic_load: float,
    menstruating: bool | None = None,
    height_cm: float | None = None,
    height_cm_6mo_ago: float | None = None,
) -> dict:

    base = calculate_acwr(acute_load, chronic_load)

    c_mod = cycle_modifier(menstruating)

    m_mod = maturation_modifier(
        height_cm,
        height_cm_6mo_ago,
    )

    adjusted = base * c_mod * m_mod

    return {
        "base_acwr": round(base, 3),
        "cycle_modifier": c_mod,
        "maturation_modifier": m_mod,
        "adjusted_score": round(adjusted, 3),
    }