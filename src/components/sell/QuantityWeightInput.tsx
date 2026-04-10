import { Minus, Plus, ChevronDown } from "lucide-react";

interface Props {
  quantity: number;
  onQuantityChange: (v: number) => void;
  weightVal: string;
  onWeightValChange: (v: string) => void;
}

const UNITS = ["kg", "g", "pcs"] as const;

const QuantityWeightInput = ({
  quantity,
  onQuantityChange,
  weightVal,
  onWeightValChange,
}: Props) => {
  // Parse existing weightVal into number + unit
  const parseWeight = () => {
    const match = weightVal.match(/^(\d*\.?\d*)\s*(kg|g|pcs)?$/i);
    if (match) {
      return { num: match[1] || "", unit: (match[2]?.toLowerCase() || "kg") as typeof UNITS[number] };
    }
    return { num: "", unit: "kg" as typeof UNITS[number] };
  };

  const { num, unit } = parseWeight();

  const updateWeight = (newNum: string, newUnit: string) => {
    const cleaned = newNum.replace(/[^0-9.]/g, "");
    onWeightValChange(cleaned ? `${cleaned} ${newUnit}` : "");
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">Quantity Available</label>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform"
          >
            <Minus size={16} />
          </button>
          <span className="text-2xl font-bold text-foreground w-12 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">Weight / Size</label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={num}
            onChange={(e) => updateWeight(e.target.value, unit)}
            placeholder="e.g. 500"
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          <div className="relative">
            <select
              value={unit}
              onChange={(e) => updateWeight(num, e.target.value)}
              className="appearance-none bg-card border border-border rounded-xl px-4 py-3 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow cursor-pointer"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Enter the amount buyers will receive (e.g. "2 kg" or "500 g" or "3 pcs")
        </p>
      </div>
    </div>
  );
};

export default QuantityWeightInput;
