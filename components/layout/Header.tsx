'use client';

import { useAuth } from '@/lib/auth-context';
import { useFilters } from '@/lib/filters-context';
import { CIDADES } from '@/lib/types/auth';
import { LogOut } from 'lucide-react';

export function Header() {
  const { signOut } = useAuth();
  const {
    filters,
    setAno,
    setMes,
    setCidade,
    setEmpreendimento,
    availableEmpreendimentos,
  } = useFilters();

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  return (
    <header className="hidden lg:block bg-card border-b border-border px-4 xl:px-6 py-3 xl:py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Filtros globais */}
        <div className="flex items-center gap-2 xl:gap-3 flex-wrap">
          {/* Ano */}
          <select
            value={filters.ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="px-2 xl:px-3 py-1.5 xl:py-2 border border-input rounded-md bg-background text-xs xl:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {anos.map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>

          {/* Mês */}
          <select
            value={filters.mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="px-2 xl:px-3 py-1.5 xl:py-2 border border-input rounded-md bg-background text-xs xl:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {meses.map((mes, index) => (
              <option key={index + 1} value={index + 1}>{mes}</option>
            ))}
          </select>

          {/* Cidade */}
          <select
            value={filters.cidade}
            onChange={(e) => setCidade(e.target.value as typeof filters.cidade)}
            className="px-2 xl:px-3 py-1.5 xl:py-2 border border-input rounded-md bg-background text-xs xl:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todas">Todas as cidades</option>
            {CIDADES.map((cidade) => (
              <option key={cidade} value={cidade}>{cidade}</option>
            ))}
          </select>

          {/* Empreendimento */}
          <select
            value={filters.empreendimento}
            onChange={(e) => setEmpreendimento(e.target.value)}
            className="px-2 xl:px-3 py-1.5 xl:py-2 border border-input rounded-md bg-background text-xs xl:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos os empreendimentos</option>
            {availableEmpreendimentos.map((emp) => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>

        {/* Botão sair */}
        <button
          onClick={signOut}
          className="text-xs xl:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 xl:gap-2 px-2 xl:px-3 py-1.5 xl:py-2 hover:bg-muted rounded-md"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden xl:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
