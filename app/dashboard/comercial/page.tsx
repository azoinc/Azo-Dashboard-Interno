'use client';

export default function ComercialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Comercial</h1>
        <p className="text-muted-foreground">Visão geral do comercial</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <a href="/dashboard/comercial/meta-vendas" className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="font-semibold text-lg">Meta e Vendas</h3>
          <p className="text-sm text-muted-foreground mt-2">Acompanhamento de metas vs realizado</p>
        </a>
        <a href="/dashboard/comercial/pipeline" className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="font-semibold text-lg">Pipeline</h3>
          <p className="text-sm text-muted-foreground mt-2">Funil de vendas e oportunidades</p>
        </a>
        <a href="/dashboard/comercial/visitas" className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
          <div className="text-4xl mb-4">🚶</div>
          <h3 className="font-semibold text-lg">Visitas</h3>
          <p className="text-sm text-muted-foreground mt-2">Agendamentos e visitas realizadas</p>
        </a>
      </div>
    </div>
  );
}
