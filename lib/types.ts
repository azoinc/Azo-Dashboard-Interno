// Tabela: leads
export interface Lead {
  id_cv: number;
  nome: string;
  status_atual: string;
  data_criacao_cv: string;
  hora_criacao_cv: string;
  data_cancelamento: string | null;
  hora_cancelamento: string | null;
  motivo_cancelamento: string | null;
  submotivo_cancelamento: string | null;
  descricao_motivo_cancelamento: string | null;
  update_at: string;
  corretor: string;
  empreendimento: string;
  origem: string;
  midia: string | null;
}

// Tabela: lead_milestones — cada linha = um evento de transição de status
export interface LeadMilestoneEvent {
  id: number;
  id_historico_cv: number;
  lead_id: number;
  lead_nome: string;
  empreendimento: string;
  origem: string;
  status: string;          // status atual nesse evento
  de_nome: string;         // status anterior
  para_nome: string;       // status que foi atribuído (= status)
  motivo_cancelamento: string | null;
  data_cancelamento: string | null;
  hora_cancelamento: string | null;
  corretor: string;
  lead_data_cad: string;
  hora_lead_data_cad: string;
  referencia_data: string;
  hora_referencia_data: string;
  ativo: string;
}

// View: view_lead_snapshot_mensal — status final do lead em cada mês de competência
export interface LeadSnapshotMensal {
  lead_id: number;
  lead_nome: string;
  origem: string;
  empreendimento: string;
  lead_data_cad: string;
  safra_data: string;
  competencia_data: string;
  status_final_mes: string;
  corretor: string;
  evento_data: string;
}

// View: view_lead_snapshot_max_funil — status máximo do lead em cada mês
export interface LeadSnapshotMaxFunil {
  lead_id: number;
  lead_nome: string;
  origem: string;
  empreendimento: string;
  lead_data_cad: string;
  safra_data: string;
  competencia_data: string;
  status_maximo_mes: string;
  corretor: string;
  evento_data: string;
}

// Mantido para compatibilidade
export type LeadSnapshot = LeadSnapshotMensal;

export interface Metrics {
  leads: number;
  descartes: number;
  em_atendimento: number;
  agendamento: number;
  visita: number;
  venda: number;
}

export interface MonthlyMetrics {
  mes: string;
  empreendimento: string;
  metrics: Metrics;
}

export interface AggregatedMetrics {
  byEmp: Record<string, Metrics>;
  byMonth: Record<string, Metrics>;
  total: Metrics;
}

export interface Investment {
  empreendimento: string;
  mes_ref: string;
  valor: number;
}

export interface DashboardFilters {
  empreendimentos: string[];
  periodo: {
    inicio: string;
    fim: string;
  };
}

// @deprecated — use LeadMilestoneEvent (tabela lead_milestones real) ou LeadSnapshotMensal (view)
export type LeadMilestone = LeadMilestoneEvent;
