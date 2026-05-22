'use client';

import { useState, useEffect } from 'react';
import { siengeService, SiengeCustoItem } from '@/services/siengeService';

interface SiengeState {
  vendas: number;
  vgv: number;
  estoque: number;
  vgvEstoque: number;
  custos: SiengeCustoItem[];
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
}

const initialState: SiengeState = {
  vendas: 0,
  vgv: 0,
  estoque: 0,
  vgvEstoque: 0,
  custos: [],
  loading: false,
  error: null,
  isConfigured: !!process.env.NEXT_PUBLIC_SIENGE_ENABLED,
};

export function useSiengeIntegration(startDate: string, endDate: string): SiengeState {
  const [state, setState] = useState<SiengeState>(initialState);

  useEffect(() => {
    if (!state.isConfigured || !startDate || !endDate) return;

    let cancelled = false;

    async function fetchData() {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const [vendasData, custosData, empreendimentos] = await Promise.all([
          siengeService.getVendas(startDate, endDate),
          siengeService.getCustosMarketing(startDate, endDate),
          siengeService.getEmpreendimentos(),
        ]);

        let sumEstoque = 0;
        let sumVgvEstoque = 0;

        if (empreendimentos.length > 0) {
          const estoques = await Promise.all(
            empreendimentos.map(emp => siengeService.getEstoque(emp.id))
          );
          estoques.forEach(est => {
            sumEstoque += est.disponiveis;
            sumVgvEstoque += est.vgvEstoque;
          });
        }

        if (!cancelled) {
          setState(prev => ({
            ...prev,
            vendas: vendasData.vendas,
            vgv: vendasData.vgv,
            estoque: sumEstoque,
            vgvEstoque: sumVgvEstoque,
            custos: custosData,
            loading: false,
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar dados do Sienge', error);
        if (!cancelled) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          }));
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, state.isConfigured]);

  return state;
}
