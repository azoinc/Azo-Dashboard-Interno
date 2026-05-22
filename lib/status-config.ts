// Mapeamento canônico de status de leads com score de calor
// Score mais alto = lead mais quente / avançado no funil

export interface StatusConfig {
  label: string;
  score: number;
  color: string;       // Tailwind bg color (usado em badges/barras)
  textColor: string;   // Tailwind text color
}

export const STATUS_MAP: Record<string, StatusConfig> = {
  'Descartado': {
    label: 'Descartado',
    score: -99,
    color: 'bg-zinc-700',
    textColor: 'text-zinc-300',
  },
  'Em Atendimento I.A': {
    label: 'Em Atendimento I.A',
    score: 1,
    color: 'bg-slate-600',
    textColor: 'text-slate-200',
  },
  'Aguardando Atendimento do Corretor': {
    label: 'Aguardando Atendimento do Corretor',
    score: 2,
    color: 'bg-blue-800',
    textColor: 'text-blue-200',
  },
  '2ª Tentativa de Contato': {
    label: '2ª Tentativa de Contato',
    score: 3.01,
    color: 'bg-cyan-700',
    textColor: 'text-cyan-200',
  },
  '3ª Tentativa de Contato': {
    label: '3ª Tentativa de Contato',
    score: 3.02,
    color: 'bg-teal-700',
    textColor: 'text-teal-200',
  },
  '4ª Tentativa de Contato': {
    label: '4ª Tentativa de Contato',
    score: 3.03,
    color: 'bg-teal-600',
    textColor: 'text-teal-100',
  },
  'Em Atendimento': {
    label: 'Em Atendimento',
    score: 3.09,
    color: 'bg-indigo-600',
    textColor: 'text-indigo-100',
  },
  'Agendamento': {
    label: 'Agendamento',
    score: 4,
    color: 'bg-violet-600',
    textColor: 'text-violet-100',
  },
  'Visita Realizada': {
    label: 'Visita Realizada',
    score: 5,
    color: 'bg-amber-600',
    textColor: 'text-amber-100',
  },
  'Em Tratativa': {
    label: 'Em Tratativa',
    score: 6,
    color: 'bg-orange-500',
    textColor: 'text-orange-100',
  },
  'Com Reserva': {
    label: 'Com Reserva',
    score: 7,
    color: 'bg-rose-500',
    textColor: 'text-rose-100',
  },
  'Venda Realizada': {
    label: 'Venda Realizada',
    score: 8,
    color: 'bg-green-600',
    textColor: 'text-green-100',
  },
};

// Aliases para variantes de escrita encontradas no banco
export const STATUS_ALIASES: Record<string, string> = {
  'Descartado': 'Descartado',
  'Em Atendimento IA': 'Em Atendimento I.A',
  'Em Atendimento I.A': 'Em Atendimento I.A',
  'Aguardando Atendimento do Corretor': 'Aguardando Atendimento do Corretor',
  'Aguardando Atendimento do do': 'Aguardando Atendimento do Corretor',
  '2ª Tentativa': '2ª Tentativa de Contato',
  '2ª Tentativa de Contato': '2ª Tentativa de Contato',
  '2º Tentativa': '2ª Tentativa de Contato',
  '3ª Tentativa': '3ª Tentativa de Contato',
  '3ª Tentativa de Contato': '3ª Tentativa de Contato',
  '3º Tentativa': '3ª Tentativa de Contato',
  '4ª Tentativa': '4ª Tentativa de Contato',
  '4ª Tentativa de Contato': '4ª Tentativa de Contato',
  '4º Tentativa': '4ª Tentativa de Contato',
  'Em Atendimento': 'Em Atendimento',
  'Agendamento': 'Agendamento',
  'Visitou': 'Visita Realizada',
  'Visita Realizada': 'Visita Realizada',
  'Em Tratativa': 'Em Tratativa',
  'Com Reserva': 'Com Reserva',
  'Vendido': 'Venda Realizada',
  'Venda Realizada': 'Venda Realizada',
};

/** Normaliza um status para o nome canônico. Retorna o valor original se não mapeado. */
export function normalizeStatus(raw: string): string {
  return STATUS_ALIASES[raw] ?? raw;
}

/** Retorna o score de calor de um status (normalizado). */
export function getHeatScore(raw: string): number {
  const canonical = normalizeStatus(raw);
  return STATUS_MAP[canonical]?.score ?? 0;
}

/** Retorna a config de um status (normalizado). */
export function getStatusConfig(raw: string): StatusConfig | undefined {
  return STATUS_MAP[normalizeStatus(raw)];
}

/** Ordena status por score decrescente (mais quente primeiro). */
export const STATUS_ORDER = Object.entries(STATUS_MAP)
  .sort((a, b) => b[1].score - a[1].score)
  .map(([key]) => key);
