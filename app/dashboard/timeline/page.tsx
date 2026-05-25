'use client';

export default function TimelinePage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Timeline</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Histórico e linha do tempo</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
        <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">📅</div>
        <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Em desenvolvimento</h3>
        <p className="text-muted-foreground text-sm">Esta área está sendo implementada.</p>
      </div>
    </div>
  );
}
