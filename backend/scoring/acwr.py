def calculate_acwr(acute_load: float, chronic_load: float) -> float:
    if chronic_load <= 0:
        raise ValueError("chronic_load must be greater than zero")

    return acute_load / chronic_load