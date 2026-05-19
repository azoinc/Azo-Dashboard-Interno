import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

interface HeroSectionProps {
  total: {
    leads: number;
    em_atendimento: number;
    visita: number;
    venda: number;
  };
  topEmpresas: Array<{ name: string; leads: number }>;
}

export function HeroSection({ total, topEmpresas }: HeroSectionProps) {
  return (
    <div className="space-y-6">
      {/* Main Hero */}
      <Card className="bg-gradient-to-br from-marsala-bg to-marsala-bg-strong border-marsala">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Total de Leads</h2>
              <p className="text-marsala-glow text-lg">Período selecionado</p>
            </div>
            <div className="text-6xl font-bold text-marsala-bright">
              {formatNumber(total.leads)}
            </div>
          </div>

          {/* Blobs */}
          <div className="flex gap-4 mt-8">
            <div className="flex-1 bg-marsala-bg rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-marsala-bright mb-1">
                {formatNumber(total.em_atendimento)}
              </div>
              <div className="text-sm text-marsala-glow">Em Atendimento</div>
            </div>
            <div className="flex-1 bg-marsala-bg rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-marsala-bright mb-1">
                {formatNumber(total.visita)}
              </div>
              <div className="text-sm text-marsala-glow">Visitas</div>
            </div>
            <div className="flex-1 bg-marsala-bg rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-marsala-bright mb-1">
                {formatNumber(total.venda)}
              </div>
              <div className="text-sm text-marsala-glow">Vendas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Empresas */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Empreendimentos por Leads</h3>
          <div className="space-y-3">
            {topEmpresas.map((emp, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{emp.name}</span>
                <span className="text-marsala-bright font-bold">{formatNumber(emp.leads)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
