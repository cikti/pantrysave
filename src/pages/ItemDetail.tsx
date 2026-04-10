import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Info, Check, MapPin, Truck, MessageCircle, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion, useScroll, useTransform } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useListings, useListingById } from "@/hooks/useListings";
import { useCart } from "@/contexts/CartContext";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useGeolocation } from "@/hooks/useGeolocation";

const badgeColors: Record<string, string> = {
  expiry: "bg-[hsl(var(--badge-expiry))] text-primary-foreground",
  imperfect: "bg-primary text-primary-foreground",
  overstock: "bg-[hsl(var(--badge-overstock))] text-primary-foreground",
  sold: "bg-destructive text-destructive-foreground",
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type DeliveryOpt = { key: string; label: string; fee: number; estimatedTime: string };

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items: cartItems } = useCart();
  const { openChat } = useChat();
  const { user } = useAuth();
  const { position: buyerPos } = useGeolocation();
  const [reserved, setReserved] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const imageScale = useTransform(scrollY, [0, 200], [1, 1.15]);
  const imageOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);
  const { data: dbListings } = useListings();

  const dbId = id?.startsWith("db-") ? id.replace("db-", "") : id;
  const { data: directDbItem } = useListingById(dbId ?? undefined);
  const dbItem = directDbItem || dbListings?.find((l) => l.id === dbId);

  const isSold = dbItem?.status === "sold";

  const item = dbItem
    ? {
        name: dbItem.name,
        seller: dbItem.seller_name || dbItem.address || "Local seller",
        image: dbItem.image_url || "",
        weight: dbItem.weight || "",
        originalPrice: Number(dbItem.original_price),
        discountPrice: Number(dbItem.discount_price),
        badge: isSold ? "SOLD" : (dbItem.condition || "Discounted"),
        badgeType: isSold ? "sold" as const : (dbItem.condition === "Near Expiry" ? "expiry" as const : dbItem.condition === "Slightly Imperfect" ? "imperfect" as const : "overstock" as const),
        reason: dbItem.reason || "Discounted item",
        deliveryType: dbItem.delivery_type,
        deliveryService: dbItem.delivery_service || null,
        address: dbItem.address,
        expiryDays: dbItem.expiry_days || null,
        latitude: dbItem.latitude,
        longitude: dbItem.longitude,
      }
    : null;

  // Parse delivery options from listing
  const deliveryOptions: DeliveryOpt[] = (() => {
    const raw = (dbItem as any)?.delivery_options;
    if (Array.isArray(raw) && raw.length > 0) return raw;
    // Fallback for legacy listings
    if (item?.deliveryType === "pickup") {
      return [{ key: "pickup", label: "Self Pickup", fee: 0, estimatedTime: "Ready in 1 hour" }];
    }
    if (item?.deliveryType === "third_party") {
      const svc = item.deliveryService || "grab";
      return [
        { key: "pickup", label: "Self Pickup", fee: 0, estimatedTime: "Ready in 1 hour" },
        { key: svc, label: svc.charAt(0).toUpperCase() + svc.slice(1), fee: 6, estimatedTime: "1-3 hours" },
      ];
    }
    return [{ key: "pickup", label: "Self Pickup", fee: 0, estimatedTime: "Ready in 1 hour" }];
  })();

  // Calculate distance
  const distanceKm = buyerPos && item?.latitude && item?.longitude
    ? haversineKm(buyerPos[0], buyerPos[1], item.latitude, item.longitude)
    : null;

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Item not found.
      </div>
    );
  }

  const saving = (item.originalPrice - item.discountPrice).toFixed(2);
  const discount = Math.round(((item.originalPrice - item.discountPrice) / item.originalPrice) * 100);

  const cartListingId = dbId;
  const isInCart = cartItems.some((ci) => ci.listing_id === cartListingId && !ci.isSold);

  const handleReserve = async () => {
    if (reserved || isInCart) {
      if (isInCart) navigate("/cart");
      return;
    }
    if (dbId) await addToCart(dbId, 1, undefined, 1);
    setReserved(true);
    setShowFloat(true);
    toast.success(`Added to cart! 🛒 ${item.name}`, { description: "Good choice for the planet 🌿" });
    setTimeout(() => setShowFloat(false), 1200);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-28" ref={scrollRef}>
        <div className="relative overflow-hidden max-h-[340px] sm:max-h-[400px] bg-muted/30 flex items-center justify-center">
          {item.image ? (
            <motion.img src={item.image} alt={item.name} width={640} height={640} className="w-full h-full object-contain p-2" style={{ scale: imageScale, opacity: imageOpacity }} />
          ) : (
            <div className="w-full h-[280px] bg-muted" />
          )}
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <ArrowLeft size={18} />
          </button>
          <span className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full ${badgeColors[item.badgeType] || "bg-primary text-primary-foreground"}`}>
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
            <span className="text-2xl font-bold text-primary">RM{item.discountPrice.toFixed(2)}</span>
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">{discount}% off</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary bg-accent px-3 py-1 rounded-full">
            🎉 You save RM{saving}
          </motion.div>

          {/* All Delivery Options */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-foreground">Delivery Options</p>
            {deliveryOptions.map((opt) => {
              const isPickup = opt.key === "pickup";
              const Icon = isPickup ? MapPin : opt.key === "grab" ? Zap : Truck;
              return (
                <div key={opt.key} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {opt.estimatedTime}
                    </p>
                    {isPickup && distanceKm !== null && (
                      <p className="text-[11px] font-medium text-primary mt-0.5">
                        📍 {distanceKm.toFixed(1)}km from you
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-semibold shrink-0">
                    {opt.fee > 0 ? <span className="text-primary">RM{opt.fee.toFixed(2)}</span> : <span className="text-muted-foreground">Free</span>}
                  </span>
                </div>
              );
            })}
          </motion.div>

          {/* Expiry info */}
          {item.expiryDays && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.39 }} className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-[hsl(var(--badge-expiry))]" />
              Expires in ~{item.expiryDays} day{item.expiryDays > 1 ? "s" : ""}
            </motion.div>
          )}

          {/* Reason */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-5 bg-accent/60 rounded-xl p-4 flex gap-3">
            <Info size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-accent-foreground">Why it's discounted</p>
              <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
            </div>
          </motion.div>

          {/* Chat with Seller */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!user) { toast.error("Please log in to chat with the seller"); navigate("/login"); return; }
              const sellerId = dbItem?.user_id || "mock-seller";
              openChat(undefined, { productId: dbId || id || "", productName: item.name, productImage: item.image, sellerId, sellerName: item.seller });
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
          <motion.button
            onClick={handleReserve}
            disabled={isSold}
            whileTap={!reserved && !isSold && !isInCart ? { scale: 0.96 } : {}}
            className={`w-full font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-colors duration-300 ${
              isSold ? "bg-muted text-muted-foreground cursor-not-allowed"
                : isInCart ? "bg-amber-400 text-amber-900"
                  : reserved ? "bg-accent text-primary" : "bg-primary text-primary-foreground"
            }`}
          >
            {isSold ? "Sold Out" : isInCart ? (
              <><ShoppingCart size={18} /> Already in Cart — View Cart</>
            ) : reserved ? (
              <><motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}><Check size={18} /></motion.span> Added ✓</>
            ) : (
              <><ShoppingCart size={18} /> Add to Cart — RM{item.discountPrice.toFixed(2)}</>
            )}
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
};

export default ItemDetail;
