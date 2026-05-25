"""
/api/interno-dashboard  —  substitui useInternoDashboard.ts no browser.
O frontend pode trocar a chamada direta ao Supabase por este endpoint.
"""

from fastapi import APIRouter
from models.schemas import DashboardFilters, InternoDashboardResponse
from services.interno_dashboard_service import compute_interno_dashboard

router = APIRouter(prefix="/api", tags=["interno-dashboard"])


@router.post("/interno-dashboard", response_model=InternoDashboardResponse)
def interno_dashboard(filters: DashboardFilters):
    return compute_interno_dashboard(filters)
