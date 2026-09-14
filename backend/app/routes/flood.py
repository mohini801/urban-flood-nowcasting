from fastapi import APIRouter

from app.services.drainage_graph import build_drainage_graph
from app.services.flood_engine import calculate_drain_status

router = APIRouter(prefix="/api/flood", tags=["Flood Nowcasting"])


@router.get("/drains")
def get_drain_status(rainfall_mm_hr: float = 42):
    graph = build_drainage_graph()

    drains = calculate_drain_status(
        graph=graph,
        rainfall_mm_hr=rainfall_mm_hr
    )

    return {
        "rainfall_mm_hr": rainfall_mm_hr,
        "drains": drains
    }