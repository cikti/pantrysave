import { useState } from "react";
import { Trash2, ShoppingCart, ArrowLeft, MapPin, Truck, ExternalLink, Check } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import FPXPaymentModal from "@/components/FPXPaymentModal";

const CartPage = () => {
  const { items, count, total, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryChoice, setDeliveryChoice] = useState<"pickup" | "grab" | "lalamove" | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [showFPX, setShowFPX] = useState(false);

  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
          <ShoppingCart size={48} className="text-muted-foreground" />
          <p className="text-muted-foreground">Please log in to view your cart</p>
          <button onClick={() => navigate("/login")} className="text-primary font-semibold">Log in</button>
        </div>
      </PageTransition>
    );
  }

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleConfirmOrder = () => {
    if (!deliveryChoice) { toast.error("Please select a delivery option"); return; }
    setShowCheckout(false);
    setShowFPX(true);
  };

  const handlePaymentSuccess = async (_paymentUrl: string) => {
    setShowFPX(false);
    await clearCart();
    setOrderComplete(true);
    toast.success("Payment successful! 🌿 Nice save for the planet!");
    setTimeout(() => { setOrderComplete(false); navigate("/"); }, 2000);
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const handleDecrease = (item: CartItem) => {
    if (item.quantity <= 1) {
      setConfirmRemove(item.listing_id);
    } else {
      updateQuantity(item.listing_id, item.quantity - 1);
    }
  };

  const handleIncrease = (item: CartItem) => {
    if (item.maxQuantity && item.quantity >= item.maxQuantity) {
      toast.error(`Maximum available is ${item.maxQuantity}`);
      return;
    }
    updateQuantity(item.listing_id, item.quantity + 1);
  };

  const confirmRemoveItem = () => {
    if (confirmRemove) {
      removeFromCart(confirmRemove);
      toast.success("Item removed from cart");
      setConfirmRemove(null);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-32">
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-foreground">My Cart</h1>
          {count > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">{count} item{count !== 1 ? "s" : ""}</span>
          )}
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 gap-4 text-center px-6">
            <ShoppingCart size={48} className="text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <button onClick={() => navigate("/")} className="text-primary font-semibold text-sm">Browse items</button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-3 bg-card rounded-xl p-3 border border-border"
              >
                {item.listing?.image_url ? (
                  <img src={item.listing.image_url} alt={item.listing?.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{item.listing?.name || "Item"}</p>
                  {item.listing?.weight && (
                    <p className="text-xs text-muted-foreground">{item.listing.weight}</p>
                  )}
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-primary font-bold text-sm">RM{(item.listing?.discount_price || 0).toFixed(2)}</span>
                    {item.listing?.original_price && (
                      <span className="text-xs text-muted-foreground line-through">RM{item.listing.original_price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      Qty: {item.quantity}{item.listing?.weight ? ` · ${item.listing.weight}` : ""}
                    </span>
                    <button onClick={() => setConfirmRemove(item.listing_id)} className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {items.length > 0 && !showCheckout && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border p-4 z-30">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">RM{total.toFixed(2)}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleCheckout}
              className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl shadow-lg"
            >
              Buy ({count} item{count !== 1 ? "s" : ""})
            </motion.button>
          </div>
        )}

        {/* Checkout: Choose delivery */}
        <AnimatePresence>
          {showCheckout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
              onClick={() => setShowCheckout(false)}
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md shadow-xl border border-border"
              >
                <h3 className="text-base font-bold text-foreground text-center mb-1">How do you want to get your items?</h3>
                <p className="text-xs text-muted-foreground text-center mb-5">Choose your preferred collection method</p>

                <div className="space-y-3">
                  {([
                    { key: "pickup" as const, icon: MapPin, label: "Self Pickup", desc: "Collect from the seller's location" },
                    { key: "grab" as const, icon: Truck, label: "Grab Delivery", desc: "Have it delivered via Grab" },
                    { key: "lalamove" as const, icon: Truck, label: "Lalamove Delivery", desc: "Have it delivered via Lalamove" },
                  ]).map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setDeliveryChoice(opt.key)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        deliveryChoice === opt.key
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        deliveryChoice === opt.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <opt.icon size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </div>
                      {deliveryChoice === opt.key && <Check size={18} className="text-primary shrink-0" />}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-5 mb-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">RM{total.toFixed(2)}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 py-3 rounded-xl bg-muted text-sm font-medium text-foreground active:scale-95 transition-transform"
                  >
                    Back
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmOrder}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                      deliveryChoice
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Confirm Order
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order complete overlay */}
        <AnimatePresence>
          {orderComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/95 flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-20 h-20 rounded-full bg-primary flex items-center justify-center"
              >
                <Check size={36} className="text-primary-foreground" />
              </motion.div>
              <p className="text-lg font-bold text-foreground">Order Placed! 🌿</p>
              <p className="text-sm text-muted-foreground">Redirecting you home...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remove confirmation dialog */}
        <AnimatePresence>
          {confirmRemove && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
              onClick={() => setConfirmRemove(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-2xl p-6 max-w-xs w-full shadow-xl border border-border"
              >
                <p className="text-sm font-semibold text-foreground text-center">Remove this item?</p>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Are you sure you want to remove this from your cart?
                </p>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setConfirmRemove(null)}
                    className="flex-1 py-2.5 rounded-xl bg-muted text-sm font-medium text-foreground active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRemoveItem}
                    className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium active:scale-95 transition-transform"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default CartPage;
