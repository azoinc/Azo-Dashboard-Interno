import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface EvolutionChartProps {
  data: Array<{
    mes: string;
    leads: number;
    descartes: number;
    em_atendimento: number;
    agendamento: number;
    visita: number;
    venda: number;
  }>;
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="mes" 
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1d1d1d', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
              itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="leads" fill="#d62566" name="Leads" />
            <Bar dataKey="em_atendimento" fill="#b8194f" name="Em Atendimento" />
            <Bar dataKey="visita" fill="#61072e" name="Visita" />
            <Bar dataKey="venda" fill="#d62566" name="Venda" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
