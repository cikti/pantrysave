import { ChevronDown } from "lucide-react";

interface Props {
  weightVal: string;
  onWeightValChange: (v: string) => void;
}

const UNITS = ["kg", "g", "pcs"] as const;

const QuantityWeightInput = ({ weightVal, onWeightValChange }: Props) => {
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
    <div>
      <label className="text-xs font-medium text-foreground mb-1.5 block">Quantity</label>
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
        Buyer will receive this exact amount
      </p>
    </div>
  );
};

export default QuantityWeightInput;
