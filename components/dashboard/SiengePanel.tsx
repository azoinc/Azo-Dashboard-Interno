import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { SiengeCustoItem } from "@/services/siengeService";

interface SiengePanelProps {
  vendas: number;
  vgv: number;
  estoque: number;
  vgvEstoque: number;
  custos: SiengeCustoItem[];
  loading: boolean;
  error: string | null;
}

export function SiengePanel({
  vendas,
  vgv,
  estoque,
  vgvEstoque,
  custos,
  loading,
  error,
}: SiengePanelProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dados Sienge</h2>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Erro ao carregar Sienge: {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Vendas (período)</div>
            <div className="text-2xl font-bold text-marsala-bright">
              {loading ? "—" : formatNumber(vendas)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">VGV Vendido</div>
            <div className="text-2xl font-bold text-marsala-bright">
              {loading ? "—" : `R$ ${formatNumber(Math.round(vgv / 1000))}k`}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Estoque Disponível</div>
            <div className="text-2xl font-bold text-marsala-bright">
              {loading ? "—" : formatNumber(estoque)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">VGV Estoque</div>
            <div className="text-2xl font-bold text-marsala-bright">
              {loading ? "—" : `R$ ${formatNumber(Math.round(vgvEstoque / 1000))}k`}
            </div>
          </CardContent>
        </Card>
      </div>

      {custos.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Custos de Marketing (Sienge)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Descrição</th>
                    <th className="text-right p-3 font-medium">Mês</th>
                    <th className="text-right p-3 font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {custos.map((c, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-3">{c.descricao}</td>
                      <td className="text-right p-3 text-muted-foreground">{c.mes}</td>
                      <td className="text-right p-3 font-medium text-marsala-bright">
                        R$ {c.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
