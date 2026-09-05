from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Urban Flood Nowcasting API",
    version="0.1.0",
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


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Urban Flood Nowcasting API",
    }


@app.get("/api/nowcast")
def get_nowcast(minutes: int = 0):
    scenario = {
        0: {
            "rainfall": 42,
            "flood_streets": 7,
            "drainage_alerts": 3,
            "depths": [28, 14, 4],
            "drain_capacities": [96, 87, 42],
            "updated_at": "Current conditions",
        },
        60: {
            "rainfall": 58,
            "flood_streets": 11,
            "drainage_alerts": 5,
            "depths": [42, 25, 9],
            "drain_capacities": [100, 96, 61],
            "updated_at": "Forecast: +60 minutes",
        },
        120: {
            "rainfall": 47,
            "flood_streets": 9,
            "drainage_alerts": 4,
            "depths": [35, 19, 7],
            "drain_capacities": [98, 90, 55],
            "updated_at": "Forecast: +120 minutes",
        },
        180: {
            "rainfall": 30,
            "flood_streets": 5,
            "drainage_alerts": 2,
            "depths": [18, 10, 3],
            "drain_capacities": [78, 70, 38],
            "updated_at": "Forecast: +180 minutes",
        },
    }

    selected = scenario.get(minutes, scenario[0])

    street_template = [
        {
            "id": "road-1",
            "name": "Low-Lying Junction",
            "latitude": 18.5208,
            "longitude": 73.8567,
            "risk": "severe",
            "status": "avoid",
        },
        {
            "id": "road-2",
            "name": "Station Road",
            "latitude": 18.5197,
            "longitude": 73.8585,
            "risk": "high",
            "status": "caution",
        },
        {
            "id": "road-3",
            "name": "Market Lane",
            "latitude": 18.5218,
            "longitude": 73.8546,
            "risk": "safe",
            "status": "open",
        },
    ]

    for index, street in enumerate(street_template):
        street["water_depth_cm"] = selected["depths"][index]

        if street["water_depth_cm"] >= 30:
            street["risk"] = "severe"
            street["status"] = "avoid"
        elif street["water_depth_cm"] >= 15:
            street["risk"] = "high"
            street["status"] = "caution"
        elif street["water_depth_cm"] >= 5:
            street["risk"] = "moderate"
            street["status"] = "monitor"
        else:
            street["risk"] = "safe"
            street["status"] = "open"

    drain_template = [
        {
            "id": "D1",
            "name": "Drain D1",
            "blockage_percent": 60,
            "status": "overflow-risk",
        },
        {
            "id": "D2",
            "name": "Drain D2",
            "blockage_percent": 25,
            "status": "near-capacity",
        },
        {
            "id": "D3",
            "name": "Drain D3",
            "blockage_percent": 0,
            "status": "normal",
        },
    ]

    for index, drain in enumerate(drain_template):
        drain["capacity_percent"] = selected["drain_capacities"][index]

        if drain["capacity_percent"] >= 100:
            drain["status"] = "surcharged"
        elif drain["blockage_percent"] >= 50:
              drain["status"] = "overflow-risk"
        elif drain["capacity_percent"] >= 85:
              drain["status"] = "near-capacity"
        else:
              drain["status"] = "normal"

    return {
        "location": "Pune Ward Demo",
        "updated_at": selected["updated_at"],
        "rainfall_intensity_mm_hr": selected["rainfall"],
        "forecast_window_hours": 3,
        "selected_minutes": minutes,
        "flood_risk_streets": selected["flood_streets"],
        "drainage_alerts": selected["drainage_alerts"],
        "streets": street_template,
        "drains": drain_template,
    }