from .acwr import calculate_acwr
from .cycle_modifier import cycle_modifier
from .maturation_modifier import maturation_modifier


def _risk_band(adjusted_score: float) -> str:
    """Standard acute:chronic workload ratio banding (Gabbett-style
    thresholds), widely cited in sports-science literature."""
    if adjusted_score < 0.8:
        return "UNDERTRAINED"
    if adjusted_score <= 1.3:
        return "OPTIMAL"
    if adjusted_score <= 1.5:
        return "CAUTION"
    return "HIGH_RISK"


def composite_score(
    acute_load: float,
    chronic_load: float,
    menstruating: bool | None = None,
    height_cm: float | None = None,
    height_cm_6mo_ago: float | None = None,
    days_of_history: int = 28,
) -> dict:

    base = calculate_acwr(acute_load, chronic_load)
    c_mod = cycle_modifier(menstruating)
    m_mod = maturation_modifier(height_cm, height_cm_6mo_ago)
    adjusted = base * c_mod * m_mod
    band = _risk_band(adjusted)

    explanation = [
        f"Acute:chronic workload ratio is {round(base, 2)}.",
        f"Risk band is {band}, based on standard ACWR thresholds "
        f"(under 0.8 undertrained, 0.8 to 1.3 optimal, 1.3 to 1.5 caution, "
        f"above 1.5 high risk).",
    ]

    if menstruating is None:
        explanation.append(
            "Cycle phase was not entered, so no cycle-based adjustment was applied."
        )
    else:
        explanation.append(
            "Cycle-based adjustment is currently a neutral placeholder pending validation, "
            "so it did not change the score."
        )

    if height_cm is None or height_cm_6mo_ago is None:
        explanation.append(
            "Growth data was not entered, so no maturation-based adjustment was applied."
        )
    else:
        explanation.append(
            "Maturation-based adjustment is currently a neutral placeholder pending validation, "
            "so it did not change the score."
        )

    data_points_provided = sum(
        x is not None for x in (menstruating, height_cm, height_cm_6mo_ago)
    )
    if days_of_history < 28:
        confidence = round(confidence * (days_of_history / 28), 2)
        explanation.append(
            f"Based on only {days_of_history} day(s) of logged history, so this "
            "score is less reliable than one based on a full 28-day baseline."
        )

    return {
        "base_acwr": round(base, 3),
        "cycle_modifier": c_mod,
        "maturation_modifier": m_mod,
        "adjusted_score": round(adjusted, 3),
        "risk_band": band,
        "explanation": explanation,
        "confidence": confidence,
    }