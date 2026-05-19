export interface Lead {
  id_cv: string;
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
  midia: string;
}

export interface LeadSnapshot {
  lead_id: string;
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
