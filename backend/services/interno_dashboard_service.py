"""
Porta completa de useInternoDashboard.ts → Python.
Toda a lógica de cálculo que antes rodava no browser agora roda aqui.
"""

from datetime import date, datetime, timedelta
from calendar import monthrange
from collections import defaultdict
from typing import Any

from db.connection import execute_query
from models.schemas import (
    DashboardFilters,
    InternoDashboardResponse,
    PROJECTS_BY_CITY,
)
from services.status_normalizer import normalize_status, normalize_origin


# ─────────────────────────────────────────────────────────────────────────────
# Helpers de data
# ─────────────────────────────────────────────────────────────────────────────

def _resolve_date_range(filters: DashboardFilters) -> tuple[date, date]:
    today = date.today()

    if filters.period == "Todo o período":
        return date(2020, 1, 1), today

    if filters.period in ("Últimos 30 dias",):
        return today - timedelta(days=30), today

    if filters.period in ("Este mês", "Mês Atual"):
        return today.replace(day=1), today

    if filters.period in ("Mês passado", "Mês Passado"):
        first_of_this = today.replace(day=1)
        last_of_prev = first_of_this - timedelta(days=1)
        return last_of_prev.replace(day=1), last_of_prev

    if filters.period == "Personalizado" and filters.start_date and filters.end_date:
        return (
            date.fromisoformat(filters.start_date),
            date.fromisoformat(filters.end_date),
        )

    # padrão: mês atual
    return today.replace(day=1), today


def _last_day_of_month(d: date) -> date:
    _, last = monthrange(d.year, d.month)
    return d.replace(day=last)


def _month_label(iso_date_str: str) -> str:
    """'2025-03-01' → 'Mar 2025'"""
    MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                   "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    try:
        parts = iso_date_str[:10].split("-")
        year = parts[0]
        month_num = int(parts[1])
        return f"{MONTH_NAMES[month_num - 1]} {year}"
    except Exception:
        return iso_date_str


# ─────────────────────────────────────────────────────────────────────────────
# Busca de dados brutos no Supabase/PostgreSQL
# ─────────────────────────────────────────────────────────────────────────────

def _build_project_filter_sql(filters: DashboardFilters) -> tuple[str, list]:
    """Retorna fragmento SQL e parâmetros para filtrar por empreendimento."""
    if filters.project != "Todos":
        return 'AND "empreendimento" ILIKE %s', [f"%{filters.project}%"]
    if filters.city and filters.city != "ALL":
        city_projects = PROJECTS_BY_CITY.get(filters.city, [])
        if city_projects:
            placeholders = ", ".join(["%s"] * len(city_projects))
            return f'AND "empreendimento" IN ({placeholders})', city_projects
    return "", []


def _fetch_leads(filters: DashboardFilters, start: date, end: date) -> list[dict]:
    proj_sql, proj_params = _build_project_filter_sql(filters)
    broker_sql = ""
    broker_params: list = []
    if filters.broker != "Todos":
        broker_sql = 'AND "corretor" ILIKE %s'
        broker_params = [f"%{filters.broker}%"]

    sql = f"""
        SELECT status_atual, nome, id_cv, data_criacao_cv,
               origem, motivo_cancelamento, corretor, empreendimento, update_at
        FROM "leads"
        WHERE "data_criacao_cv" >= %s
          AND "data_criacao_cv" <= %s
          {proj_sql}
          {broker_sql}
        LIMIT 100000
    """
    params = [
        f"{start.isoformat()}T00:00:00.000Z",
        f"{end.isoformat()}T23:59:59.999Z",
        *proj_params,
        *broker_params,
    ]
    return execute_query(sql, params)


def _fetch_leads_by_ids(lead_ids: list[str], filters: DashboardFilters,
                        start: date, end: date) -> list[dict]:
    if not lead_ids:
        return []
    proj_sql, proj_params = _build_project_filter_sql(filters)
    broker_sql = ""
    broker_params: list = []
    if filters.broker != "Todos":
        broker_sql = 'AND "corretor" ILIKE %s'
        broker_params = [f"%{filters.broker}%"]

    CHUNK = 1000
    rows: list[dict] = []
    for i in range(0, len(lead_ids), CHUNK):
        chunk = lead_ids[i : i + CHUNK]
        placeholders = ", ".join(["%s"] * len(chunk))
        sql = f"""
            SELECT status_atual, nome, id_cv, data_criacao_cv,
                   origem, motivo_cancelamento, corretor, empreendimento, update_at
            FROM "leads"
            WHERE "id_cv" IN ({placeholders})
              AND "data_criacao_cv" >= %s
              AND "data_criacao_cv" <= %s
              {proj_sql}
              {broker_sql}
        """
        params = [
            *chunk,
            f"{start.isoformat()}T00:00:00.000Z",
            f"{end.isoformat()}T23:59:59.999Z",
            *proj_params,
            *broker_params,
        ]
        rows.extend(execute_query(sql, params))
    return rows


def _fetch_snapshot_ids(comp_start: date, comp_end: date) -> list[str]:
    sql = """
        SELECT lead_id FROM "view_lead_snapshot_mensal"
        WHERE "competencia_data" >= %s AND "competencia_data" <= %s
    """
    rows = execute_query(sql, [comp_start.isoformat(), comp_end.isoformat()])
    return list({str(r["lead_id"]) for r in rows if r["lead_id"] is not None})


def _fetch_snapshots_for_leads(lead_ids: list[str]) -> list[dict]:
    if not lead_ids:
        return []
    CHUNK = 500
    rows: list[dict] = []
    for i in range(0, len(lead_ids), CHUNK):
        chunk = lead_ids[i : i + CHUNK]
        placeholders = ", ".join(["%s"] * len(chunk))
        sql = f"""
            SELECT status_final_mes, competencia_data, lead_id
            FROM "view_lead_snapshot_mensal"
            WHERE "lead_id" IN ({placeholders})
        """
        rows.extend(execute_query(sql, chunk))
    return rows


def _fetch_funnel_for_leads(lead_ids: list[str]) -> list[dict]:
    if not lead_ids:
        return []
    CHUNK = 500
    rows: list[dict] = []
    for i in range(0, len(lead_ids), CHUNK):
        chunk = lead_ids[i : i + CHUNK]
        placeholders = ", ".join(["%s"] * len(chunk))
        sql = f"""
            SELECT etapa_visual, lead_id
            FROM "view_funil_maximo_com_total"
            WHERE "lead_id" IN ({placeholders})
        """
        rows.extend(execute_query(sql, chunk))
    return rows


def _fetch_tma_for_leads(lead_ids: list[str]) -> list[dict]:
    if not lead_ids:
        return []
    CHUNK = 500
    rows: list[dict] = []
    for i in range(0, len(lead_ids), CHUNK):
        chunk = lead_ids[i : i + CHUNK]
        placeholders = ", ".join(["%s"] * len(chunk))
        sql = f"""
            SELECT corretor, segundos_espera
            FROM "view_tma_fila_atendimento"
            WHERE "lead_id" IN ({placeholders})
        """
        rows.extend(execute_query(sql, chunk))
    return rows


def _fetch_actions_for_leads(lead_ids: list[str]) -> list[dict]:
    if not lead_ids:
        return []
    CHUNK = 500
    rows: list[dict] = []
    for i in range(0, len(lead_ids), CHUNK):
        chunk = lead_ids[i : i + CHUNK]
        placeholders = ", ".join(["%s"] * len(chunk))
        sql = f"""
            SELECT corretor, lead_id
            FROM "view_esforco_corretor"
            WHERE "lead_id" IN ({placeholders})
        """
        rows.extend(execute_query(sql, chunk))
    return rows


# ─────────────────────────────────────────────────────────────────────────────
# Lógica principal — espelha o useMemo de useInternoDashboard.ts
# ─────────────────────────────────────────────────────────────────────────────

def _is_action(text: str | None) -> bool:
    t = (text or "").lower()
    return "ação" in t or "acao" in t


def _synthetic_funnel(leads: list[dict]) -> list[dict]:
    """
    Gera dados de funil sintético para competências históricas,
    replicando a lógica do bloco hasSpecificCompetences do TS.
    """
    rows = []
    for lead in leads:
        st = (lead.get("status_atual") or "").lower()
        lid = lead["id"]
        rows.append({"lead_id": lid, "etapa_visual": "1. Total de Leads"})
        if "aguardando" not in st:
            rows.append({"lead_id": lid, "etapa_visual": "2. Em Atendimento"})
        if any(x in st for x in ("agendam", "agendado", "visita", "reserva", "proposta", "negocia", "venda", "contrato")):
            rows.append({"lead_id": lid, "etapa_visual": "3. Agendamento"})
        if any(x in st for x in ("visita", "reserva", "proposta", "negocia", "venda", "contrato")):
            rows.append({"lead_id": lid, "etapa_visual": "4. Visita Realizada"})
        if any(x in st for x in ("proposta", "negocia", "reserva", "venda", "contrato")):
            rows.append({"lead_id": lid, "etapa_visual": "5. Proposta / Negociação"})
        if any(x in st for x in ("reserva", "venda", "contrato")):
            rows.append({"lead_id": lid, "etapa_visual": "6. Com Reserva"})
        if any(x in st for x in ("venda", "contrato")):
            rows.append({"lead_id": lid, "etapa_visual": "7. Venda Realizada"})
    return rows


def compute_interno_dashboard(filters: DashboardFilters) -> InternoDashboardResponse:
    start, end = _resolve_date_range(filters)

    has_specific_competences = bool(
        filters.competences
        and "Atual" not in filters.competences
    )

    # ── 1. Busca leads brutos ─────────────────────────────────────────────────
    if has_specific_competences:
        comp_dates = [date.fromisoformat(c[:10]) for c in filters.competences]  # type: ignore
        comp_start = min(comp_dates)
        comp_end = _last_day_of_month(max(comp_dates))
        snap_ids = _fetch_snapshot_ids(comp_start, comp_end)
        raw_leads = _fetch_leads_by_ids(snap_ids, filters, start, end)
    else:
        raw_leads = _fetch_leads(filters, start, end)

    # ── 2. Excluir leads de "ação" ────────────────────────────────────────────
    excluded_ids: set[str] = set()
    for r in raw_leads:
        if any(_is_action(r.get(f)) for f in ("status_atual", "motivo_cancelamento", "origem")):
            if r.get("id_cv"):
                excluded_ids.add(str(r["id_cv"]))

    leads: list[dict] = []
    for r in raw_leads:
        if str(r.get("id_cv")) in excluded_ids:
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
            "motivo_cancelamento": r.get("motivo_cancelamento"),
            "motivo_cancelamento_treated": (r.get("motivo_cancelamento") or "").strip() or None,
            "corretor": r.get("corretor"),
            "empreendimento": r.get("empreendimento"),
            "update_at": str(r["update_at"]) if r.get("update_at") else None,
        })

    lead_ids = [l["id"] for l in leads]

    # ── 3. Busca dados complementares ────────────────────────────────────────
    snapshot_rows = _fetch_snapshots_for_leads(lead_ids)

    if has_specific_competences:
        selected_month_strs = [c[:7] for c in (filters.competences or [])]
        valid_from_snap: dict[str, str] = {}
        for snap in snapshot_rows:
            snap_month = (str(snap.get("competencia_data") or ""))[:7]
            if snap_month in selected_month_strs:
                lid = str(snap["lead_id"])
                st = str(snap.get("status_final_mes") or "")
                if not _is_action(st):
                    valid_from_snap[lid] = st

        leads = [
            {**l, "status_atual": normalize_status(valid_from_snap.get(l["id"], l["status_atual"]))}
            for l in leads
            if l["id"] in valid_from_snap
        ]
        lead_ids = [l["id"] for l in leads]
        funnel_rows = _synthetic_funnel(leads)
    else:
        funnel_rows = _fetch_funnel_for_leads(lead_ids)

    tma_rows = _fetch_tma_for_leads(lead_ids)
    actions_rows = _fetch_actions_for_leads(lead_ids)

    # ── 4. Aplicar filtros globais ────────────────────────────────────────────
    global_available_statuses = sorted({l["status_atual"] or "Sem Status" for l in leads})

    if filters.origin and filters.origin != "Todas":
        leads = [l for l in leads if l["origin_treated"] == filters.origin]
    if filters.status and filters.status != "Todos":
        leads = [l for l in leads if (l["status_atual"] or "Sem Status") == filters.status]

    # Guardar IDs antes dos filtros interativos de mês/status (para o stacked chart)
    leads_without_month_status_ids = {l["id"] for l in leads}

    # ── 5. Filtros interativos ────────────────────────────────────────────────
    if filters.interactive_origin:
        leads = [l for l in leads if l["origin_treated"] == filters.interactive_origin]
    if filters.interactive_cancel_reason:
        leads = [l for l in leads if l["motivo_cancelamento_treated"] == filters.interactive_cancel_reason]

    if filters.interactive_month:
        month_lead_statuses: dict[str, str] = {}
        matching_ids: set[str] = set()
        for snap in snapshot_rows:
            comp = str(snap.get("competencia_data") or "")
            month_str = _month_label(comp)
            st = normalize_status(snap.get("status_final_mes"))
            if month_str == filters.interactive_month:
                if filters.interactive_status:
                    if st == filters.interactive_status:
                        matching_ids.add(str(snap["lead_id"]))
                        month_lead_statuses[str(snap["lead_id"])] = st
                else:
                    matching_ids.add(str(snap["lead_id"]))
                    month_lead_statuses[str(snap["lead_id"])] = st
        leads = [
            {**l, "status_atual": month_lead_statuses.get(l["id"], l["status_atual"])}
            for l in leads
            if l["id"] in matching_ids
        ]
    elif filters.interactive_status:
        leads = [l for l in leads if (l["status_atual"] or "Sem Status") == filters.interactive_status]

    active_lead_ids = {l["id"] for l in leads}

    # ── 6. Contagens de status / origem / cancelamento / corretores ───────────
    status_counts: dict[str, int] = defaultdict(int)
    origin_counts: dict[str, int] = defaultdict(int)
    cancel_counts: dict[str, int] = defaultdict(int)
    broker_counts: dict[str, int] = defaultdict(int)
    line_data_map: dict[str, dict] = {}  # sort_key → {date, empreendimento: count}

    descartados = e_count = a_count = v_count = p_count = c_count = r_count = 0

    funnel_steps: dict[str, int] = {
        "00. Total de Leads": len(leads),
        "01. Em AtendimentoI.A.": 0,
        "02. Aguardando Atendimento Corretor": 0,
        "03. Aguardando Atendimento": 0,
        "04. Em Atendimento": 0,
        "05. 2ºTentativa": 0,
        "06. 3ºTentativa": 0,
        "07. Agendamento": 0,
        "08. Visita Realizada": 0,
        "09. Proposta / Negociação": 0,
        "10. Com Reserva": 0,
        "11. Venda Realizada": 0,
        "12. Descartado": 0,
    }

    MONTH_NAMES_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                      "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    for lead in leads:
        st = lead["status_atual"] or "Sem Status"
        status_counts[st] += 1
        origin_counts[lead["origin_treated"]] += 1

        if lead["motivo_cancelamento_treated"]:
            cancel_counts[lead["motivo_cancelamento_treated"]] += 1

        broker_counts[lead["corretor"] or "Sem Corretor"] += 1

        # funnel step counters
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
        if st in step_map:
            funnel_steps[step_map[st]] += 1

        if st == "Descartado":
            descartados += 1
        elif st == "Em Atendimento":
            e_count += 1
        elif st == "Agendamento":
            a_count += 1
        elif st == "Visita Realizada":
            v_count += 1
        elif st == "Proposta / Negociação":
            p_count += 1
        elif st == "Com Reserva":
            c_count += 1
        elif st == "Venda Realizada":
            r_count += 1

        # line chart data (leads por empreendimento ao longo do tempo)
        cad = lead.get("lead_data_cad") or ""
        if cad and len(cad) >= 7:
            parts = cad[:10].split("-")
            if len(parts) >= 2:
                year = parts[0]
                month_num = int(parts[1])
                if 1 <= month_num <= 12:
                    label = f"{MONTH_NAMES_PT[month_num - 1]} {year}"
                    sort_key = f"{year}-{str(month_num).zfill(2)}"
                    if sort_key not in line_data_map:
                        line_data_map[sort_key] = {"date": label, "sort_key": sort_key}
                    emp = lead.get("empreendimento") or "Outros"
                    line_data_map[sort_key][emp] = line_data_map[sort_key].get(emp, 0) + 1

    # ── 7. Funil (hottest status via view_funil_maximo_com_total) ─────────────
    lead_hottest_score: dict[str, int] = {}
    for row in funnel_rows:
        lid = str(row.get("lead_id"))
        if lid not in active_lead_ids:
            continue
        etapa = (row.get("etapa_visual") or "").lower()
        if _is_action(etapa):
            continue
        score = 0
        if "venda" in etapa:
            score = 4
        elif "proposta" in etapa or "negocia" in etapa:
            score = 3
        elif "visita" in etapa:
            score = 2
        elif "agendamento" in etapa or "agendado" in etapa:
            score = 1
        if score > lead_hottest_score.get(lid, 0):
            lead_hottest_score[lid] = score

    funnelData = [
        {"name": name, "value": value}
        for name, value in sorted(funnel_steps.items())
        if value > 0 or "Total" in name or "Em Atendimento" in name
    ]

    # ── 8. Stacked status (snapshots) ────────────────────────────────────────
    stacked_map: dict[str, dict[str, set]] = defaultdict(lambda: defaultdict(set))
    months_set: set[str] = set()
    month_raw_map: dict[str, str] = {}

    selected_month_strs_for_snap = (
        [c[:7] for c in (filters.competences or [])]
        if has_specific_competences else []
    )

    for snap in snapshot_rows:
        lid = str(snap.get("lead_id"))
        if lid not in leads_without_month_status_ids:
            continue
        st = normalize_status(snap.get("status_final_mes"))
        if _is_action(st):
            continue
        comp = str(snap.get("competencia_data") or "")
        if not comp:
            continue
        if has_specific_competences and comp[:7] not in selected_month_strs_for_snap:
            continue
        month_label = _month_label(comp)
        months_set.add(month_label)
        month_raw_map[month_label] = comp
        stacked_map[st][month_label].add(lid)

    available_months = sorted(months_set, key=lambda m: month_raw_map.get(m, m))
    stacked_status_data = []
    for status, months_dict in stacked_map.items():
        obj: dict[str, Any] = {"status": status}
        total = 0
        for month in available_months:
            count = len(months_dict.get(month, set()))
            obj[month] = count
            total += count
        obj["total"] = total
        if total > 0:
            stacked_status_data.append(obj)
    stacked_status_data.sort(key=lambda x: -x["total"])

    # ── 9. Corretores (TMA e ações) ───────────────────────────────────────────
    broker_tma: dict[str, float] = defaultdict(float)
    broker_tma_count: dict[str, int] = defaultdict(int)
    for row in tma_rows:
        name = row.get("corretor") or "Desconhecido"
        secs = float(row.get("segundos_espera") or row.get("tma_horas") or row.get("tempo_medio") or 0)
        broker_tma[name] += secs
        broker_tma_count[name] += 1

    broker_time_data = sorted(
        [{"name": n, "time": round(broker_tma[n] / broker_tma_count[n], 2)} for n in broker_tma],
        key=lambda x: -x["time"],
    )

    broker_actions_count: dict[str, int] = defaultdict(int)
    for row in actions_rows:
        name = row.get("corretor") or "Desconhecido"
        broker_actions_count[name] += 1

    broker_actions_data = sorted(
        [{"name": n, "actions": c} for n, c in broker_actions_count.items()],
        key=lambda x: -x["actions"],
    )

    # ── 10. Hottest & All leads list ─────────────────────────────────────────
    hottest_leads = []
    all_leads = []
    STEP_LABELS = {1: "Agendamento", 2: "Visita", 3: "Proposta", 4: "Venda"}

    for lead in leads:
        score = lead_hottest_score.get(lead["id"], 0)
        max_step = STEP_LABELS.get(score, "-")
        item = {
            "id": lead["id"],
            "nome": lead["nome"] or "Sem Nome",
            "empreendimento": lead.get("empreendimento"),
            "corretor": lead.get("corretor"),
            "maxStep": max_step,
            "data_entrada": lead.get("lead_data_cad"),
            "status_atual": lead.get("status_atual"),
            "data_update_status": lead.get("update_at"),
        }
        all_leads.append(item)
        if score > 0:
            hottest_leads.append(item)

    # ── 11. Montar resposta ───────────────────────────────────────────────────
    emp_totals: dict[str, int] = defaultdict(int)
    for lead in leads:
        emp = lead.get("empreendimento") or "Outros"
        emp_totals[emp] += 1
    line_chart_keys = [e for e, _ in sorted(emp_totals.items(), key=lambda x: -x[1])]

    return InternoDashboardResponse(
        totalLeads=len(leads),
        statusData=sorted(
            [{"name": n, "value": v} for n, v in status_counts.items()],
            key=lambda x: -x["value"],  # type: ignore
        ),
        funnelData=funnelData,  # type: ignore
        stackedStatusData=stacked_status_data,
        availableMonths=available_months,
        originData=sorted(
            [{"name": n, "value": v} for n, v in origin_counts.items()],
            key=lambda x: -x["value"],  # type: ignore
        ),
        cancelReasons=sorted(
            [{"reason": r, "count": c} for r, c in cancel_counts.items()],
            key=lambda x: -x["count"],  # type: ignore
        ),
        brokerLeads=sorted(
            [{"name": n, "value": v} for n, v in broker_counts.items()],
            key=lambda x: -x["value"],  # type: ignore
        ),
        brokerTimeData=broker_time_data,  # type: ignore
        brokerActionsData=broker_actions_data,  # type: ignore
        lineData=sorted(line_data_map.values(), key=lambda x: x["sort_key"]),
        lineChartKeys=line_chart_keys,
        hottestStatusData={  # type: ignore
            "emAtendimento": e_count,
            "visita": v_count,
            "proposta": p_count,
            "reserva": c_count,
            "agendamento": a_count,
            "venda": r_count,
            "descartado": descartados,
        },
        hottestLeadsList=hottest_leads,  # type: ignore
        allLeadsList=all_leads,  # type: ignore
        hasSpecificCompetences=has_specific_competences,
        globalAvailableStatuses=global_available_statuses,
    )
