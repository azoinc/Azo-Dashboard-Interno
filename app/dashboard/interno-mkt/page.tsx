'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingDown, TrendingUp, Users, Target, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';

// Mock data para Interno Mkt
const kpiData = [
  { icon: Users, label: 'Total de Leads', value: '2.847', trend: '+12%', trendUp: true },
  { icon: Target, label: 'Taxa de Conversão', value: '24.5%', trend: '+3.2%', trendUp: true },
  { icon: DollarSign, label: 'Custo por Lead', value: 'R$ 45,80', trend: '-8%', trendUp: true },
  { icon: Activity, label: 'Engajamento', value: '68%', trend: '-2%', trendUp: false },
];

const equipeData = [
  { nome: 'Ana Silva', cargo: 'Social Media', leads: 450, conversao: 28 },
  { nome: 'Bruno Costa', cargo: 'Performance', leads: 890, conversao: 32 },
  { nome: 'Carla Mendes', cargo: 'Criação', leads: 320, conversao: 22 },
  { nome: 'Daniel Rocha', cargo: 'Gestor de Tráfego', leads: 670, conversao: 29 },
];

const campanhasData = [
  { nome: 'Lançamento Gávea', status: 'Ativa', budget: 'R$ 50.000', gasto: 'R$ 32.450', roi: 245 },
  { nome: 'A Noite - Outono', status: 'Pausada', budget: 'R$ 30.000', gasto: 'R$ 28.900', roi: 180 },
  { nome: 'Verter - Verão', status: 'Planejada', budget: 'R$ 40.000', gasto: 'R$ 0', roi: 0 },
];

function KPICard({ kpi }: { kpi: typeof kpiData[0] }) {
  const Icon = kpi.icon;
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100">
              <Icon className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{kpi.label}</p>
              <p className="text-lg sm:text-2xl font-bold">{kpi.value}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-xs sm:text-sm ${kpi.trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
            {kpi.trendUp ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            {kpi.trend}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InternoMktPage() {
  const { isMaster, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isMaster()) {
      router.push('/dashboard/marketing');
    }
  }, [isMaster, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!isMaster()) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Redirecionando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/selecionar"
            className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Interno Mkt</h1>
            <p className="text-muted-foreground text-sm">
              Métricas internas e acompanhamento da equipe
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Exportar Relatório
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* Equipe Section */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Performance da Equipe</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nome</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cargo</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Leads</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {equipeData.map((membro, idx) => (
                  <tr key={idx} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-2 font-medium">{membro.nome}</td>
                    <td className="py-3 px-2 text-muted-foreground text-sm">{membro.cargo}</td>
                    <td className="py-3 px-2 text-right">{membro.leads.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        membro.conversao >= 25 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {membro.conversao}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Campanhas Section */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Campanhas Ativas</h2>
          <div className="space-y-4">
            {campanhasData.map((campanha, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-xl gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{campanha.nome}</h3>
                    <Badge variant={
                      campanha.status === 'Ativa' ? 'default' :
                      campanha.status === 'Pausada' ? 'secondary' : 'outline'
                    }>
                      {campanha.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Budget: {campanha.budget} • Gasto: {campanha.gasto}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">ROI</div>
                    <div className={`font-bold ${campanha.roi >= 200 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {campanha.roi}%
                    </div>
                  </div>
                  <div className="w-24 sm:w-32">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${Math.min((parseInt(campanha.gasto.replace(/\D/g, '')) / parseInt(campanha.budget.replace(/\D/g, ''))) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      {Math.round((parseInt(campanha.gasto.replace(/\D/g, '')) / parseInt(campanha.budget.replace(/\D/g, ''))) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
