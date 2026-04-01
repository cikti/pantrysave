import { useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { categories } from "@/data/mockData";

const conditions = ["Near Expiry", "Overstock", "Imperfect Look"];

const SellPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: "",
    weight: "",
    condition: "",
    originalPrice: "",
    discountPrice: "",
  });

  const update = (key: string, val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Item listed successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-foreground">List an Item</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-5 space-y-5 mt-2">
        {/* Photo upload */}
        <div className="w-full aspect-[4/3] rounded-2xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
          <Camera size={32} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Tap to add photo
          </span>
        </div>

        <InputField
          label="Item / Bundle Name"
          value={form.name}
          onChange={(v) => update("name", v)}
          placeholder="e.g. Vine Tomatoes"
        />

        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select category</option>
            {categories.slice(1).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <InputField
          label="Quantity / Weight"
          value={form.weight}
          onChange={(v) => update("weight", v)}
          placeholder="e.g. 1kg, Bundle, 3 pcs"
        />

        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            Condition
          </label>
          <select
            value={form.condition}
            onChange={(e) => update("condition", e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select condition</option>
            {conditions.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Original Price (RM)"
            value={form.originalPrice}
            onChange={(v) => update("originalPrice", v)}
            placeholder="0.00"
            type="number"
          />
          <InputField
            label="Discount Price (RM)"
            value={form.discountPrice}
            onChange={(v) => update("discountPrice", v)}
            placeholder="0.00"
            type="number"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
        >
          List Item
        </button>
      </form>
    </div>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) => (
  <div>
    <label className="text-xs font-medium text-foreground mb-1.5 block">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);

export default SellPage;
