'use client';

export default function VisitasPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Visitas</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Agendamentos e visitas realizadas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Agendadas</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">156</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Realizadas</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 text-green-600">134</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Não Compareceu</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 text-amber-600">18</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Canceladas</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2 text-red-600">4</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
        <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Visitas da Semana</h3>
        <div className="space-y-2 sm:space-y-3">
          {[
            { data: '22/05/2026', hora: '10:00', cliente: 'João Silva', empreendimento: 'Casa da Mata', status: 'Realizada' },
            { data: '22/05/2026', hora: '14:30', cliente: 'Maria Santos', empreendimento: 'Ares', status: 'Agendada' },
            { data: '23/05/2026', hora: '09:00', cliente: 'Pedro Costa', empreendimento: 'Verter', status: 'Agendada' },
            { data: '23/05/2026', hora: '16:00', cliente: 'Ana Paula', empreendimento: 'Gávea', status: 'Confirmada' },
          ].map((visita, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-3 border-b border-border/50 last:border-0 gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg lg:text-xl shrink-0">
                  🚶
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{visita.cliente}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{visita.empreendimento}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                <div className="text-left sm:text-right">
                  <p className="font-medium text-sm">{visita.hora}</p>
                  <p className="text-xs text-muted-foreground">{visita.data}</p>
                </div>
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                  visita.status === 'Realizada' ? 'bg-green-100 text-green-700' :
                  visita.status === 'Agendada' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {visita.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
