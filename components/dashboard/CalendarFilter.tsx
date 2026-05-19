import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarFilterProps {
  onPeriodChange: (period: { inicio: string; fim: string }) => void;
}

export function CalendarFilter({ onPeriodChange }: CalendarFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleApply = () => {
    if (startDate && endDate) {
      onPeriodChange({
        inicio: startDate.toISOString().split('T')[0],
        fim: endDate.toISOString().split('T')[0],
      });
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onPeriodChange({ inicio: "", fim: "" });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        {startDate && endDate ? (
          <span>
            {format(startDate, "dd/MMM", { locale: ptBR })} –{" "}
            {format(endDate, "dd/MMM", { locale: ptBR })}
          </span>
        ) : (
          <span>Selecionar datas</span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-card border border-border rounded-lg shadow-lg p-4 z-50 w-80">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Data Início</label>
              <input
                type="date"
                value={startDate?.toISOString().split('T')[0] || ""}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Fim</label>
              <input
                type="date"
                value={endDate?.toISOString().split('T')[0] || ""}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApply} className="flex-1">
                Aplicar
              </Button>
              <Button variant="outline" onClick={handleClear} className="flex-1">
                Limpar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
