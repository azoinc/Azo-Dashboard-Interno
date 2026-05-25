"""
/api/sienge  —  substitui siengeService.ts no browser.
Credenciais ficam apenas no servidor; nada de VITE_ no frontend.
"""

from fastapi import APIRouter, Query
from models.schemas import SiengeEstoqueResponse
from services import sienge_service

router = APIRouter(prefix="/api/sienge", tags=["sienge"])


@router.get("/summary", response_model=SiengeEstoqueResponse)
async def sienge_summary(
    start_date: str = Query(..., alias="startDate", description="YYYY-MM-DD"),
    end_date: str = Query(..., alias="endDate", description="YYYY-MM-DD"),
):
    result = await sienge_service.get_sienge_summary(start_date, end_date)
    return SiengeEstoqueResponse(**result)


@router.get("/enterprises")
async def sienge_enterprises():
    return await sienge_service.get_empreendimentos()


@router.get("/enterprises/{enterprise_id}/units")
async def sienge_units(enterprise_id: int):
    return await sienge_service.get_estoque(enterprise_id)


@router.get("/vendas")
async def sienge_vendas(
    start_date: str = Query(..., alias="startDate"),
    end_date: str = Query(..., alias="endDate"),
):
    return await sienge_service.get_vendas(start_date, end_date)


@router.get("/custos")
async def sienge_custos(
    start_date: str = Query(..., alias="startDate"),
    end_date: str = Query(..., alias="endDate"),
):
    return await sienge_service.get_custos_marketing(start_date, end_date)
