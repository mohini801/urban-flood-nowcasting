def calculate_effective_capacity(base_capacity_lps, blockage_percent):
    blockage_fraction = blockage_percent / 100

    effective_capacity = base_capacity_lps * (1 - blockage_fraction)

    return round(effective_capacity, 2)


def calculate_drain_inflow_lps(
    rainfall_mm_hr,
    catchment_factor,
    rainfall_multiplier=1.0,
):
    rainfall_after_scenario = rainfall_mm_hr * rainfall_multiplier

    inflow_lps = rainfall_after_scenario * catchment_factor

    return round(inflow_lps, 2)


def get_drain_status(capacity_used_percent, blockage_percent):
    if capacity_used_percent >= 100:
        return "surcharged"

    if blockage_percent >= 50:
        return "overflow-risk"

    if capacity_used_percent >= 85:
        return "near-capacity"

    return "normal"


def calculate_drain_network_status(
    graph,
    rainfall_mm_hr,
    rainfall_multiplier=1.0,
    blockage_addition=0,
):
    drain_results = []

    catchment_factors = {
        "D1": 1.65,
        "D2": 1.35,
        "D3": 0.95,
    }

    for drain_id, drain_data in graph.nodes(data=True):
        if drain_id == "OUTLET":
            continue

        blockage_percent = min(
            100,
            drain_data["blockage_percent"] + blockage_addition,
        )

        effective_capacity_lps = calculate_effective_capacity(
            drain_data["base_capacity_lps"],
            blockage_percent,
        )

        catchment_factor = catchment_factors.get(drain_id, 1.0)

        inflow_lps = calculate_drain_inflow_lps(
            rainfall_mm_hr=rainfall_mm_hr,
            catchment_factor=catchment_factor,
            rainfall_multiplier=rainfall_multiplier,
        )

        if effective_capacity_lps <= 0:
            capacity_used_percent = 100
        else:
            capacity_used_percent = min(
                100,
                round((inflow_lps / effective_capacity_lps) * 100, 1),
            )

        overflow_lps = round(
            max(0, inflow_lps - effective_capacity_lps),
            2,
        )

        status = get_drain_status(
            capacity_used_percent,
            blockage_percent,
        )

        drain_results.append(
            {
                "id": drain_id,
                "name": drain_data["name"],
                "latitude": drain_data["latitude"],
                "longitude": drain_data["longitude"],
                "connected_roads": drain_data["connected_roads"],
                "base_capacity_lps": drain_data["base_capacity_lps"],
                "blockage_percent": blockage_percent,
                "effective_capacity_lps": effective_capacity_lps,
                "estimated_inflow_lps": inflow_lps,
                "capacity_percent": capacity_used_percent,
                "overflow_lps": overflow_lps,
                "status": status,
            }
        )

    return drain_results