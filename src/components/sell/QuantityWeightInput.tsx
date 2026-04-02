import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Mode = "quantity" | "weight";
type WeightUnit = "kg" | "g";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const QuantityWeightInput = ({ value, onChange }: Props) => {
  const [mode, setMode] = useState<Mode>("quantity");
  const [quantity, setQuantity] = useState(1);
  const [weightVal, setWeightVal] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");

  const handleModeChange = (val: string) => {
    if (!val) return;
    const m = val as Mode;
    setMode(m);
    if (m === "quantity") {
      onChange(`${quantity} pcs`);
    } else {
      onChange(weightVal ? `${weightVal} ${unit}` : "");
    }
  };

  const adjustQuantity = (delta: number) => {
    const next = Math.max(1, quantity + delta);
    setQuantity(next);
    onChange(`${next} pcs`);
  };

  const handleWeightChange = (raw: string) => {
    let sanitized = raw;
    if (unit === "g") {
      sanitized = raw.replace(/[^0-9]/g, "");
    } else {
      sanitized = raw.replace(/[^0-9.]/g, "");
      const parts = sanitized.split(".");
      if (parts.length > 2) sanitized = parts[0] + "." + parts.slice(1).join("");
      if (parts[1]?.length > 2) sanitized = parts[0] + "." + parts[1].slice(0, 2);
    }
    setWeightVal(sanitized);
    onChange(sanitized ? `${sanitized} ${unit}` : "");
  };

  const handleUnitChange = (val: string) => {
    if (!val) return;
    const u = val as WeightUnit;
    setUnit(u);
    if (u === "g") {
      const whole = weightVal.split(".")[0] || "";
      setWeightVal(whole);
      onChange(whole ? `${whole} g` : "");
    } else {
      onChange(weightVal ? `${weightVal} kg` : "");
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-foreground block">Quantity / Weight</label>

      <ToggleGroup type="single" value={mode} onValueChange={handleModeChange} className="w-full grid grid-cols-2 gap-2 bg-muted rounded-xl p-1">
        <ToggleGroupItem value="quantity" className="rounded-lg text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          Quantity
        </ToggleGroupItem>
        <ToggleGroupItem value="weight" className="rounded-lg text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          Weight
        </ToggleGroupItem>
      </ToggleGroup>

      {mode === "quantity" ? (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => adjustQuantity(-1)}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform"
          >
            <Minus size={16} />
          </button>
          <span className="text-2xl font-bold text-foreground w-12 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => adjustQuantity(1)}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus size={16} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={weightVal}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder={unit === "kg" ? "e.g. 1.25" : "e.g. 500"}
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          <ToggleGroup type="single" value={unit} onValueChange={handleUnitChange} className="bg-muted rounded-xl p-1">
            <ToggleGroupItem value="kg" className="rounded-lg text-xs font-medium px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              kg
            </ToggleGroupItem>
            <ToggleGroupItem value="g" className="rounded-lg text-xs font-medium px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              g
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
    </div>
  );
};

export default QuantityWeightInput;
