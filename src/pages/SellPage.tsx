import { useState } from "react";
import { ArrowLeft, Camera, ImagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { categories } from "@/data/mockData";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const conditions = ["Near Expiry", "Overstock", "Imperfect Look"];

const steps = ["Photo", "Details", "Pricing"];

const SellPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
        setCurrentStep(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("You rescued this item! 🌿", {
      description: "Your listing is now live",
    });
    navigate("/");
  };

  const filledFields = [
    imagePreview,
    form.name && form.category && form.weight && form.condition,
    form.originalPrice && form.discountPrice,
  ];
  const activeStep = filledFields.filter(Boolean).length;

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-foreground">List an Item</h1>
        </header>

        {/* Step indicator */}
        <div className="px-5 mb-4 flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: i <= activeStep ? "hsl(var(--primary))" : "hsl(var(--muted))",
                    scale: i === activeStep ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                >
                  {i + 1}
                </motion.div>
                <span className="text-[9px] text-muted-foreground mt-1">{step}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-muted rounded-full -mt-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: i < activeStep ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-5 space-y-5 mt-2">
          {/* Photo upload */}
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {imagePreview ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-card/80 backdrop-blur px-2 py-1 rounded-full text-[10px] text-muted-foreground flex items-center gap-1">
                  <ImagePlus size={12} /> Change
                </div>
              </motion.div>
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 active:bg-muted transition-colors">
                <Camera size={32} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Tap to add photo
                </span>
              </div>
            )}
          </label>

          <InputField
            label="Item / Bundle Name"
            value={form.name}
            onChange={(v) => { update("name", v); if (v) setCurrentStep(Math.max(currentStep, 1)); }}
            placeholder="e.g. Vine Tomatoes"
          />

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring input-glow transition-shadow"
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
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring input-glow transition-shadow"
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
              onChange={(v) => { update("originalPrice", v); if (v) setCurrentStep(Math.max(currentStep, 2)); }}
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

          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl shadow-lg transition-transform"
          >
            List Item
          </motion.button>
        </form>
      </div>
    </PageTransition>
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
      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring input-glow transition-shadow"
    />
  </div>
);

export default SellPage;
