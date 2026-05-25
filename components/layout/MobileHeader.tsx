'use client';

import { useAuth } from '@/lib/auth-context';
import { useFilters } from '@/lib/filters-context';
import { CIDADES } from '@/lib/types/auth';
import { Menu, X, Filter, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { signOut, user } = useAuth();
  const {
    filters,
    setAno,
    setMes,
    setCidade,
    setEmpreendimento,
    availableEmpreendimentos,
  } = useFilters();
  const [showFilters, setShowFilters] = useState(false);

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const meses = [
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Fev' },
    { value: 3, label: 'Mar' },
    { value: 4, label: 'Abr' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Ago' },
    { value: 9, label: 'Set' },
    { value: 10, label: 'Out' },
    { value: 11, label: 'Nov' },
    { value: 12, label: 'Dez' },
  ];

  return (
    <header className="lg:hidden bg-card border-b border-border">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">Azo Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 hover:bg-muted rounded-lg transition-colors ${
              showFilters ? 'bg-primary/10 text-primary' : ''
            }`}
            aria-label="Filtros"
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={signOut}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-red-500"
            aria-label="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-4 pb-4 border-t border-border/50 bg-muted/30">
          <div className="pt-3 space-y-3">
            {/* Ano e Mês na mesma linha */}
            <div className="flex gap-2">
              <select
                value={filters.ano}
                onChange={(e) => setAno(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {anos.map((ano) => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
              <select
                value={filters.mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {meses.map((mes) => (
                  <option key={mes.value} value={mes.value}>{mes.label}</option>
                ))}
              </select>
            </div>

            {/* Cidade e Empreendimento */}
            <select
              value={filters.cidade}
              onChange={(e) => setCidade(e.target.value as typeof filters.cidade)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todas">Todas as cidades</option>
              {CIDADES.map((cidade) => (
                <option key={cidade} value={cidade}>{cidade}</option>
              ))}
            </select>

            <select
              value={filters.empreendimento}
              onChange={(e) => setEmpreendimento(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="todos">Todos os empreendimentos</option>
              {availableEmpreendimentos.map((emp) => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </header>
  );
}
