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

// ── Cache localStorage com TTL ────────────────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw) as { data: T; expiresAt: number };
    if (Date.now() > expiresAt) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL_MS }));
  } catch { /* localStorage cheio ou indisponível — ignora silenciosamente */ }
}

export function DashboardView({ modo, titulo, subtitulo, accentColor = "text-foreground" }: DashboardViewProps) {
  const [selectedEmp, setSelectedEmp] = useState("all");
  const [period, setPeriod] = useState({ inicio: "", fim: "" });
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [empreendimentos, setEmpreendimentos] = useState<string[]>([]);

  const siengeData = useSiengeIntegration(period.inicio, period.fim);

  const fetchMetrics = useCallback(async () => {
    const params = new URLSearchParams();
    params.append("modo", modo);
    if (selectedEmp !== "all") params.append("empreendimento", selectedEmp);
    if (period.inicio) params.append("data_inicio", period.inicio);
    if (period.fim) params.append("data_fim", period.fim);

    const cacheKey = `metrics_cache_${params.toString()}`;

    // Tenta servir do cache primeiro
    const cached = getCached<Metrics>(cacheKey);
    if (cached) {
      setMetrics(cached);
      setEmpreendimentos(Object.keys(cached.byEmp || {}));
      setFromCache(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setFromCache(false);
      const response = await fetch(`/api/metrics?${params.toString()}`);
      const data = await response.json();
      setMetrics(data);
      setEmpreendimentos(Object.keys(data.byEmp || {}));
      setCache(cacheKey, data);
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
        <div className="mb-6 flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className={`text-4xl font-bold mb-1 ${accentColor}`}>{titulo}</h1>
            <p className="text-muted-foreground">{subtitulo}</p>
          </div>
          {fromCache && !loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
              Cache · atualiza em 5 min
              <button
                onClick={() => {
                  // Limpa todos os caches deste modo e recarrega
                  Object.keys(localStorage)
                    .filter(k => k.startsWith(`metrics_cache_modo=${modo}`))
                    .forEach(k => localStorage.removeItem(k));
                  fetchMetrics();
                }}
                className="ml-1 underline hover:text-foreground transition-colors"
              >
                Atualizar
              </button>
            </div>
          )}
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
