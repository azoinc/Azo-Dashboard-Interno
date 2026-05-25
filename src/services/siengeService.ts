// src/services/siengeService.ts
// Calls the backend API (/api/sienge/*) instead of Sienge directly.
// Credentials stay server-side — never exposed in the browser bundle.

async function apiGet(path: string, params?: Record<string, string>): Promise<any> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`/api/sienge/${path}${qs}`);
  if (!res.ok) throw new Error(`/api/sienge/${path} → ${res.status}`);
  return res.json();
}

export const siengeService = {
  async getEmpreendimentos() {
    try {
      return await apiGet('enterprises');
    } catch (error) {
      console.error('Sienge API Error:', error);
      return [];
    }
  },

  async getEstoque(enterpriseId: number) {
    try {
      return await apiGet('units', { enterpriseId: String(enterpriseId) });
    } catch (error) {
      console.error('Sienge API Error:', error);
      return { total: 0, disponiveis: 0, vgvEstoque: 0 };
    }
  },

  async getVendas(startDate: string, endDate: string) {
    try {
      return await apiGet('vendas', { startDate, endDate });
    } catch (error) {
      console.error('Sienge API Error:', error);
      return { vendas: 0, vgv: 0 };
    }
  },

  async getCustosMarketing(startDate: string, endDate: string) {
    try {
      return await apiGet('custos', { startDate, endDate });
    } catch (error) {
      console.error('Sienge API Error:', error);
      return [];
    }
  },
};
