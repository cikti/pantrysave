import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Info, Check } from "lucide-react";
import { groceryItems } from "@/data/mockData";
import { toast } from "sonner";
import { motion, useScroll, useTransform } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const badgeColors: Record<string, string> = {
  expiry: "bg-[hsl(var(--badge-expiry))] text-primary-foreground",
  imperfect: "bg-primary text-primary-foreground",
  overstock: "bg-[hsl(var(--badge-overstock))] text-primary-foreground",
};

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = groceryItems.find((i) => i.id === id);
  const [reserved, setReserved] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const imageScale = useTransform(scrollY, [0, 200], [1, 1.15]);
  const imageOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Item not found.
      </div>
    );
  }

  const saving = (item.originalPrice - item.clearancePrice).toFixed(2);
  const discount = Math.round(
    ((item.originalPrice - item.clearancePrice) / item.originalPrice) * 100
  );

  const handleReserve = () => {
    if (reserved) return;
    setReserved(true);
    setShowFloat(true);
    toast.success(`Nice save! 🌿 ${item.name} reserved!`, {
      description: "Good choice for the planet",
    });
    setTimeout(() => setShowFloat(false), 1200);
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-28" ref={scrollRef}>
        {/* Image with parallax */}
        <div className="relative overflow-hidden">
          <motion.img
            src={item.image}
            alt={item.name}
            width={640}
            height={640}
            className="w-full aspect-square object-cover"
            style={{ scale: imageScale, opacity: imageOpacity }}
          />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-warm-white/80 backdrop-blur flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <ArrowLeft size={18} />
          </button>
          <span
            className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full ${badgeColors[item.badgeType]} ${
              item.badgeType === "expiry" ? "animate-pulse-badge" : ""
            }`}
          >
            {item.badge}
          </span>
        </div>

        {/* Details with slide-in animations */}
        <div className="px-5 pt-5">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs text-muted-foreground"
          >
            {item.seller}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl font-bold text-foreground mt-1"
          >
            {item.name}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground mt-1"
          >
            {item.weight}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-baseline gap-3 mt-3"
          >
            <span className="text-muted-foreground line-through text-sm">
              RM{item.originalPrice.toFixed(2)}
            </span>
            <span className="text-2xl font-bold text-primary">
              RM{item.clearancePrice.toFixed(2)}
            </span>
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
              {discount}% off
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary bg-accent px-3 py-1 rounded-full"
          >
            🎉 You save RM{saving}
          </motion.div>

          {/* Reason */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-accent/60 rounded-xl p-4 flex gap-3"
          >
            <Info size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-accent-foreground">
                Why it's discounted
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
            </div>
          </motion.div>
        </div>

        {/* Floating points indicator */}
        {showFloat && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <span className="animate-float-up text-lg font-bold text-primary">
              +50 points 🌿
            </span>
          </div>
        )}

        {/* Sticky CTA with morph animation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border z-30">
          <motion.button
            onClick={handleReserve}
            whileTap={!reserved ? { scale: 0.96 } : {}}
            className={`w-full font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-colors duration-300 ${
              reserved
                ? "bg-accent text-primary"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {reserved ? (
              <>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Check size={18} />
                </motion.span>
                Reserved ✓
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                Add to Cart & Reserve
              </>
            )}
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
};

export default ItemDetail;
