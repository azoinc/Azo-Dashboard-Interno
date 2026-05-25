'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { GlobalFilters, Cidade, EMPREENDIMENTOS_POR_CIDADE } from '@/lib/types/auth';

interface FiltersContextType {
  filters: GlobalFilters;
  setFilters: (filters: Partial<GlobalFilters>) => void;
  setAno: (ano: number) => void;
  setMes: (mes: number) => void;
  setCidade: (cidade: Cidade | 'todas') => void;
  setEmpreendimento: (empreendimento: string | 'todos') => void;
  availableEmpreendimentos: string[];
  resetFilters: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

const defaultFilters: GlobalFilters = {
  ano: CURRENT_YEAR,
  mes: CURRENT_MONTH,
  cidade: 'todas',
  empreendimento: 'todos',
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<GlobalFilters>(defaultFilters);

  const setFilters = useCallback((newFilters: Partial<GlobalFilters>) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters };
      
      // Se mudou a cidade, reseta o empreendimento se não for válido
      if (newFilters.cidade && newFilters.cidade !== 'todas') {
        const emps = EMPREENDIMENTOS_POR_CIDADE[newFilters.cidade as Cidade];
        if (!emps.includes(updated.empreendimento)) {
          updated.empreendimento = 'todos';
        }
      }
      
      return updated;
    });
  }, []);

  const setAno = useCallback((ano: number) => {
    setFilters({ ano });
  }, [setFilters]);

  const setMes = useCallback((mes: number) => {
    setFilters({ mes });
  }, [setFilters]);

  const setCidade = useCallback((cidade: Cidade | 'todas') => {
    setFilters({ cidade, empreendimento: 'todos' });
  }, [setFilters]);

  const setEmpreendimento = useCallback((empreendimento: string | 'todos') => {
    setFilters({ empreendimento });
  }, [setFilters]);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const availableEmpreendimentos = filters.cidade === 'todas'
    ? Object.values(EMPREENDIMENTOS_POR_CIDADE).flat()
    : EMPREENDIMENTOS_POR_CIDADE[filters.cidade] || [];

  const value: FiltersContextType = {
    filters,
    setFilters,
    setAno,
    setMes,
    setCidade,
    setEmpreendimento,
    availableEmpreendimentos,
    resetFilters,
  };

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFilters deve ser usado dentro de FiltersProvider');
  }
  return context;
}
