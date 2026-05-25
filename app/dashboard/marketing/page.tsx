'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Package, TrendingUp, Target, ShoppingCart, Megaphone, Store, Box } from 'lucide-react';

// Mock data based on the screenshot
const kpiRow1 = [
  { icon: Package, label: 'VGV DO PRODUTO', value: 'R$ 232.296.998,00', bgColor: 'bg-[#8B2356]', textColor: 'text-white' },
  { icon: Box, label: 'VGV EM ESTOQUE', value: 'R$ 0,00', bgColor: 'bg-[#8B2356]', textColor: 'text-white' },
  { icon: TrendingUp, label: 'VGV REALIZADO', value: 'R$ 11.000.844,54', bgColor: 'bg-[#8B2356]', textColor: 'text-white' },
  { icon: Target, label: 'META DE VENDAS', value: '61 unid.', bgColor: 'bg-[#8B2356]', textColor: 'text-white' },
  { icon: ShoppingCart, label: 'VENDAS REALIZADAS', value: '8 unid.', bgColor: 'bg-[#8B2356]', textColor: 'text-white' },
];

const kpiRow2 = [
  { icon: Megaphone, label: 'INVESTIMENTO MKT', value: 'R$ 505.000,00', bgColor: 'bg-slate-800', textColor: 'text-white' },
  { icon: Store, label: 'INVESTIMENTO STAND', value: 'R$ 0,00', bgColor: 'bg-slate-800', textColor: 'text-white' },
  { icon: Package, label: 'INVESTIMENTO PRODUTO', value: 'R$ 0,00', bgColor: 'bg-slate-800', textColor: 'text-white' },
  { icon: Box, label: 'ESTOQUE DE UNID.', value: '129 unid.', bgColor: 'bg-slate-800', textColor: 'text-white' },
];

const origemInvestimentoData = [
  { label: 'PRODUÇÃO GRÁFICA', value: 450000, color: 'bg-emerald-500' },
  { label: 'AGÊNCIA OFFLINE', value: 55000, color: 'bg-blue-500' },
];

const planejadoRealizadoData = [
  {
    projeto: 'Gávea',
    itens: [
      { label: 'Publicidade', planejado: 500000, realizado: 505000, color: 'bg-rose-500' },
      { label: 'Manut. Stand', planejado: 250000, realizado: 0, color: 'bg-slate-300' },
    ],
  },
  {
    projeto: 'A Noite',
    itens: [
      { label: 'Publicidade', planejado: 500000, realizado: 0, color: 'bg-slate-300' },
      { label: 'Manut. Stand', planejado: 250000, realizado: 0, color: 'bg-slate-300' },
    ],
  },
  {
    projeto: 'Casa da Mata',
    itens: [
      { label: 'Publicidade', planejado: 500000, realizado: 0, color: 'bg-slate-300' },
      { label: 'Manut. Stand', planejado: 250000, realizado: 0, color: 'bg-slate-300' },
    ],
  },
  {
    projeto: 'Nefus',
    itens: [
      { label: 'Publicidade', planejado: 500000, realizado: 0, color: 'bg-slate-300' },
    ],
  },
];

function KPICard({ kpi }: { kpi: typeof kpiRow1[0] }) {
  const Icon = kpi.icon;
  return (
    <Card className={`${kpi.bgColor} border-0`}>
      <CardContent className="p-2 sm:p-3">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 mb-1">
            <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${kpi.textColor}`} />
            <p className={`text-[10px] sm:text-xs font-medium ${kpi.textColor} uppercase tracking-wider`}>{kpi.label}</p>
          </div>
          <p className={`text-xs sm:text-sm lg:text-base font-bold ${kpi.textColor}`}>{kpi.value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function HorizontalBarChart() {
  const maxValue = Math.max(...origemInvestimentoData.map(d => d.value));
  
  return (
    <div className="space-y-3 sm:space-y-4">
      {origemInvestimentoData.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 sm:gap-4">
          <span className="text-[10px] sm:text-xs text-muted-foreground w-24 sm:w-32 text-right truncate">{item.label}</span>
          <div className="flex-1 h-8 sm:h-12 bg-muted rounded-r-lg overflow-hidden">
            <div 
              className={`${item.color} h-full flex items-center justify-end px-2 sm:px-3`}
              style={{ width: `${(item.value / maxValue) * 100}%`, minWidth: '40px' }}
            >
              <span className="text-white text-[10px] sm:text-xs font-medium">R$ {(item.value / 1000).toFixed(0)}k</span>
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 sm:gap-4 pt-2">
        <span className="w-24 sm:w-32" />
        <div className="flex-1 flex justify-between text-[10px] sm:text-xs text-muted-foreground px-1">
          <span>R$ 0k</span>
          <span>R$ 150k</span>
          <span>R$ 300k</span>
          <span>R$ 450k</span>
          <span>R$ 600k</span>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ item }: { item: typeof planejadoRealizadoData[0]['itens'][0] }) {
  const percentage = item.planejado > 0 ? Math.min((item.realizado / item.planejado) * 100, 100) : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] sm:text-xs">
        <span className="text-muted-foreground">{item.label}</span>
        <span className="text-muted-foreground">
          R$ {item.realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ {item.planejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`${item.color} h-full rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function MarketingPage() {
  const { isMaster, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isMaster()) {
      router.push('/dashboard/financeiro');
    }
  }, [isMaster, loading, router]);

  if (loading) return <div className="flex items-center justify-center h-64 sm:h-96 text-sm">Carregando...</div>;
  if (!isMaster()) return <div className="flex items-center justify-center h-64 sm:h-96 text-sm">Redirecionando...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Marketing</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visão geral de <span className="font-medium">Todos os meses de 2026</span>
          </p>
        </div>
        <div className="w-fit flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-background">
          <div className="flex items-center gap-1 text-emerald-600">
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">VS MÊS ANTERIOR</span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-emerald-600">0.0%</span>
        </div>
      </div>

      {/* KPI Row 1 - Marsala */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {kpiRow1.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* KPI Row 2 - Dark Blue */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {kpiRow2.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Origem x Investimento */}
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <h3 className="font-semibold text-sm sm:text-base mb-4 sm:mb-6">Origem x Investimento</h3>
            <HorizontalBarChart />
          </CardContent>
        </Card>

        {/* Planejado x Realizado */}
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <h3 className="font-semibold text-sm sm:text-base mb-4 sm:mb-6">Planejado x Realizado</h3>
            <div className="space-y-4 sm:space-y-6">
              {planejadoRealizadoData.map((projeto, idx) => (
                <div key={idx}>
                  <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">{projeto.projeto}</h4>
                  <div className="space-y-2 sm:space-y-3">
                    {projeto.itens.map((item, itemIdx) => (
                      <ProgressBar key={itemIdx} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
