'use client';

export default function MetaVendasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Meta e Vendas</h1>
        <p className="text-muted-foreground">Acompanhamento de metas vs realizado</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground uppercase">Meta do Mês</p>
          <p className="text-3xl font-bold mt-2 text-primary">R$ 150.000.000</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground uppercase">Realizado</p>
          <p className="text-3xl font-bold mt-2 text-green-600">R$ 98.450.000</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground uppercase">% Atingido</p>
          <p className="text-3xl font-bold mt-2">65,6%</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Performance por Empreendimento</h3>
        <div className="space-y-4">
          {['Casa da Mata', 'Ares', 'Verter', 'Gávea'].map((emp) => (
            <div key={emp} className="flex items-center gap-4">
              <span className="w-32 font-medium">{emp}</span>
              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              </div>
              <span className="w-20 text-right text-sm text-muted-foreground">
                {Math.floor(Math.random() * 20 + 10)} vendas
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
