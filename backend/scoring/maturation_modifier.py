def maturation_modifier(
    height_cm: float | None,
    height_cm_6mo_ago: float | None,
) -> float:
    """
    Experimental maturation feature.

    Returns neutral until validated against an appropriate
    longitudinal youth-athlete dataset.
    """
    return 1.0