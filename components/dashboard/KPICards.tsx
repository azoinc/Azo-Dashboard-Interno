import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatPercentage } from "@/lib/utils";

interface KPICardsProps {
  metrics: {
    leads: number;
    descartes: number;
    em_atendimento: number;
    agendamento: number;
    visita: number;
    venda: number;
  };
}

export function KPICards({ metrics }: KPICardsProps) {
  const kpis = [
    { label: "Leads", value: metrics.leads, color: "bg-marsala-bright" },
    { label: "Descartes", value: metrics.descartes, color: "bg-marsala" },
    { label: "Em Atendimento", value: metrics.em_atendimento, color: "bg-marsala-light" },
    { label: "Agendamento", value: metrics.agendamento, color: "bg-marsala" },
    { label: "Visita", value: metrics.visita, color: "bg-marsala" },
    { label: "Venda", value: metrics.venda, color: "bg-marsala-bright" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-2">{kpi.label}</div>
            <div className="text-2xl font-bold text-marsala-bright mb-2">
              {formatNumber(kpi.value)}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${kpi.color} transition-all`}
                style={{ width: `${(kpi.value / metrics.leads) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatPercentage(kpi.value, metrics.leads)} dos leads
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
