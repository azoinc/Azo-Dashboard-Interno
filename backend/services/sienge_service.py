"""
Porta de siengeService.ts → Python.
Todas as chamadas à API Sienge passam por aqui no servidor.
As credenciais nunca saem do backend (sem VITE_ prefix).
"""

import httpx
import base64
from config.settings import settings


def _get_base_url() -> str:
    return f"https://api.sienge.com.br/{settings.sienge_subdomain}/api/v1"


def _get_headers() -> dict:
    credentials = base64.b64encode(
        f"{settings.sienge_username}:{settings.sienge_password}".encode()
    ).decode()
    return {
        "Authorization": f"Basic {credentials}",
        "Content-Type": "application/json",
    }


def _is_configured() -> bool:
    return bool(settings.sienge_subdomain and settings.sienge_username)


async def get_empreendimentos() -> list[dict]:
    if not _is_configured():
        return []
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{_get_base_url()}/enterprises", headers=_get_headers())
        resp.raise_for_status()
        return resp.json().get("results", [])


async def get_estoque(enterprise_id: int) -> dict:
    if not _is_configured():
        return {"total": 0, "disponiveis": 0, "vgvEstoque": 0.0}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{_get_base_url()}/enterprises/{enterprise_id}/units",
            headers=_get_headers(),
        )
        resp.raise_for_status()
        data = resp.json()

    units = data.get("results") or []
    disponiveis = [
        u for u in units
        if "VENDID" not in str(u.get("status", "")).upper()
        and str(u.get("status", "")).upper() not in ("VENDIDA", "SOLD")
    ]

    def _unit_value(u: dict) -> float:
        for key in (
            "vgv", "basePrice", "price", "salePrice", "suggestedPrice",
            "contractValue", "value", "cubPrice", "appraisalValue",
        ):
            if u.get(key):
                return float(u[key])
        if u.get("prices"):
            return float(u["prices"][0].get("value", 0))
        if u.get("pricing"):
            return float(u["pricing"].get("value") or u["pricing"].get("price") or 0)
        return 0.0

    vgv_estoque = sum(_unit_value(u) for u in disponiveis)
    return {
        "total": data.get("metadata", {}).get("total", 0),
        "disponiveis": len(disponiveis),
        "vgvEstoque": vgv_estoque,
    }


async def get_vendas(start_date: str, end_date: str) -> dict:
    if not _is_configured():
        return {"vendas": 0, "vgv": 0.0}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{_get_base_url()}/commercial-contracts",
            params={"startDate": start_date, "endDate": end_date},
            headers=_get_headers(),
        )
        resp.raise_for_status()
        data = resp.json()

    results = data.get("results") or []
    vgv = sum(float(r.get("contractValue") or 0) for r in results)
    return {"vendas": len(results), "vgv": vgv}


async def get_custos_marketing(start_date: str, end_date: str) -> list[dict]:
    if not _is_configured():
        return []
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{_get_base_url()}/bills",
            params={"paymentDateStart": start_date, "paymentDateEnd": end_date},
            headers=_get_headers(),
        )
        resp.raise_for_status()
        return resp.json().get("results", [])


async def get_sienge_summary(start_date: str, end_date: str) -> dict:
    """
    Agrega tudo em uma única chamada ao backend.
    Substitui o Promise.all de useSiengeIntegration.ts.
    """
    if not _is_configured():
        return {"vendas": 0, "vgv": 0.0, "estoque": 0, "vgvEstoque": 0.0, "custos": []}

    import asyncio

    enterprises, vendas_data, custos_data = await asyncio.gather(
        get_empreendimentos(),
        get_vendas(start_date, end_date),
        get_custos_marketing(start_date, end_date),
    )

    estoque_results = await asyncio.gather(
        *[get_estoque(emp["id"]) for emp in enterprises]
    )

    total_disponiveis = sum(e["disponiveis"] for e in estoque_results)
    total_vgv_estoque = sum(e["vgvEstoque"] for e in estoque_results)

    return {
        "vendas": vendas_data["vendas"],
        "vgv": vendas_data["vgv"],
        "estoque": total_disponiveis,
        "vgvEstoque": total_vgv_estoque,
        "custos": custos_data,
    }
