import { MapPin, Truck } from "lucide-react";

const deliveryOptions = [
  { value: "pickup", label: "Self Pickup", icon: MapPin },
  { value: "lalamove", label: "Lalamove", icon: Truck },
  { value: "grab", label: "Grab", icon: Truck },
] as const;

export type DeliveryOption = "pickup" | "lalamove" | "grab";

interface Props {
  value: DeliveryOption;
  onChange: (v: DeliveryOption) => void;
}

const DeliveryInput = ({ value, onChange }: Props) => (
  <div>
    <label className="text-xs font-medium text-foreground mb-2 block">Delivery Option</label>
    <div className="grid grid-cols-3 gap-2">
      {deliveryOptions.map((opt) => {
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-[11px] font-medium transition-all active:scale-95 ${
              value === opt.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground"
            }`}
          >
            <Icon size={16} />
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

export default DeliveryInput;
