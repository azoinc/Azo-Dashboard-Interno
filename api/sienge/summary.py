import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "_lib"))

import json
import base64
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from cors import json_response, CORS_HEADERS
import httpx


def _subdomain():
    return os.environ.get("SIENGE_SUBDOMAIN", "")


def _headers():
    user = os.environ.get("SIENGE_USERNAME", "")
    pwd = os.environ.get("SIENGE_PASSWORD", "")
    creds = base64.b64encode(f"{user}:{pwd}".encode()).decode()
    return {"Authorization": f"Basic {creds}", "Content-Type": "application/json"}


def _base():
    return f"https://api.sienge.com.br/{_subdomain()}/api/v1"


def _configured():
    return bool(_subdomain() and os.environ.get("SIENGE_USERNAME"))


async def _get(url, params=None):
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(url, headers=_headers(), params=params)
        r.raise_for_status()
        return r.json()


def _get_sync(url, params=None):
    with httpx.Client(timeout=30) as client:
        r = client.get(url, headers=_headers(), params=params)
        r.raise_for_status()
        return r.json()


def _unit_value(u: dict) -> float:
    for k in ("vgv", "basePrice", "price", "salePrice", "suggestedPrice", "contractValue", "value"):
        if u.get(k):
            return float(u[k])
    if u.get("prices"):
        return float(u["prices"][0].get("value", 0))
    return 0.0


def get_summary(start_date: str, end_date: str) -> dict:
    if not _configured():
        return {"vendas": 0, "vgv": 0.0, "estoque": 0, "vgvEstoque": 0.0, "custos": []}

    base = _base()
    enterprises = _get_sync(f"{base}/enterprises").get("results", [])
    vendas_data = _get_sync(f"{base}/commercial-contracts", {"startDate": start_date, "endDate": end_date})
    custos_data = _get_sync(f"{base}/bills", {"paymentDateStart": start_date, "paymentDateEnd": end_date})

    total_disp = 0
    total_vgv_est = 0.0
    for emp in enterprises:
        units_data = _get_sync(f"{base}/enterprises/{emp['id']}/units")
        units = units_data.get("results") or []
        avail = [u for u in units if "VENDID" not in str(u.get("status", "")).upper()]
        total_disp += len(avail)
        total_vgv_est += sum(_unit_value(u) for u in avail)

    results = vendas_data.get("results") or []
    vgv = sum(float(r.get("contractValue") or 0) for r in results)

    return {
        "vendas": len(results),
        "vgv": vgv,
        "estoque": total_disp,
        "vgvEstoque": total_vgv_est,
        "custos": custos_data.get("results") or [],
    }


class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            parsed = urlparse(self.path)
            qs = parse_qs(parsed.query)
            start = (qs.get("startDate") or qs.get("start_date") or [""])[0]
            end = (qs.get("endDate") or qs.get("end_date") or [""])[0]
            if not start or not end:
                json_response(self, {"error": "startDate e endDate são obrigatórios"}, 400)
                return
            result = get_summary(start, end)
            json_response(self, result)
        except Exception as exc:
            json_response(self, {"error": str(exc)}, 500)

    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.end_headers()

    def log_message(self, format, *args):
        pass
