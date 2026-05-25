'use client';

export default function PipelinePage() {
  const stages = [
    { name: 'Leads', count: 2847, color: 'bg-blue-500' },
    { name: 'Contato', count: 1456, color: 'bg-cyan-500' },
    { name: 'Visita', count: 892, color: 'bg-teal-500' },
    { name: 'Proposta', count: 423, color: 'bg-amber-500' },
    { name: 'Negociação', count: 198, color: 'bg-orange-500' },
    { name: 'Venda', count: 67, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Pipeline</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Funil de vendas e oportunidades</p>
      </div>

      <div className="flex flex-col gap-2 sm:gap-4 max-w-2xl">
        {stages.map((stage, index) => (
          <div key={stage.name} className="flex items-center gap-2 sm:gap-4">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${stage.color} shrink-0`} />
            <span className="w-16 sm:w-20 lg:w-24 font-medium text-xs sm:text-sm">{stage.name}</span>
            <div className="flex-1 bg-muted rounded-lg overflow-hidden h-8 sm:h-10 lg:h-12">
              <div 
                className={`${stage.color} h-full flex items-center justify-end px-2 sm:px-3`}
                style={{ width: `${(stage.count / stages[0].count) * 100}%`, minWidth: '40px' }}
              >
                <span className="text-white font-bold text-xs sm:text-sm">{stage.count}</span>
              </div>
            </div>
            <span className="w-12 sm:w-14 lg:w-16 text-right text-xs sm:text-sm text-muted-foreground">
              {index > 0 ? `${((stage.count / stages[index - 1].count) * 100).toFixed(0)}%` : '100%'}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Taxa de Conversão Geral</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 text-green-600">2,3%</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Ticket Médio</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">R$ 850.000</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Tempo Médio de Conversão</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">45 dias</p>
        </div>
      </div>
    </div>
  );
}
