"use client";

import { useState, useEffect, useCallback } from "react";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { KPICards } from "@/components/dashboard/KPICards";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { EmpNav } from "@/components/dashboard/EmpNav";
import { CalendarFilter } from "@/components/dashboard/CalendarFilter";
import { EvolutionChart } from "@/components/dashboard/EvolutionChart";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { SiengePanel } from "@/components/dashboard/SiengePanel";
import { useSiengeIntegration } from "@/hooks/useSiengeIntegration";

interface Metrics {
  byEmp: Record<string, {
    leads: number;
    descartes: number;
    em_atendimento: number;
    agendamento: number;
    visita: number;
    venda: number;
  }>;
  byMonth: Record<string, {
    leads: number;
    descartes: number;
    em_atendimento: number;
    agendamento: number;
    visita: number;
    venda: number;
  }>;
  total: {
    leads: number;
    descartes: number;
    em_atendimento: number;
    agendamento: number;
    visita: number;
    venda: number;
  };
}

export default function DashboardPage() {
  const [selectedEmp, setSelectedEmp] = useState("all");
  const [period, setPeriod] = useState({ inicio: "", fim: "" });
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [empreendimentos, setEmpreendimentos] = useState<string[]>([]);

  const siengeData = useSiengeIntegration(period.inicio, period.fim);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedEmp !== "all") params.append("empreendimento", selectedEmp);
      if (period.inicio) params.append("data_inicio", period.inicio);
      if (period.fim) params.append("data_fim", period.fim);

      const response = await fetch(`/api/metrics?${params.toString()}`);
      const data = await response.json();
      setMetrics(data);

      // Extrair empreendimentos únicos
      const emps = Object.keys(data.byEmp || {});
      setEmpreendimentos(emps);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedEmp, period]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchMetrics();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-8">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-8">
          <div className="text-center text-muted-foreground">
            Configure as variáveis de ambiente do Firebase para começar.
          </div>
        </div>
      </div>
    );
  }

  // Preparar dados para os componentes
  const total = metrics.total || {
    leads: 0,
    descartes: 0,
    em_atendimento: 0,
    agendamento: 0,
    visita: 0,
    venda: 0,
  };

  const topEmpresas = Object.entries(metrics.byEmp || {})
    .map(([name, data]: [string, any]) => ({ name, leads: data.leads }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 5);

  const evolutionData = Object.entries(metrics.byMonth || {}).map(([mes, data]: [string, any]) => ({
    mes,
    ...data,
  }));

  const performanceData = Object.entries(metrics.byEmp || {}).map(([empreendimento, metrics]: [string, any]) => ({
    empreendimento,
    metrics,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard de Marketing</h1>
          <p className="text-muted-foreground">Análise de leads e performance</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-8">
          <EmpNav
            empreendimentos={empreendimentos}
            selected={selectedEmp}
            onSelect={setSelectedEmp}
          />
          <CalendarFilter onPeriodChange={setPeriod} />
        </div>

        {/* Hero Section */}
        <div className="mb-8">
          <HeroSection total={total} topEmpresas={topEmpresas} />
        </div>

        {/* KPI Cards */}
        <div className="mb-8">
          <KPICards metrics={total} />
        </div>

        {/* Funnel Chart */}
        <div className="mb-8">
          <FunnelChart metrics={total} />
        </div>

        {/* Evolution Chart */}
        <div className="mb-8">
          <EvolutionChart data={evolutionData} />
        </div>

        {/* Performance Table */}
        <div className="mb-8">
          <PerformanceTable data={performanceData} />
        </div>

        {/* Sienge Integration */}
        {siengeData.isConfigured && (
          <div className="mb-8">
            <SiengePanel
              vendas={siengeData.vendas}
              vgv={siengeData.vgv}
              estoque={siengeData.estoque}
              vgvEstoque={siengeData.vgvEstoque}
              custos={siengeData.custos}
              loading={siengeData.loading}
              error={siengeData.error}
            />
          </div>
        )}
      </div>
    </div>
  );
}
