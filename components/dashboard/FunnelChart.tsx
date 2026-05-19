import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercentage, safeDivide } from "@/lib/utils";

interface FunnelChartProps {
  metrics: {
    leads: number;
    descartes: number;
    em_atendimento: number;
    agendamento: number;
    visita: number;
    venda: number;
  };
}

export function FunnelChart({ metrics }: FunnelChartProps) {
  const funnelSteps = [
    { label: "Leads", value: metrics.leads, base: metrics.leads, color: "bg-marsala-bright" },
    { label: "Descartados", value: metrics.descartes, base: metrics.leads, color: "bg-marsala" },
    { label: "Em Atendimento", value: metrics.em_atendimento, base: metrics.leads, color: "bg-marsala-light" },
    { label: "Agendamento", value: metrics.agendamento, base: metrics.leads, color: "bg-marsala" },
    { label: "Visita", value: metrics.visita, base: metrics.leads, color: "bg-marsala" },
    { label: "Venda", value: metrics.venda, base: metrics.leads, color: "bg-marsala-bright" },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelSteps.map((step, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{step.label}</span>
                <div className="text-right">
                  <span className="text-marsala-bright font-bold mr-2">
                    {formatNumber(step.value)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({formatPercentage(step.value, step.base)})
                  </span>
                </div>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${step.color} transition-all`}
                  style={{ width: `${safeDivide(step.value, step.base) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
