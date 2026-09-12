from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.services.drainage_graph import build_drainage_graph
from app.services.flood_engine import calculate_drain_network_status


app = FastAPI(
    title="Urban Flood Nowcasting API",
    version="0.2.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


FORECAST_DATA = {
    0: {
        "rainfall": 10,
        "updated_at": "Current conditions",
    },
    30: {
        "rainfall": 28,
        "updated_at": "Forecast: +30 minutes",
    },
    60: {
        "rainfall": 45,
        "updated_at": "Forecast: +60 minutes",
    },
    120: {
        "rainfall": 68,
        "updated_at": "Forecast: +120 minutes",
    },
    180: {
        "rainfall": 78,
        "updated_at": "Forecast: +180 minutes",
    },
}


SCENARIO_RULES = {
    "light": {
        "rainfall_multiplier": 0.50,
        "blockage_addition": 0,
        "surface_runoff_multiplier": 0.45,
    },
    "moderate": {
        "rainfall_multiplier": 1.00,
        "blockage_addition": 0,
        "surface_runoff_multiplier": 1.00,
    },
    "extreme": {
        "rainfall_multiplier": 1.55,
        "blockage_addition": 10,
        "surface_runoff_multiplier": 1.65,
    },
    "blocked-drain": {
        "rainfall_multiplier": 1.10,
        "blockage_addition": 45,
        "surface_runoff_multiplier": 1.75,
    },
}


ROAD_TEMPLATE = [
    {
        "id": "road-1",
        "name": "Low-Lying Junction",
        "latitude": 18.5208,
        "longitude": 73.8567,
        "base_depth_cm": 2,
        "terrain_factor": 1.50,
    },
    {
        "id": "road-2",
        "name": "Station Road",
        "latitude": 18.5197,
        "longitude": 73.8585,
        "base_depth_cm": 1,
        "terrain_factor": 1.15,
    },
    {
        "id": "road-3",
        "name": "Market Lane",
        "latitude": 18.5218,
        "longitude": 73.8546,
        "base_depth_cm": 1,
        "terrain_factor": 0.85,
    },
]


def get_road_risk(water_depth_cm):
    if water_depth_cm >= 30:
        return "severe", "avoid"

    if water_depth_cm >= 15:
        return "high", "avoid"

    if water_depth_cm >= 5:
        return "moderate", "caution"

    return "safe", "open"


def calculate_street_flooding(
    roads,
    drains,
    rainfall_mm_hr,
    surface_runoff_multiplier,
):
    road_overflow_lps = {}

    for drain in drains:
        for road_id in drain["connected_roads"]:
            current_overflow = road_overflow_lps.get(road_id, 0)

            road_overflow_lps[road_id] = round(
                current_overflow + drain["overflow_lps"],
                2,
            )

    streets = []

    for road in roads:
        rainfall_depth_component = (
            rainfall_mm_hr * 0.08 * road["terrain_factor"]
        )

        overflow_depth_component = (
            road_overflow_lps.get(road["id"], 0) * 0.45
        )

        water_depth_cm = round(
            road["base_depth_cm"]
            + (
                rainfall_depth_component
                + overflow_depth_component
            )
            * surface_runoff_multiplier,
            1,
        )

        risk, status = get_road_risk(water_depth_cm)

        connected_drain = next(
            (
                drain
                for drain in drains
                if road["id"] in drain["connected_roads"]
            ),
            None,
        )

        if connected_drain and connected_drain["overflow_lps"] > 0:
            drain_impact = (
                f'{connected_drain["name"]} overflow: '
                f'{connected_drain["overflow_lps"]} L/s'
            )
        else:
            drain_impact = "No drainage overflow detected"

        streets.append(
            {
                "id": road["id"],
                "name": road["name"],
                "latitude": road["latitude"],
                "longitude": road["longitude"],
                "water_depth_cm": water_depth_cm,
                "risk": risk,
                "status": status,
                "terrain_factor": road["terrain_factor"],
                "drain_overflow_lps": road_overflow_lps.get(
                    road["id"],
                    0,
                ),
                "drain_impact": drain_impact,
            }
        )

    return streets


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Urban Flood Nowcasting API",
    }


@app.get("/api/nowcast")
def get_nowcast(minutes: int = 0, scenario: str = "moderate"):
    selected_minutes = minutes if minutes in FORECAST_DATA else 0

    selected_forecast = FORECAST_DATA[selected_minutes]

    selected_scenario = scenario.lower()

    rules = SCENARIO_RULES.get(
        selected_scenario,
        SCENARIO_RULES["moderate"],
    )

    rainfall_mm_hr = round(
        selected_forecast["rainfall"] * rules["rainfall_multiplier"],
        1,
    )

    graph = build_drainage_graph()

    drains = calculate_drain_network_status(
        graph=graph,
        rainfall_mm_hr=selected_forecast["rainfall"],
        rainfall_multiplier=rules["rainfall_multiplier"],
        blockage_addition=rules["blockage_addition"],
    )

    streets = calculate_street_flooding(
        roads=ROAD_TEMPLATE,
        drains=drains,
        rainfall_mm_hr=rainfall_mm_hr,
        surface_runoff_multiplier=rules["surface_runoff_multiplier"],
    )

    flood_risk_streets = sum(
        street["risk"] in ["high", "severe"]
        for street in streets
    )

    drainage_alerts = sum(
        drain["status"]
        in ["near-capacity", "overflow-risk", "surcharged"]
        for drain in drains
    )

    return {
        "location": "Pune Ward Demo",
        "scenario": selected_scenario,
        "updated_at": selected_forecast["updated_at"],
        "rainfall_intensity_mm_hr": rainfall_mm_hr,
        "forecast_window_hours": 3,
        "selected_minutes": selected_minutes,
        "flood_risk_streets": flood_risk_streets,
        "drainage_alerts": drainage_alerts,
        "streets": streets,
        "drains": drains,
    }