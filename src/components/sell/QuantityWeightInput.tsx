import { Minus, Plus } from "lucide-react";

interface Props {
  quantity: number;
  onQuantityChange: (v: number) => void;
  weightVal: string;
  onWeightValChange: (v: string) => void;
}

const QuantityWeightInput = ({
  quantity,
  onQuantityChange,
  weightVal,
  onWeightValChange,
}: Props) => {
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
        <label className="text-xs font-medium text-foreground mb-1.5 block">Weight / Size (optional)</label>
        <input
          type="text"
          value={weightVal}
          onChange={(e) => onWeightValChange(e.target.value)}
          placeholder="e.g. 1kg, 500g, Bundle of 6"
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          Describe the fixed quantity buyers will receive
        </p>
      </div>
    </div>
  );
};

export default QuantityWeightInput;
