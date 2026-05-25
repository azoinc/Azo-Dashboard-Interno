'use client';

export default function VisitasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Visitas</h1>
        <p className="text-muted-foreground">Agendamentos e visitas realizadas</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Agendadas</p>
          <p className="text-3xl font-bold mt-2">156</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Realizadas</p>
          <p className="text-3xl font-bold mt-2 text-green-600">134</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Não Compareceu</p>
          <p className="text-3xl font-bold mt-2 text-amber-600">18</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Canceladas</p>
          <p className="text-3xl font-bold mt-2 text-red-600">4</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Visitas da Semana</h3>
        <div className="space-y-3">
          {[
            { data: '22/05/2026', hora: '10:00', cliente: 'João Silva', empreendimento: 'Casa da Mata', status: 'Realizada' },
            { data: '22/05/2026', hora: '14:30', cliente: 'Maria Santos', empreendimento: 'Ares', status: 'Agendada' },
            { data: '23/05/2026', hora: '09:00', cliente: 'Pedro Costa', empreendimento: 'Verter', status: 'Agendada' },
            { data: '23/05/2026', hora: '16:00', cliente: 'Ana Paula', empreendimento: 'Gávea', status: 'Confirmada' },
          ].map((visita, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  🚶
                </div>
                <div>
                  <p className="font-medium">{visita.cliente}</p>
                  <p className="text-sm text-muted-foreground">{visita.empreendimento}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{visita.hora}</p>
                <p className="text-sm text-muted-foreground">{visita.data}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                visita.status === 'Realizada' ? 'bg-green-100 text-green-700' :
                visita.status === 'Agendada' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {visita.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
