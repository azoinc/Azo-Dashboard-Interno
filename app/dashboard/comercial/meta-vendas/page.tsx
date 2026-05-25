'use client';

export default function MetaVendasPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Meta e Vendas</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Acompanhamento de metas vs realizado</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase">Meta do Mês</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 text-primary">R$ 150.000.000</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase">Realizado</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 text-green-600">R$ 98.450.000</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase">% Atingido</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">65,6%</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Performance por Empreendimento</h3>
        <div className="space-y-3 sm:space-y-4">
          {['Casa da Mata', 'Ares', 'Verter', 'Gávea'].map((emp) => (
            <div key={emp} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="w-auto sm:w-28 lg:w-32 font-medium text-sm">{emp}</span>
              <div className="flex-1 bg-muted rounded-full h-3 sm:h-4 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              </div>
              <span className="w-auto sm:w-16 lg:w-20 text-left sm:text-right text-xs sm:text-sm text-muted-foreground">
                {Math.floor(Math.random() * 20 + 10)} vendas
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
