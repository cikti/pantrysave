import { MapPin, Truck, Clock } from "lucide-react";

export type DeliveryOptionKey = "pickup" | "lalamove" | "grab";

export interface DeliveryOptionConfig {
  key: DeliveryOptionKey;
  label: string;
  fee: number;
  estimatedTime: string;
}

const DELIVERY_DEFAULTS: Record<DeliveryOptionKey, { label: string; fee: number; time: string }> = {
  pickup: { label: "Self Pickup", fee: 0, time: "Ready in 1 hour" },
  lalamove: { label: "Lalamove", fee: 6, time: "1-3 hours" },
  grab: { label: "GrabExpress", fee: 8, time: "1-2 hours" },
};

const deliveryOptions: { value: DeliveryOptionKey; label: string; icon: typeof MapPin }[] = [
  { value: "pickup", label: "Self Pickup", icon: MapPin },
  { value: "lalamove", label: "Lalamove", icon: Truck },
  { value: "grab", label: "GrabExpress", icon: Truck },
];

// Legacy single-select export
export type DeliveryOption = DeliveryOptionKey;

interface Props {
  selected: DeliveryOptionKey[];
  onChange: (selected: DeliveryOptionKey[]) => void;
  fees?: Partial<Record<DeliveryOptionKey, number>>;
  onFeeChange?: (key: DeliveryOptionKey, fee: number) => void;
}

const DeliveryInput = ({ selected, onChange, fees, onFeeChange }: Props) => {
  const toggle = (key: DeliveryOptionKey) => {
    if (selected.includes(key)) {
      if (selected.length === 1) return; // Must have at least one
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div>
      <label className="text-xs font-medium text-foreground mb-1 block">Delivery Options</label>
      <p className="text-[11px] text-muted-foreground mb-2">Select all delivery methods you offer (at least one)</p>
      <div className="space-y-2">
        {deliveryOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected.includes(opt.value);
          const defaults = DELIVERY_DEFAULTS[opt.value];
          const currentFee = fees?.[opt.value] ?? defaults.fee;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`w-full flex items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition-all active:scale-[0.98] ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card opacity-60"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock size={10} /> {defaults.time}
                  </span>
                  <span className="text-[11px] font-medium text-primary">
                    {currentFee === 0 ? "Free" : `RM${currentFee}`}
                  </span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                isSelected ? "border-primary bg-primary" : "border-border"
              }`}>
                {isSelected && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom fee inputs for selected third-party options */}
      {selected.filter(k => k !== "pickup").length > 0 && onFeeChange && (
        <div className="mt-3 space-y-2">
          {selected.filter(k => k !== "pickup").map((key) => (
            <div key={key} className="flex items-center gap-2">
              <label className="text-[11px] text-muted-foreground w-20">{DELIVERY_DEFAULTS[key].label} fee:</label>
              <input
                type="number"
                value={fees?.[key] ?? DELIVERY_DEFAULTS[key].fee}
                onChange={(e) => onFeeChange(key, parseFloat(e.target.value) || 0)}
                className="flex-1 bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                min="0"
                step="0.5"
              />
              <span className="text-[11px] text-muted-foreground">RM</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryInput;
export { DELIVERY_DEFAULTS };
