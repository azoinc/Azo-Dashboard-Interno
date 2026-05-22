// Mapeamento canônico de status baseado nos valores reais do banco PostgreSQL
// Score = ordem_visual da view_funil_maximo_com_total (maior = mais quente)
// Variantes "- Ação de Marketing" são normalizadas para o status base

export interface StatusConfig {
  label: string;
  score: number;
  color: string;       // Tailwind bg color
  textColor: string;   // Tailwind text color
}

// Mapa canônico — chaves são os nomes exatos do banco
export const STATUS_MAP: Record<string, StatusConfig> = {
  'Descartado': {
    label: 'Descartado',
    score: 1,
    color: 'bg-zinc-700',
    textColor: 'text-zinc-300',
  },
  'Descartado - Ação de Marketing': {
    label: 'Descartado - Ação de Marketing',
    score: 1,
    color: 'bg-zinc-600',
    textColor: 'text-zinc-200',
  },
  '4º Tentativa': {
    label: '4ª Tentativa',
    score: 3,
    color: 'bg-sky-800',
    textColor: 'text-sky-200',
  },
  '3º Tentativa': {
    label: '3ª Tentativa',
    score: 4,
    color: 'bg-sky-700',
    textColor: 'text-sky-100',
  },
  '3º Tentativa - Ação de Marketing': {
    label: '3ª Tentativa - Ação de Marketing',
    score: 4,
    color: 'bg-sky-700',
    textColor: 'text-sky-100',
  },
  '2º Tentativa': {
    label: '2ª Tentativa',
    score: 5,
    color: 'bg-cyan-700',
    textColor: 'text-cyan-100',
  },
  '2º Tentativa - Ação de Marketing': {
    label: '2ª Tentativa - Ação de Marketing',
    score: 5,
    color: 'bg-cyan-700',
    textColor: 'text-cyan-100',
  },
  'Aguardando Atendimento': {
    label: 'Aguardando Atendimento',
    score: 6,
    color: 'bg-blue-700',
    textColor: 'text-blue-100',
  },
  'Aguardando Atendimento - Ação de Marketing': {
    label: 'Aguardando Atendimento - Ação de Marketing',
    score: 6,
    color: 'bg-blue-700',
    textColor: 'text-blue-100',
  },
  'Em Atendimento I.A': {
    label: 'Em Atendimento I.A',
    score: 7,
    color: 'bg-indigo-700',
    textColor: 'text-indigo-100',
  },
  'Aguardando Atendimento Corretor': {
    label: 'Aguardando Atendimento Corretor',
    score: 8,
    color: 'bg-violet-700',
    textColor: 'text-violet-100',
  },
  'Em Atendimento': {
    label: 'Em Atendimento',
    score: 9,
    color: 'bg-purple-600',
    textColor: 'text-purple-100',
  },
  'Em Atendimento -  Ação de Marketing': {
    label: 'Em Atendimento - Ação de Marketing',
    score: 9,
    color: 'bg-purple-600',
    textColor: 'text-purple-100',
  },
  'Agendamento': {
    label: 'Agendamento',
    score: 10,
    color: 'bg-amber-600',
    textColor: 'text-amber-100',
  },
  'Visita Realizada': {
    label: 'Visita Realizada',
    score: 11,
    color: 'bg-orange-500',
    textColor: 'text-orange-100',
  },
  'Em Tratativa': {
    label: 'Em Tratativa',
    score: 12,
    color: 'bg-rose-500',
    textColor: 'text-rose-100',
  },
  'Com Reserva': {
    label: 'Com Reserva',
    score: 13,
    color: 'bg-pink-500',
    textColor: 'text-pink-100',
  },
  'Venda Realizada': {
    label: 'Venda Realizada',
    score: 14,
    color: 'bg-green-600',
    textColor: 'text-green-100',
  },
};

// Aliases para variantes encontradas no banco que diferem das chaves canônicas
export const STATUS_ALIASES: Record<string, string> = {
  'Em Atendimento I.A': 'Em Atendimento I.A',
  'Em Atendimento IA': 'Em Atendimento I.A',
  'Aguardando Atendimento do Corretor': 'Aguardando Atendimento Corretor',
  'Aguardando Atendimento do do': 'Aguardando Atendimento Corretor',
  'Fila do Corretor': 'Aguardando Atendimento Corretor',
  'Visitou': 'Visita Realizada',
  'Vendido': 'Venda Realizada',
};

/** Normaliza um status raw para o nome canônico do STATUS_MAP. */
export function normalizeStatus(raw: string): string {
  if (!raw) return 'Desconhecido';
  return STATUS_ALIASES[raw] ?? raw;
}

/** Retorna o score de calor de um status. -99 = descartado. 0 = desconhecido. */
export function getHeatScore(raw: string): number {
  const canonical = normalizeStatus(raw);
  // Descartados ficam fora do funil (score negativo)
  if (canonical.startsWith('Descartado')) return -1;
  return STATUS_MAP[canonical]?.score ?? 0;
}

/** Retorna a config de um status (normalizado). */
export function getStatusConfig(raw: string): StatusConfig | undefined {
  return STATUS_MAP[normalizeStatus(raw)];
}

/** Lista de status ordenados do mais quente para o mais frio. */
export const STATUS_ORDER = Object.entries(STATUS_MAP)
  .sort((a, b) => b[1].score - a[1].score)
  .map(([key]) => key);
