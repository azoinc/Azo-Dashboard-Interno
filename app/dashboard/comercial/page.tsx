'use client';

export default function ComercialPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Comercial</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Visão geral do comercial</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <a href="/dashboard/comercial/meta-vendas" className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:border-primary transition-colors">
          <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">🎯</div>
          <h3 className="font-semibold text-base sm:text-lg">Meta e Vendas</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Acompanhamento de metas vs realizado</p>
        </a>
        <a href="/dashboard/comercial/pipeline" className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:border-primary transition-colors">
          <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">📊</div>
          <h3 className="font-semibold text-base sm:text-lg">Pipeline</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Funil de vendas e oportunidades</p>
        </a>
        <a href="/dashboard/comercial/visitas" className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:border-primary transition-colors">
          <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">🚶</div>
          <h3 className="font-semibold text-base sm:text-lg">Visitas</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Agendamentos e visitas realizadas</p>
        </a>
      </div>
    </div>
  );
}
