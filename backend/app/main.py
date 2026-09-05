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
def get_nowcast():
    return {
        "location": "Pune Ward Demo",
        "updated_at": "Live prototype data",
        "rainfall_intensity_mm_hr": 65,
        "forecast_window_hours": 3,
        "flood_risk_streets": 7,
        "drainage_alerts": 3,
        "streets": [
            {
                "id": "road-1",
                "name": "Low-Lying Junction",
                "latitude": 18.5208,
                "longitude": 73.8567,
                "water_depth_cm": 28,
                "risk": "severe",
                "status": "avoid",
            },
            {
                "id": "road-2",
                "name": "Station Road",
                "latitude": 18.5197,
                "longitude": 73.8585,
                "water_depth_cm": 14,
                "risk": "high",
                "status": "caution",
            },
            {
                "id": "road-3",
                "name": "Market Lane",
                "latitude": 18.5218,
                "longitude": 73.8546,
                "water_depth_cm": 4,
                "risk": "safe",
                "status": "open",
            },
        ],
        "drains": [
            {
                "id": "D1",
                "name": "Drain D1",
                "capacity_percent": 96,
                "blockage_percent": 60,
                "status": "overflow-risk",
            },
            {
                "id": "D2",
                "name": "Drain D2",
                "capacity_percent": 87,
                "blockage_percent": 25,
                "status": "near-capacity",
            },
            {
                "id": "D3",
                "name": "Drain D3",
                "capacity_percent": 42,
                "blockage_percent": 0,
                "status": "normal",
            },
        ],
    }