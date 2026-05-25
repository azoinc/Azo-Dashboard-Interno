import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "_lib"))

import json
from http.server import BaseHTTPRequestHandler
from cors import json_response, CORS_HEADERS
from db import execute_query
from status_normalizer import normalize_status, normalize_origin
from datetime import date, timedelta
from calendar import monthrange
from collections import defaultdict


# ── helpers ───────────────────────────────────────────────────────────────────

PROJECTS_BY_CITY = {
    "Rio de Janeiro": ["Gávea", "Ar Ipanema", "Insigna Peninsula", "A Noite"],
    "Campinas": ["Ares Home", "Verter Cambui", "Casa da Mata", "Natus"],
}

MONTH_NAMES_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                  "Jul", "Ago", "Set", "Out", "Nov", "Dez"]


def _month_label(iso: str) -> str:
    try:
        parts = iso[:10].split("-")
        return f"{MONTH_NAMES_PT[int(parts[1]) - 1]} {parts[0]}"
    except Exception:
        return iso


def _last_day(d: date) -> date:
    _, last = monthrange(d.year, d.month)
    return d.replace(day=last)


def _is_action(text) -> bool:
    t = (text or "").lower()
    return "ação" in t or "acao" in t


def _resolve_dates(f: dict) -> tuple[date, date]:
    today = date.today()
    period = f.get("period", "Todo o período")
    if period == "Todo o período":
        return date(2020, 1, 1), today
    if period in ("Últimos 30 dias",):
        return today - timedelta(days=30), today
    if period in ("Este mês", "Mês Atual"):
        return today.replace(day=1), today
    if period in ("Mês passado", "Mês Passado"):
        first = today.replace(day=1)
        last_prev = first - timedelta(days=1)
        return last_prev.replace(day=1), last_prev
    if period == "Personalizado" and f.get("start_date") and f.get("end_date"):
        return date.fromisoformat(f["start_date"]), date.fromisoformat(f["end_date"])
    return today.replace(day=1), today


def _proj_sql(f: dict) -> tuple[str, list]:
    project = f.get("project", "Todos")
    city = f.get("city")
    if project != "Todos":
        return 'AND "empreendimento" ILIKE %s', [f"%{project}%"]
    if city and city != "ALL":
        projs = PROJECTS_BY_CITY.get(city, [])
        if projs:
            phs = ", ".join(["%s"] * len(projs))
            return f'AND "empreendimento" IN ({phs})', projs
    return "", []


def _qry(table, select, extra_sql, params, limit=100000) -> list[dict]:
    sql = f'SELECT {select} FROM "{table}" WHERE 1=1 {extra_sql} LIMIT {limit}'
    return execute_query(sql, params)


def _chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def compute(f: dict) -> dict:
    start, end = _resolve_dates(f)
    competences = f.get("competences") or ["Atual"]
    has_comp = bool(competences) and "Atual" not in competences

    proj_sql, proj_params = _proj_sql(f)
    broker_sql = ""
    broker_params: list = []
    if f.get("broker", "Todos") != "Todos":
        broker_sql = 'AND "corretor" ILIKE %s'
        broker_params = [f"%{f['broker']}%"]

    date_params = [
        f"{start.isoformat()}T00:00:00.000Z",
        f"{end.isoformat()}T23:59:59.999Z",
    ]

    # ── 1. leads brutos ───────────────────────────────────────────────────────
    if has_comp:
        comp_dates = [date.fromisoformat(c[:10]) for c in competences]
        comp_start = min(comp_dates)
        comp_end = _last_day(max(comp_dates))
        snap_rows = _qry(
            "view_lead_snapshot_mensal", "lead_id",
            "AND competencia_data >= %s AND competencia_data <= %s",
            [comp_start.isoformat(), comp_end.isoformat()]
        )
        snap_ids = list({str(r["lead_id"]) for r in snap_rows if r["lead_id"] is not None})

        raw_leads: list[dict] = []
        for chunk in _chunks(snap_ids, 1000):
            phs = ", ".join(["%s"] * len(chunk))
            extra = (
                f'AND "id_cv" IN ({phs})'
                f' AND "data_criacao_cv" >= %s AND "data_criacao_cv" <= %s'
                f' {proj_sql} {broker_sql}'
            )
            raw_leads.extend(_qry(
                "leads",
                "status_atual, nome, id_cv, data_criacao_cv, origem, motivo_cancelamento, corretor, empreendimento, update_at",
                extra, [*chunk, *date_params, *proj_params, *broker_params]
            ))
    else:
        extra = f'AND "data_criacao_cv" >= %s AND "data_criacao_cv" <= %s {proj_sql} {broker_sql}'
        raw_leads = _qry(
            "leads",
            "status_atual, nome, id_cv, data_criacao_cv, origem, motivo_cancelamento, corretor, empreendimento, update_at",
            extra, [*date_params, *proj_params, *broker_params]
        )

    # ── 2. excluir "ação" e normalizar ────────────────────────────────────────
    excluded = {
        str(r["id_cv"])
        for r in raw_leads
        if any(_is_action(r.get(k)) for k in ("status_atual", "motivo_cancelamento", "origem"))
        and r.get("id_cv")
    }

    leads = []
    for r in raw_leads:
        if str(r.get("id_cv")) in excluded:
            continue
        st = normalize_status(r.get("status_atual"))
        if _is_action(st):
            continue
        leads.append({
            "id": str(r["id_cv"]),
            "nome": r.get("nome"),
            "status_atual": st,
            "lead_data_cad": str(r["data_criacao_cv"]) if r.get("data_criacao_cv") else None,
            "origem": r.get("origem"),
            "origin_treated": normalize_origin(r.get("origem")),
            "motivo_cancelamento_treated": (r.get("motivo_cancelamento") or "").strip() or None,
            "corretor": r.get("corretor"),
            "empreendimento": r.get("empreendimento"),
            "update_at": str(r["update_at"]) if r.get("update_at") else None,
        })

    lead_ids = [l["id"] for l in leads]

    # ── 3. dados complementares ───────────────────────────────────────────────
    snapshot_rows: list[dict] = []
    funnel_rows: list[dict] = []
    tma_rows: list[dict] = []
    actions_rows: list[dict] = []

    for chunk in _chunks(lead_ids, 500):
        phs = ", ".join(["%s"] * len(chunk))
        snapshot_rows.extend(_qry("view_lead_snapshot_mensal", "status_final_mes, competencia_data, lead_id", f'AND "lead_id" IN ({phs})', chunk))
        funnel_rows.extend(_qry("view_funil_maximo_com_total", "etapa_visual, lead_id", f'AND "lead_id" IN ({phs})', chunk))
        tma_rows.extend(_qry("view_tma_fila_atendimento", "corretor, segundos_espera", f'AND "lead_id" IN ({phs})', chunk))
        actions_rows.extend(_qry("view_esforco_corretor", "corretor, lead_id", f'AND "lead_id" IN ({phs})', chunk))

    # ── 4. override status com snapshot para competências históricas ──────────
    if has_comp:
        selected_months = [c[:7] for c in competences]
        valid: dict[str, str] = {}
        for snap in snapshot_rows:
            snap_month = str(snap.get("competencia_data") or "")[:7]
            if snap_month in selected_months:
                lid = str(snap["lead_id"])
                st = str(snap.get("status_final_mes") or "")
                if not _is_action(st):
                    valid[lid] = st
        leads = [
            {**l, "status_atual": normalize_status(valid.get(l["id"], l["status_atual"]))}
            for l in leads if l["id"] in valid
        ]
        lead_ids = [l["id"] for l in leads]

        # funil sintético
        funnel_rows = []
        for lead in leads:
            st = (lead["status_atual"] or "").lower()
            lid = lead["id"]
            funnel_rows.append({"lead_id": lid, "etapa_visual": "1. Total de Leads"})
            if "aguardando" not in st:
                funnel_rows.append({"lead_id": lid, "etapa_visual": "2. Em Atendimento"})
            if any(x in st for x in ("agendam", "agendado", "visita", "reserva", "proposta", "negocia", "venda", "contrato")):
                funnel_rows.append({"lead_id": lid, "etapa_visual": "3. Agendamento"})
            if any(x in st for x in ("visita", "reserva", "proposta", "negocia", "venda", "contrato")):
                funnel_rows.append({"lead_id": lid, "etapa_visual": "4. Visita Realizada"})
            if any(x in st for x in ("proposta", "negocia", "reserva", "venda", "contrato")):
                funnel_rows.append({"lead_id": lid, "etapa_visual": "5. Proposta / Negociação"})
            if any(x in st for x in ("reserva", "venda", "contrato")):
                funnel_rows.append({"lead_id": lid, "etapa_visual": "6. Com Reserva"})
            if any(x in st for x in ("venda", "contrato")):
                funnel_rows.append({"lead_id": lid, "etapa_visual": "7. Venda Realizada"})

    global_statuses = sorted({l["status_atual"] or "Sem Status" for l in leads})

    # ── 5. filtros globais ────────────────────────────────────────────────────
    origin_filter = f.get("origin")
    if origin_filter and origin_filter != "Todas":
        leads = [l for l in leads if l["origin_treated"] == origin_filter]
    if f.get("status") and f.get("status") != "Todos":
        leads = [l for l in leads if (l["status_atual"] or "Sem Status") == f["status"]]

    leads_before_month = {l["id"] for l in leads}

    if f.get("interactive_origin"):
        leads = [l for l in leads if l["origin_treated"] == f["interactive_origin"]]
    if f.get("interactive_cancel_reason"):
        leads = [l for l in leads if l["motivo_cancelamento_treated"] == f["interactive_cancel_reason"]]

    if f.get("interactive_month"):
        month_statuses: dict[str, str] = {}
        matching: set[str] = set()
        for snap in snapshot_rows:
            lbl = _month_label(str(snap.get("competencia_data") or ""))
            st = normalize_status(snap.get("status_final_mes"))
            if lbl == f["interactive_month"]:
                if f.get("interactive_status"):
                    if st == f["interactive_status"]:
                        matching.add(str(snap["lead_id"]))
                        month_statuses[str(snap["lead_id"])] = st
                else:
                    matching.add(str(snap["lead_id"]))
                    month_statuses[str(snap["lead_id"])] = st
        leads = [
            {**l, "status_atual": month_statuses.get(l["id"], l["status_atual"])}
            for l in leads if l["id"] in matching
        ]
    elif f.get("interactive_status"):
        leads = [l for l in leads if (l["status_atual"] or "Sem Status") == f["interactive_status"]]

    active_ids = {l["id"] for l in leads}

    # ── 6. contagens ──────────────────────────────────────────────────────────
    status_counts: dict[str, int] = defaultdict(int)
    origin_counts: dict[str, int] = defaultdict(int)
    cancel_counts: dict[str, int] = defaultdict(int)
    broker_counts: dict[str, int] = defaultdict(int)
    line_map: dict[str, dict] = {}

    funnel_steps = {
        "00. Total de Leads": len(leads),
        "01. Em AtendimentoI.A.": 0, "02. Aguardando Atendimento Corretor": 0,
        "03. Aguardando Atendimento": 0, "04. Em Atendimento": 0,
        "05. 2ºTentativa": 0, "06. 3ºTentativa": 0,
        "07. Agendamento": 0, "08. Visita Realizada": 0,
        "09. Proposta / Negociação": 0, "10. Com Reserva": 0,
        "11. Venda Realizada": 0, "12. Descartado": 0,
    }
    step_map = {
        "Em AtendimentoI.A.": "01. Em AtendimentoI.A.",
        "Aguardando Atendimento Corretor": "02. Aguardando Atendimento Corretor",
        "Aguardando Atendimento": "03. Aguardando Atendimento",
        "Em Atendimento": "04. Em Atendimento",
        "2ºTentativa": "05. 2ºTentativa",
        "3ºTentativa": "06. 3ºTentativa",
        "Agendamento": "07. Agendamento",
        "Visita Realizada": "08. Visita Realizada",
        "Proposta / Negociação": "09. Proposta / Negociação",
        "Com Reserva": "10. Com Reserva",
        "Venda Realizada": "11. Venda Realizada",
        "Descartado": "12. Descartado",
    }

    e_count = a_count = v_count = p_count = c_count = r_count = desc_count = 0

    for lead in leads:
        st = lead["status_atual"] or "Sem Status"
        status_counts[st] += 1
        origin_counts[lead["origin_treated"]] += 1
        if lead["motivo_cancelamento_treated"]:
            cancel_counts[lead["motivo_cancelamento_treated"]] += 1
        broker_counts[lead["corretor"] or "Sem Corretor"] += 1
        if st in step_map:
            funnel_steps[step_map[st]] += 1
        if st == "Descartado": desc_count += 1
        elif st == "Em Atendimento": e_count += 1
        elif st == "Agendamento": a_count += 1
        elif st == "Visita Realizada": v_count += 1
        elif st == "Proposta / Negociação": p_count += 1
        elif st == "Com Reserva": c_count += 1
        elif st == "Venda Realizada": r_count += 1

        cad = lead.get("lead_data_cad") or ""
        if len(cad) >= 7:
            parts = cad[:10].split("-")
            if len(parts) >= 2 and 1 <= int(parts[1]) <= 12:
                lbl = f"{MONTH_NAMES_PT[int(parts[1])-1]} {parts[0]}"
                sk = f"{parts[0]}-{parts[1].zfill(2)}"
                if sk not in line_map:
                    line_map[sk] = {"date": lbl, "sort_key": sk}
                emp = lead.get("empreendimento") or "Outros"
                line_map[sk][emp] = line_map[sk].get(emp, 0) + 1

    # ── 7. funil hottest ──────────────────────────────────────────────────────
    hottest_score: dict[str, int] = {}
    for row in funnel_rows:
        lid = str(row.get("lead_id"))
        if lid not in active_ids:
            continue
        etapa = (row.get("etapa_visual") or "").lower()
        if _is_action(etapa):
            continue
        score = 0
        if "venda" in etapa: score = 4
        elif "proposta" in etapa or "negocia" in etapa: score = 3
        elif "visita" in etapa: score = 2
        elif "agendamento" in etapa or "agendado" in etapa: score = 1
        if score > hottest_score.get(lid, 0):
            hottest_score[lid] = score

    funnel_data = [
        {"name": n, "value": v}
        for n, v in sorted(funnel_steps.items())
        if v > 0 or "Total" in n or "Em Atendimento" in n
    ]

    # ── 8. stacked status (snapshots) ─────────────────────────────────────────
    stacked_map: dict[str, dict[str, set]] = defaultdict(lambda: defaultdict(set))
    months_set: set[str] = set()
    month_raw: dict[str, str] = {}
    sel_months = [c[:7] for c in competences] if has_comp else []

    for snap in snapshot_rows:
        lid = str(snap.get("lead_id"))
        if lid not in leads_before_month:
            continue
        st = normalize_status(snap.get("status_final_mes"))
        if _is_action(st):
            continue
        comp = str(snap.get("competencia_data") or "")
        if not comp:
            continue
        if has_comp and comp[:7] not in sel_months:
            continue
        lbl = _month_label(comp)
        months_set.add(lbl)
        month_raw[lbl] = comp
        stacked_map[st][lbl].add(lid)

    available_months = sorted(months_set, key=lambda m: month_raw.get(m, m))
    stacked_data = []
    for st, months_dict in stacked_map.items():
        obj: dict = {"status": st}
        total = 0
        for m in available_months:
            c = len(months_dict.get(m, set()))
            obj[m] = c
            total += c
        obj["total"] = total
        if total > 0:
            stacked_data.append(obj)
    stacked_data.sort(key=lambda x: -x["total"])

    # ── 9. corretores ─────────────────────────────────────────────────────────
    tma_sum: dict[str, float] = defaultdict(float)
    tma_cnt: dict[str, int] = defaultdict(int)
    for row in tma_rows:
        n = row.get("corretor") or "Desconhecido"
        secs = float(row.get("segundos_espera") or 0)
        tma_sum[n] += secs
        tma_cnt[n] += 1

    broker_time = sorted(
        [{"name": n, "time": round(tma_sum[n] / tma_cnt[n], 2)} for n in tma_sum],
        key=lambda x: -x["time"]
    )

    actions_cnt: dict[str, int] = defaultdict(int)
    for row in actions_rows:
        actions_cnt[row.get("corretor") or "Desconhecido"] += 1
    broker_actions = sorted(
        [{"name": n, "actions": c} for n, c in actions_cnt.items()],
        key=lambda x: -x["actions"]
    )

    # ── 10. hottest & all leads list ──────────────────────────────────────────
    STEP_LABELS = {1: "Agendamento", 2: "Visita", 3: "Proposta", 4: "Venda"}
    hottest_list, all_list = [], []
    for lead in leads:
        score = hottest_score.get(lead["id"], 0)
        item = {
            "id": lead["id"], "nome": lead["nome"] or "Sem Nome",
            "empreendimento": lead.get("empreendimento"),
            "corretor": lead.get("corretor"),
            "maxStep": STEP_LABELS.get(score, "-"),
            "data_entrada": lead.get("lead_data_cad"),
            "status_atual": lead.get("status_atual"),
            "data_update_status": lead.get("update_at"),
        }
        all_list.append(item)
        if score > 0:
            hottest_list.append(item)

    emp_totals: dict[str, int] = defaultdict(int)
    for lead in leads:
        emp_totals[lead.get("empreendimento") or "Outros"] += 1
    line_keys = [e for e, _ in sorted(emp_totals.items(), key=lambda x: -x[1])]

    return {
        "totalLeads": len(leads),
        "statusData": sorted([{"name": n, "value": v} for n, v in status_counts.items()], key=lambda x: -x["value"]),
        "funnelData": funnel_data,
        "stackedStatusData": stacked_data,
        "availableMonths": available_months,
        "originData": sorted([{"name": n, "value": v} for n, v in origin_counts.items()], key=lambda x: -x["value"]),
        "cancelReasons": sorted([{"reason": r, "count": c} for r, c in cancel_counts.items()], key=lambda x: -x["count"]),
        "brokerLeads": sorted([{"name": n, "value": v} for n, v in broker_counts.items()], key=lambda x: -x["value"]),
        "brokerTimeData": broker_time,
        "brokerActionsData": broker_actions,
        "lineData": sorted(line_map.values(), key=lambda x: x["sort_key"]),
        "lineChartKeys": line_keys,
        "hottestStatusData": {"emAtendimento": e_count, "visita": v_count, "proposta": p_count, "reserva": c_count, "agendamento": a_count, "venda": r_count, "descartado": desc_count},
        "hottestLeadsList": hottest_list,
        "allLeadsList": all_list,
        "hasSpecificCompetences": has_comp,
        "globalAvailableStatuses": global_statuses,
    }


class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            result = compute(body)
            json_response(self, result)
        except Exception as exc:
            import traceback
            json_response(self, {"error": str(exc), "trace": traceback.format_exc()}, 500)

    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.end_headers()

    def log_message(self, format, *args):
        pass
