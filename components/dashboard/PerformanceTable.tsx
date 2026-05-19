import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercentage, safeDivide } from "@/lib/utils";

interface PerformanceTableProps {
  data: Array<{
    empreendimento: string;
    metrics: {
      leads: number;
      descartes: number;
      em_atendimento: number;
      agendamento: number;
      visita: number;
      venda: number;
    };
  }>;
}

export function PerformanceTable({ data }: PerformanceTableProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Desempenho por Empreendimento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium">Empreendimento</th>
                <th className="text-right p-3 font-medium">Leads</th>
                <th className="text-right p-3 font-medium">Descartes</th>
                <th className="text-right p-3 font-medium">Em Atendimento</th>
                <th className="text-right p-3 font-medium">Visita</th>
                <th className="text-right p-3 font-medium">Venda</th>
                <th className="text-right p-3 font-medium">Taxa Conversão</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="p-3 font-medium">{item.empreendimento}</td>
                  <td className="text-right p-3">{formatNumber(item.metrics.leads)}</td>
                  <td className="text-right p-3">{formatNumber(item.metrics.descartes)}</td>
                  <td className="text-right p-3">{formatNumber(item.metrics.em_atendimento)}</td>
                  <td className="text-right p-3">{formatNumber(item.metrics.visita)}</td>
                  <td className="text-right p-3">{formatNumber(item.metrics.venda)}</td>
                  <td className="text-right p-3 text-marsala-bright font-bold">
                    {formatPercentage(item.metrics.venda, item.metrics.leads)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
