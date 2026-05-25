from pydantic import BaseModel
from typing import Optional, Any


# ── Tipos compartilhados ──────────────────────────────────────────────────────

PUBLICIDADE_CATEGORIES = [
    "AGÊNCIA OFF", "AGÊNCIA ON", "PROMOÇÃO", "PRODUÇÃO GRAFICA",
    "PRODUÇÃO DE COMUNICAÇÃO VISUAL", "PRODUÇÃO AUDIO VISUAL",
    "EVENTOS", "REUNIÕES MENSAIS IMOBS", "MÍDIA ON", "MIDIA OFF",
]

MANUTENCAO_STAND_CATEGORIES = ["DESMOBILIZAÇÃO", "MANUTENÇÃO", "CASA DECORADA"]

INSTITUCIONAL_CATEGORIES = [
    "AGÊNCIA INSTITUCIONAL", "ASSESSORIA DE IMPRENSA", "BRINDES AZO EVS",
    "MIDIA OFF", "EVENTOS | ATIVAÇÃO", "PATROCINIOS", "PRÊMIOS DO MERCADO",
    "SOFTWARE | PLATAFORMAS", "SITE | MANUTENÇÃO", "MARCAS E PATENTE",
    "HOSPEDAGEM/DOMINIOS",
]

PRODUTOS_CATEGORIES = ["PRODUTOS GERAIS"]

PROJECTS_BY_CITY: dict[str, list[str]] = {
    "Rio de Janeiro": ["Gávea", "Ar Ipanema", "Insigna Peninsula", "A Noite"],
    "Campinas": ["Ares Home", "Verter Cambui", "Casa da Mata", "Natus"],
}

ALL_PROJECTS: list[str] = [
    *PROJECTS_BY_CITY["Rio de Janeiro"],
    *PROJECTS_BY_CITY["Campinas"],
]


# ── /api/query ────────────────────────────────────────────────────────────────

class QueryFilter(BaseModel):
    column: str
    operator: str  # eq | ilike | gte | lte | or
    value: Any


class InFilter(BaseModel):
    column: str
    values: list[Any]


class OrderClause(BaseModel):
    column: str
    ascending: bool = True


class QueryRequest(BaseModel):
    table: str
    select: Optional[str] = "*"
    filters: Optional[list[QueryFilter]] = []
    inFilters: Optional[list[InFilter]] = []
    limit: Optional[int] = None
    order: Optional[OrderClause] = None


class QueryResponse(BaseModel):
    data: Optional[list[dict]] = None
    error: Optional[dict] = None


# ── /api/interno-dashboard ────────────────────────────────────────────────────

class DashboardFilters(BaseModel):
    period: str = "Todo o período"
    project: str = "Todos"
    broker: str = "Todos"
    origin: Optional[str] = "Todas"
    status: Optional[str] = "Todos"
    start_date: Optional[str] = None   # YYYY-MM-DD
    end_date: Optional[str] = None     # YYYY-MM-DD
    competences: Optional[list[str]] = ["Atual"]
    city: Optional[str] = None
    interactive_origin: Optional[str] = None
    interactive_cancel_reason: Optional[str] = None
    interactive_month: Optional[str] = None
    interactive_status: Optional[str] = None


class StatusDataItem(BaseModel):
    name: str
    value: int


class FunnelItem(BaseModel):
    name: str
    value: int


class OriginItem(BaseModel):
    name: str
    value: int


class CancelReasonItem(BaseModel):
    reason: str
    count: int


class BrokerLeadItem(BaseModel):
    name: str
    value: int


class BrokerTimeItem(BaseModel):
    name: str
    time: float


class BrokerActionsItem(BaseModel):
    name: str
    actions: int


class HottestStatusData(BaseModel):
    emAtendimento: int = 0
    visita: int = 0
    proposta: int = 0
    reserva: int = 0
    agendamento: int = 0
    venda: int = 0
    descartado: int = 0


class LeadListItem(BaseModel):
    id: str
    nome: str
    empreendimento: Optional[str]
    corretor: Optional[str]
    maxStep: str
    data_entrada: Optional[str]
    status_atual: Optional[str]
    data_update_status: Optional[str]


class InternoDashboardResponse(BaseModel):
    totalLeads: int
    statusData: list[StatusDataItem]
    funnelData: list[FunnelItem]
    stackedStatusData: list[dict]
    availableMonths: list[str]
    originData: list[OriginItem]
    cancelReasons: list[CancelReasonItem]
    brokerLeads: list[BrokerLeadItem]
    brokerTimeData: list[BrokerTimeItem]
    brokerActionsData: list[BrokerActionsItem]
    lineData: list[dict]
    lineChartKeys: list[str]
    hottestStatusData: HottestStatusData
    hottestLeadsList: list[LeadListItem]
    allLeadsList: list[LeadListItem]
    hasSpecificCompetences: bool
    globalAvailableStatuses: list[str]


# ── /api/sienge ───────────────────────────────────────────────────────────────

class SiengeEstoqueResponse(BaseModel):
    vendas: int
    vgv: float
    estoque: int
    vgvEstoque: float


# ── /api/marketing-dashboard ─────────────────────────────────────────────────

class MarketingDashboardFilters(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    city: Optional[str] = "ALL"
    project: Optional[str] = "ALL"


class BarDataItem(BaseModel):
    name: str
    valor: float


class ComboDataItem(BaseModel):
    name: str
    leads: int
    investido: float
    previsto: float


class MarketingDashboardResponse(BaseModel):
    totalPublicidade: float
    totalStand: float
    totalInstitucional: float
    totalProdutos: float
    totalGasto: float
    totalLeads: int
    totalVendas: int
    totalVGV: float
    taxaConversao: float
    leadsPorVenda: float
    barData: list[BarDataItem]
    comboData: list[ComboDataItem]
