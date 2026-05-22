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
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { useSiengeIntegration } from "@/hooks/useSiengeIntegration";

type Modo = "organico" | "acoes_marketing";

interface DashboardViewProps {
  modo: Modo;
  titulo: string;
  subtitulo: string;
  accentColor?: string;
}

interface MetricsBucket {
  leads: number;
  descartes: number;
  em_atendimento: number;
  agendamento: number;
  visita: number;
  venda: number;
}

interface Metrics {
  byEmp: Record<string, MetricsBucket>;
  byMonth: Record<string, MetricsBucket>;
  total: MetricsBucket;
}

export function DashboardView({ modo, titulo, subtitulo, accentColor = "text-foreground" }: DashboardViewProps) {
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
      params.append("modo", modo);
      if (selectedEmp !== "all") params.append("empreendimento", selectedEmp);
      if (period.inicio) params.append("data_inicio", period.inicio);
      if (period.fim) params.append("data_fim", period.fim);

      const response = await fetch(`/api/metrics?${params.toString()}`);
      const data = await response.json();
      setMetrics(data);

      const emps = Object.keys(data.byEmp || {});
      setEmpreendimentos(emps);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedEmp, period, modo]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchMetrics();
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [fetchMetrics]);

  const total: MetricsBucket = metrics?.total ?? {
    leads: 0,
    descartes: 0,
    em_atendimento: 0,
    agendamento: 0,
    visita: 0,
    venda: 0,
  };

  const topEmpresas = Object.entries(metrics?.byEmp ?? {})
    .map(([name, data]) => ({ name, leads: data.leads }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 5);

  const evolutionData = Object.entries(metrics?.byMonth ?? {}).map(([mes, data]) => ({
    mes,
    ...data,
  }));

  const performanceData = Object.entries(metrics?.byEmp ?? {}).map(([empreendimento, m]) => ({
    empreendimento,
    metrics: m,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-4xl font-bold mb-1 ${accentColor}`}>{titulo}</h1>
          <p className="text-muted-foreground">{subtitulo}</p>
        </div>

        {/* Tab nav */}
        <DashboardNav />

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center text-muted-foreground">Carregando...</div>
          </div>
        ) : !metrics ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center text-muted-foreground">
              Configure as variáveis de ambiente do Firebase e Supabase para começar.
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
