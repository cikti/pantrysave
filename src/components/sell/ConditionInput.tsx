import { Minus, Plus } from "lucide-react";

const conditions = ["Fresh", "Near Expiry", "Slightly Imperfect", "Surplus"];

interface Props {
  condition: string;
  expiryDays: number;
  onConditionChange: (v: string) => void;
  onExpiryDaysChange: (v: number) => void;
}

const ConditionInput = ({ condition, expiryDays, onConditionChange, onExpiryDaysChange }: Props) => {
  const adjustDays = (delta: number) => {
    onExpiryDaysChange(Math.min(7, Math.max(1, expiryDays + delta)));
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-foreground block">Condition</label>
      <div className="grid grid-cols-2 gap-2">
        {conditions.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onConditionChange(c)}
            className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all active:scale-95 ${
              condition === c
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {condition === "Near Expiry" && (
        <div className="bg-card border border-border rounded-xl p-3 space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Days before expiry</label>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => adjustDays(-1)}
              className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center active:scale-90 transition-transform"
            >
              <Minus size={14} />
            </button>
            <span className="text-xl font-bold text-foreground w-8 text-center">{expiryDays}</span>
            <button
              type="button"
              onClick={() => adjustDays(1)}
              className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center active:scale-90 transition-transform"
            >
              <Plus size={14} />
            </button>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionInput;
