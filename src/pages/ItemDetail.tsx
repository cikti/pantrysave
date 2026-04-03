import { useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Info, Check, MapPin, Truck, Minus, Plus, MessageCircle } from "lucide-react";
import { groceryItems } from "@/data/mockData";
import { toast } from "sonner";
import { motion, useScroll, useTransform } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useListings, useListingById } from "@/hooks/useListings";
import { useCart } from "@/contexts/CartContext";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";

const badgeColors: Record<string, string> = {
  expiry: "bg-[hsl(var(--badge-expiry))] text-primary-foreground",
  imperfect: "bg-primary text-primary-foreground",
  overstock: "bg-[hsl(var(--badge-overstock))] text-primary-foreground",
  sold: "bg-destructive text-destructive-foreground",
};

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { openChat } = useChat();
  const { user } = useAuth();
  const [reserved, setReserved] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const [qty, setQty] = useState(1);
  const [weightAmt, setWeightAmt] = useState(0.5);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const imageScale = useTransform(scrollY, [0, 200], [1, 1.15]);
  const imageOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);
  const { data: dbListings } = useListings();

  const isDbListing = id?.startsWith("db-");
  const dbId = isDbListing ? id.replace("db-", "") : null;
  // Use useListingById for direct links (fetches any status), fall back to listing from useListings
  const { data: directDbItem } = useListingById(dbId ?? undefined);
  const dbItem = directDbItem || dbListings?.find((l) => l.id === dbId);
  const mockItem = !isDbListing ? groceryItems.find((i) => i.id === id) : null;

  const isSold = dbItem?.status === "sold";
  const stockLeft = dbItem?.stock_quantity ?? null;

  // Normalize item data
  const item = mockItem
    ? {
        name: mockItem.name,
        seller: mockItem.seller,
        image: mockItem.image,
        weight: mockItem.weight,
        originalPrice: mockItem.originalPrice,
        discountPrice: mockItem.clearancePrice,
        badge: mockItem.badge,
        badgeType: mockItem.badgeType,
        reason: mockItem.reason,
        deliveryType: null as string | null,
        deliveryService: null as string | null,
        address: null as string | null,
        expiryDays: null as number | null,
        pricingType: "fixed" as string,
        pricePerUnit: null as number | null,
        unitType: "quantity" as string,
        maxQuantity: null as number | null,
      }
    : dbItem
    ? {
        name: dbItem.name,
        seller: dbItem.seller_name || dbItem.address || "Local seller",
        image: dbItem.image_url || "",
        weight: dbItem.weight || "",
        originalPrice: Number(dbItem.original_price),
        discountPrice: Number(dbItem.discount_price),
        badge: isSold ? "SOLD" : (dbItem.condition || "Discounted"),
        badgeType: isSold ? "sold" as const : "overstock" as const,
        reason: dbItem.reason || "Discounted item",
        deliveryType: dbItem.delivery_type,
        deliveryService: dbItem.delivery_service || null,
        address: dbItem.address,
        expiryDays: dbItem.expiry_days || null,
        pricingType: dbItem.pricing_type || "fixed",
        pricePerUnit: dbItem.price_per_unit ? Number(dbItem.price_per_unit) : null,
        unitType: dbItem.unit_type || "quantity",
        maxQuantity: stockLeft !== null ? stockLeft : (dbItem.max_quantity ? Number(dbItem.max_quantity) : null),
      }
    : null;

  const isFixed = item?.pricingType === "fixed";
  const isFlexible = item?.pricingType === "flexible";

  const isWeightUnit = item?.unitType === "kg" || item?.unitType === "g";
  const weightUnit = item?.unitType === "g" ? "g" : "kg";
  const maxAmount = item?.maxQuantity ?? undefined;

  // Show stock availability for all items
  const stockDisplay = stockLeft !== null ? stockLeft : (item?.maxQuantity ?? null);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Item not found.
      </div>
    );
  }

  const saving = (item.originalPrice - item.discountPrice).toFixed(2);
  const discount = Math.round(((item.originalPrice - item.discountPrice) / item.originalPrice) * 100);

  // Calculate subtotal
  let subtotal: number;
  if (isFixed) {
    subtotal = item.discountPrice;
  } else if (isFlexible && isWeightUnit) {
    const perUnit = item.pricePerUnit ?? item.discountPrice;
    subtotal = perUnit * weightAmt * (weightUnit === "g" ? 0.001 : 1);
  } else {
    // flexible quantity
    const perUnit = item.pricePerUnit ?? item.discountPrice;
    subtotal = perUnit * qty;
  }

  // Price display label
  const priceLabel = isFlexible && item.pricePerUnit
    ? `RM${item.pricePerUnit.toFixed(2)} / ${item.unitType === "quantity" ? "unit" : item.unitType}`
    : null;

  const handleReserve = async () => {
    if (reserved) return;

    if (isFixed) {
      // Fixed item — add as-is
      if (isDbListing && dbId) {
        await addToCart(dbId, 1, undefined, 1);
      } else if (mockItem && id) {
        await addToCart(id, 1, {
          name: item.name,
          image_url: item.image,
          discount_price: item.discountPrice,
          original_price: item.originalPrice,
          weight: item.weight,
        }, 1);
      }
    } else if (isFlexible && isWeightUnit) {
      // Flexible weight — store subtotal as price, 1 qty
      if (isDbListing && dbId) {
        await addToCart(dbId, 1, undefined, 1);
      } else if (mockItem && id) {
        await addToCart(id, 1, {
          name: item.name,
          image_url: item.image,
          discount_price: subtotal,
          original_price: item.originalPrice,
          weight: `${weightAmt} ${weightUnit}`,
        }, 1);
      }
    } else {
      // Flexible quantity
      if (isDbListing && dbId) {
        await addToCart(dbId, qty, undefined, maxAmount);
      } else if (mockItem && id) {
        await addToCart(id, qty, {
          name: item.name,
          image_url: item.image,
          discount_price: item.pricePerUnit ?? item.discountPrice,
          original_price: item.originalPrice,
          weight: item.weight,
        }, maxAmount);
      }
    }

    setReserved(true);
    setShowFloat(true);
    toast.success(`Added to cart! 🛒 ${item.name}`, {
      description: "Good choice for the planet 🌿",
    });
    setTimeout(() => setShowFloat(false), 1200);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-28" ref={scrollRef}>
        <div className="relative overflow-hidden max-h-[280px] sm:max-h-[340px]">
          {item.image ? (
            <motion.img
              src={item.image}
              alt={item.name}
              width={640}
              height={640}
              className="w-full h-full object-cover"
              style={{ scale: imageScale, opacity: imageOpacity }}
            />
          ) : (
            <div className="w-full h-[280px] bg-muted" />
          )}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <ArrowLeft size={18} />
          </button>
          <span
            className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full ${
              badgeColors[item.badgeType] || "bg-primary text-primary-foreground"
            }`}
          >
            {item.badge}
          </span>
        </div>

        <div className="px-5 pt-5">
          <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-xs text-muted-foreground">
            {item.seller}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="text-xl font-bold text-foreground mt-1">
            {item.name}
          </motion.h2>
          {item.weight && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm text-muted-foreground mt-1">
              {item.weight}
            </motion.p>
          )}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex items-baseline gap-3 mt-3">
            <span className="text-muted-foreground line-through text-sm">RM{item.originalPrice.toFixed(2)}</span>
            <span className="text-2xl font-bold text-primary">
              {isFixed ? `RM${item.discountPrice.toFixed(2)}` : priceLabel || `RM${item.discountPrice.toFixed(2)}`}
            </span>
            {isFixed && (
              <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">{discount}% off</span>
            )}
          </motion.div>

          {/* Pricing type label */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }} className="mt-1">
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {isFixed ? "Fixed price" : `Flexible — per ${item.unitType === "quantity" ? "unit" : item.unitType}`}
            </span>
          </motion.div>

          {isFixed && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary bg-accent px-3 py-1 rounded-full">
              🎉 You save RM{saving}
            </motion.div>
          )}

          {/* Delivery info */}
          {item.deliveryType && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="mt-4 flex items-center gap-2 text-xs text-foreground">
              {item.deliveryType === "pickup" ? (
                <>
                  <MapPin size={14} className="text-primary" />
                  <span>Self Pickup{item.address ? ` — ${item.address}` : ""}</span>
                </>
              ) : (
                <>
                  <Truck size={14} className="text-primary" />
                  <span>
                    {item.deliveryService
                      ? `${item.deliveryService.charAt(0).toUpperCase() + item.deliveryService.slice(1)} Delivery`
                      : "Third-party Delivery"}
                  </span>
                </>
              )}
            </motion.div>
          )}

          {/* Expiry info */}
          {item.expiryDays && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.39 }} className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-[hsl(var(--badge-expiry))]" />
              Expires in ~{item.expiryDays} day{item.expiryDays > 1 ? "s" : ""}
            </motion.div>
          )}

          {/* Reason */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 bg-accent/60 rounded-xl p-4 flex gap-3">
            <Info size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-accent-foreground">Why it's discounted</p>
              <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
            </div>
          </motion.div>

          {/* Chat with Seller button */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!user) {
                toast.error("Please log in to chat with the seller");
                navigate("/login");
                return;
              }
              const sellerId = dbItem?.user_id || "mock-seller";
              openChat(undefined, {
                productId: id || "",
                productName: item.name,
                productImage: item.image,
                sellerId,
                sellerName: item.seller,
              });
            }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <MessageCircle size={16} className="text-primary" />
            Chat with Seller
          </motion.button>
        </div>

        {showFloat && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <span className="animate-float-up text-lg font-bold text-primary">+50 points 🌿</span>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border z-30 p-4">
          {/* Quantity / Weight selector — only for flexible */}
          {!reserved && isFlexible && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-3">
              {isWeightUnit ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">Weight:</span>
                  <div className="flex items-center gap-1.5 bg-muted rounded-xl px-1 py-1">
                    <button
                      onClick={() => setWeightAmt((v) => Math.max(weightUnit === "kg" ? 0.25 : 50, weightUnit === "kg" ? +(v - 0.25).toFixed(2) : v - 50))}
                      className="w-8 h-8 rounded-lg bg-card flex items-center justify-center active:scale-90 transition-transform shadow-sm"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold text-foreground w-16 text-center">
                      {weightUnit === "kg" ? weightAmt.toFixed(2) : weightAmt} {weightUnit}
                    </span>
                    <button
                      onClick={() => setWeightAmt((v) => {
                        const next = weightUnit === "kg" ? +(v + 0.25).toFixed(2) : v + 50;
                        if (maxAmount && next > maxAmount) { toast.error(`Max available: ${maxAmount} ${weightUnit}`); return v; }
                        return next;
                      })}
                      className={`w-8 h-8 rounded-lg bg-card flex items-center justify-center active:scale-90 transition-transform shadow-sm ${maxAmount && weightAmt >= maxAmount ? "opacity-40" : ""}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">Qty:</span>
                  <div className="flex items-center gap-1.5 bg-muted rounded-xl px-1 py-1">
                    <button
                      onClick={() => setQty((v) => Math.max(1, v - 1))}
                      className="w-8 h-8 rounded-lg bg-card flex items-center justify-center active:scale-90 transition-transform shadow-sm"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold text-foreground w-8 text-center">{qty}</span>
                    <button
                      onClick={() => setQty((v) => {
                        const next = v + 1;
                        if (maxAmount && next > maxAmount) { toast.error(`Max available: ${maxAmount}`); return v; }
                        return next;
                      })}
                      className={`w-8 h-8 rounded-lg bg-card flex items-center justify-center active:scale-90 transition-transform shadow-sm ${maxAmount && qty >= maxAmount ? "opacity-40" : ""}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
              <span className="text-sm font-bold text-primary">RM{subtotal.toFixed(2)}</span>
            </motion.div>
          )}

          <motion.button
            onClick={handleReserve}
            disabled={isSold}
            whileTap={!reserved && !isSold ? { scale: 0.96 } : {}}
            className={`w-full font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-colors duration-300 ${
              isSold
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : reserved ? "bg-accent text-primary" : "bg-primary text-primary-foreground"
            }`}
          >
            {isSold ? (
              "Sold Out"
            ) : reserved ? (
              <>
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Check size={18} />
                </motion.span>
                Added ✓
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                Add to Cart — RM{subtotal.toFixed(2)}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
};

export default ItemDetail;
