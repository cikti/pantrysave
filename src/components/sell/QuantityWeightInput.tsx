import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type PricingType = "fixed" | "flexible";
type UnitType = "kg" | "g" | "quantity";

interface Props {
  pricingType: PricingType;
  onPricingTypeChange: (v: PricingType) => void;
  unitType: UnitType;
  onUnitTypeChange: (v: UnitType) => void;
  quantity: number;
  onQuantityChange: (v: number) => void;
  weightVal: string;
  onWeightValChange: (v: string) => void;
  maxQuantity: string;
  onMaxQuantityChange: (v: string) => void;
}

const QuantityWeightInput = ({
  pricingType,
  onPricingTypeChange,
  unitType,
  onUnitTypeChange,
  quantity,
  onQuantityChange,
  weightVal,
  onWeightValChange,
  maxQuantity,
  onMaxQuantityChange,
}: Props) => {

  const handleWeightChange = (raw: string) => {
    let sanitized = raw;
    if (unitType === "g") {
      sanitized = raw.replace(/[^0-9]/g, "");
    } else {
      sanitized = raw.replace(/[^0-9.]/g, "");
      const parts = sanitized.split(".");
      if (parts.length > 2) sanitized = parts[0] + "." + parts.slice(1).join("");
      if (parts[1]?.length > 2) sanitized = parts[0] + "." + parts[1].slice(0, 2);
    }
    onWeightValChange(sanitized);
  };

  return (
    <div className="space-y-4">
      {/* Pricing Type Toggle */}
      <div>
        <label className="text-xs font-medium text-foreground mb-1.5 block">Pricing Type</label>
        <ToggleGroup
          type="single"
          value={pricingType}
          onValueChange={(v) => v && onPricingTypeChange(v as PricingType)}
          className="w-full grid grid-cols-2 gap-2 bg-muted rounded-xl p-1"
        >
          <ToggleGroupItem value="fixed" className="rounded-lg text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            Fixed Item
          </ToggleGroupItem>
          <ToggleGroupItem value="flexible" className="rounded-lg text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            Flexible Pricing
          </ToggleGroupItem>
        </ToggleGroup>
        <p className="text-[11px] text-muted-foreground mt-1">
          {pricingType === "fixed"
            ? "Whole product at a set price (e.g., a bag of rice)"
            : "Price per unit — buyer chooses how much to buy"}
        </p>
      </div>

      {pricingType === "fixed" ? (
        /* Fixed: just quantity (usually 1) */
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
      ) : (
        /* Flexible: unit type + max available */
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Unit Type</label>
            <ToggleGroup
              type="single"
              value={unitType}
              onValueChange={(v) => v && onUnitTypeChange(v as UnitType)}
              className="w-full grid grid-cols-3 gap-2 bg-muted rounded-xl p-1"
            >
              <ToggleGroupItem value="kg" className="rounded-lg text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                per kg
              </ToggleGroupItem>
              <ToggleGroupItem value="g" className="rounded-lg text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                per g
              </ToggleGroupItem>
              <ToggleGroupItem value="quantity" className="rounded-lg text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                per unit
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">
              Max Available ({unitType === "quantity" ? "units" : unitType})
            </label>
            {unitType === "quantity" ? (
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => onMaxQuantityChange(String(Math.max(1, parseInt(maxQuantity || "1") - 1)))}
                  className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Minus size={16} />
                </button>
                <span className="text-2xl font-bold text-foreground w-12 text-center">{maxQuantity || "1"}</span>
                <button
                  type="button"
                  onClick={() => onMaxQuantityChange(String(parseInt(maxQuantity || "1") + 1))}
                  className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <input
                type="text"
                inputMode="decimal"
                value={weightVal}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder={unitType === "kg" ? "e.g. 5.0" : "e.g. 500"}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantityWeightInput;
