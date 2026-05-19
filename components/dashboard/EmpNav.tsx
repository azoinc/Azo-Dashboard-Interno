import { cn } from "@/lib/utils";

interface EmpNavProps {
  empreendimentos: string[];
  selected: string;
  onSelect: (emp: string) => void;
}

export function EmpNav({ empreendimentos, selected, onSelect }: EmpNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect("all")}
        className={cn(
          "px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap",
          selected === "all"
            ? "bg-marsala text-white"
            : "bg-muted hover:bg-muted/80"
        )}
      >
        Todos
      </button>
      {empreendimentos.map((emp) => (
        <button
          key={emp}
          onClick={() => onSelect(emp)}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap",
            selected === emp
              ? "bg-marsala text-white"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          {emp}
        </button>
      ))}
    </div>
  );
}
