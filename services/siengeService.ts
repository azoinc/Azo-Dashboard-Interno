// Sienge API Service
// Calls the Next.js proxy at /api/sienge to avoid exposing credentials client-side

export interface SiengeVendas {
  vendas: number;
  vgv: number;
}

export interface SiengeEstoque {
  disponiveis: number;
  vgvEstoque: number;
}

export interface SiengeEmpreendimento {
  id: number;
  nome: string;
}

export interface SiengeCustoItem {
  descricao: string;
  valor: number;
  mes: string;
}

async function callProxy<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams({ path, ...params }).toString();
  const res = await fetch(`/api/sienge?${qs}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Sienge proxy error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const siengeService = {
  async getVendas(startDate: string, endDate: string): Promise<SiengeVendas> {
    const raw = await callProxy<{ content?: { quantity?: number; totalValue?: number }[] }>(
      '/sales/sales-orders',
      { startDate, endDate, pageSize: '500' }
    );
    const items = raw.content ?? [];
    return {
      vendas: items.length,
      vgv: items.reduce((acc, i) => acc + (i.totalValue ?? 0), 0),
    };
  },

  async getCustosMarketing(startDate: string, endDate: string): Promise<SiengeCustoItem[]> {
    const raw = await callProxy<{ content?: { description?: string; value?: number; competenceDate?: string }[] }>(
      '/financial/accounts-payable',
      { startDate, endDate, costCenterType: 'marketing', pageSize: '500' }
    );
    return (raw.content ?? []).map(i => ({
      descricao: i.description ?? '',
      valor: i.value ?? 0,
      mes: (i.competenceDate ?? '').slice(0, 7),
    }));
  },

  async getEmpreendimentos(): Promise<SiengeEmpreendimento[]> {
    const raw = await callProxy<{ content?: { id?: number; name?: string }[] }>(
      '/real-estate/real-estate-developments',
      { pageSize: '200' }
    );
    return (raw.content ?? []).map(i => ({ id: i.id ?? 0, nome: i.name ?? '' }));
  },

  async getEstoque(empreendimentoId: number): Promise<SiengeEstoque> {
    const raw = await callProxy<{
      content?: { situation?: string; salePrice?: number }[]
    }>(
      `/real-estate/real-estate-developments/${empreendimentoId}/units`,
      { pageSize: '500' }
    );
    const units = raw.content ?? [];
    const disponiveis = units.filter(u => u.situation === 'DISPONIVEL');
    return {
      disponiveis: disponiveis.length,
      vgvEstoque: disponiveis.reduce((acc, u) => acc + (u.salePrice ?? 0), 0),
    };
  },
};
