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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Pipeline</h1>
        <p className="text-muted-foreground">Funil de vendas e oportunidades</p>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">
        {stages.map((stage, index) => (
          <div key={stage.name} className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${stage.color}`} />
            <span className="w-24 font-medium">{stage.name}</span>
            <div className="flex-1 bg-muted rounded-lg overflow-hidden h-12">
              <div 
                className={`${stage.color} h-full flex items-center justify-end px-3`}
                style={{ width: `${(stage.count / stages[0].count) * 100}%`, minWidth: '60px' }}
              >
                <span className="text-white font-bold">{stage.count}</span>
              </div>
            </div>
            <span className="w-16 text-right text-sm text-muted-foreground">
              {index > 0 ? `${((stage.count / stages[index - 1].count) * 100).toFixed(1)}%` : '100%'}
            </span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Taxa de Conversão Geral</p>
          <p className="text-3xl font-bold mt-2 text-green-600">2,3%</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Ticket Médio</p>
          <p className="text-3xl font-bold mt-2">R$ 850.000</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Tempo Médio de Conversão</p>
          <p className="text-3xl font-bold mt-2">45 dias</p>
        </div>
      </div>
    </div>
  );
}
