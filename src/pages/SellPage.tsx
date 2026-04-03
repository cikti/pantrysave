import { useState } from "react";
import { ArrowLeft, Camera, ImagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { categories } from "@/data/mockData";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import LocationPicker from "@/components/LocationPicker";
import QuantityWeightInput from "@/components/sell/QuantityWeightInput";
import ConditionInput from "@/components/sell/ConditionInput";
import DeliveryInput, { type DeliveryOptionKey, DELIVERY_DEFAULTS } from "@/components/sell/DeliveryInput";
import { useCreateListing } from "@/hooks/useListings";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useImpact } from "@/hooks/useImpact";

const steps = ["Photo", "Details", "Location", "Pricing"];

const SellPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createListing = useCreateListing();
  const { incrementItemsListed } = useImpact();
  const [currentStep, setCurrentStep] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    weight: "",
    condition: "",
    expiryDays: 3,
    originalPrice: "",
    discountPrice: "",
    deliveryType: "pickup" as DeliveryOption,
    latitude: null as number | null,
    longitude: null as number | null,
    address: "",
    reason: "",
    pricingType: "fixed" as "fixed" | "flexible",
    unitType: "quantity" as "kg" | "g" | "quantity",
    quantity: 1,
    weightVal: "",
    maxQuantity: "1",
    pricePerUnit: "",
  });

  const update = (key: string, val: any) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
        setCurrentStep(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      let image_url: string | undefined;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(path, imageFile);
        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(path);
          image_url = urlData.publicUrl;
        }
      }

      // Fetch seller name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      const sellerName = profile?.name || user.email?.split("@")[0] || "Seller";

      const deliveryType = form.deliveryType === "pickup" ? "pickup" : "third_party";
      const deliveryService = form.deliveryType !== "pickup" ? form.deliveryType : undefined;

      // Set delivery fee for third-party
      const deliveryFee = form.deliveryType === "grab" ? 8 : form.deliveryType === "lalamove" ? 6 : 0;

      // Build weight string for display
      const weightStr = form.pricingType === "fixed"
        ? `${form.quantity} pcs`
        : form.unitType === "quantity"
          ? `${form.maxQuantity} pcs`
          : `${form.weightVal} ${form.unitType}`;

      const discountPrice = form.pricingType === "fixed"
        ? parseFloat(form.discountPrice)
        : parseFloat(form.pricePerUnit);

      const maxQty = form.pricingType === "flexible"
        ? (form.unitType === "quantity" ? parseFloat(form.maxQuantity) : parseFloat(form.weightVal))
        : form.quantity;

      await createListing.mutateAsync({
        name: form.name,
        category: form.category || undefined,
        condition: form.condition || undefined,
        weight: weightStr || undefined,
        original_price: parseFloat(form.originalPrice),
        discount_price: discountPrice,
        image_url,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
        address: form.address || undefined,
        delivery_type: deliveryType as "pickup" | "third_party",
        delivery_service: deliveryService,
        delivery_fee: deliveryFee,
        seller_name: sellerName,
        reason: form.reason || `${form.condition || "Discounted"} — perfectly good to use.`,
        expiry_days: form.condition === "Near Expiry" ? form.expiryDays : undefined,
        pricing_type: form.pricingType,
        price_per_unit: form.pricingType === "flexible" ? parseFloat(form.pricePerUnit) : undefined,
        unit_type: form.pricingType === "flexible" ? form.unitType : "quantity",
        max_quantity: maxQty || undefined,
        stock_quantity: maxQty ? Math.floor(maxQty) : 1,
      });

      try { await incrementItemsListed.mutateAsync(1); } catch {}
      toast.success("You rescued this item! 🌿", {
        description: "Your listing is now live",
      });
      navigate("/");
    } catch {
      toast.error("Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  const filledFields = [
    imagePreview,
    form.name && form.category && form.condition,
    form.latitude && form.longitude,
    form.originalPrice && (form.pricingType === "fixed" ? form.discountPrice : form.pricePerUnit),
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
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {imagePreview ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative"
              >
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 right-2 bg-card/80 backdrop-blur px-2 py-1 rounded-full text-[10px] text-muted-foreground flex items-center gap-1">
                  <ImagePlus size={12} /> Change
                </div>
              </motion.div>
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 active:bg-muted transition-colors">
                <Camera size={32} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Tap to add photo</span>
              </div>
            )}
          </label>

          <InputField
            label="Item / Bundle Name"
            value={form.name}
            onChange={(v) => update("name", v)}
            placeholder="e.g. Vine Tomatoes"
          />

          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Category</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            >
              <option value="">Select category</option>
              {categories.slice(1).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Quantity / Weight / Pricing Type */}
          <QuantityWeightInput
            pricingType={form.pricingType}
            onPricingTypeChange={(v) => update("pricingType", v)}
            unitType={form.unitType}
            onUnitTypeChange={(v) => update("unitType", v)}
            quantity={form.quantity}
            onQuantityChange={(v) => update("quantity", v)}
            weightVal={form.weightVal}
            onWeightValChange={(v) => update("weightVal", v)}
            maxQuantity={form.maxQuantity}
            onMaxQuantityChange={(v) => update("maxQuantity", v)}
          />

          {/* Condition */}
          <ConditionInput
            condition={form.condition}
            expiryDays={form.expiryDays}
            onConditionChange={(v) => update("condition", v)}
            onExpiryDaysChange={(v) => update("expiryDays", v)}
          />

          <InputField
            label="Why it's discounted"
            value={form.reason}
            onChange={(v) => update("reason", v)}
            placeholder="e.g. Approaching best-before date but safe to eat"
          />

          {/* Location picker */}
          <LocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            address={form.address}
            onLocationChange={(lat, lng) => {
              update("latitude", lat);
              update("longitude", lng);
            }}
            onAddressChange={(a) => update("address", a)}
          />

          {/* Delivery type */}
          <DeliveryInput
            value={form.deliveryType}
            onChange={(v) => update("deliveryType", v)}
          />

          {form.pricingType === "fixed" ? (
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
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Original Price (RM)"
                  value={form.originalPrice}
                  onChange={(v) => update("originalPrice", v)}
                  placeholder="0.00"
                  type="number"
                />
                <InputField
                  label={`Price per ${form.unitType === "quantity" ? "unit" : form.unitType} (RM)`}
                  value={form.pricePerUnit}
                  onChange={(v) => update("pricePerUnit", v)}
                  placeholder="0.00"
                  type="number"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Buyer will pay: RM{form.pricePerUnit || "0"} × amount selected
              </p>
            </div>
          )}

          <motion.button
            type="submit"
            disabled={submitting || !form.name || !form.originalPrice || (form.pricingType === "fixed" ? !form.discountPrice : !form.pricePerUnit)}
            whileTap={{ scale: 0.96 }}
            className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl shadow-lg transition-transform disabled:opacity-50"
          >
            {submitting ? "Listing..." : "List Item"}
          </motion.button>
        </form>
      </div>
    </PageTransition>
  );
};

const InputField = ({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) => (
  <div>
    <label className="text-xs font-medium text-foreground mb-1.5 block">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
    />
  </div>
);

export default SellPage;
