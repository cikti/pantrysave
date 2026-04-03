import { useState, useMemo } from "react";
import { Trash2, ShoppingCart, ArrowLeft, MapPin, Truck, Check, Info, Square, CheckSquare } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseListing } from "@/hooks/useListings";
import { usePoints } from "@/hooks/usePoints";
import { useOrders } from "@/contexts/OrderContext";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import FPXPaymentModal from "@/components/FPXPaymentModal";

const DELIVERY_FEES: Record<string, { fee: number; label: string }> = {
  grab: { fee: 8, label: "GrabExpress" },
  lalamove: { fee: 6, label: "Lalamove" },
  pickup: { fee: 0, label: "Self Pickup" },
};

const CartPage = () => {
  const { items, count, total, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const purchaseListing = usePurchaseListing();
  const { earnPoints } = usePoints();
  const { addOrder } = useOrders();
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryChoice, setDeliveryChoice] = useState<"pickup" | "grab" | "lalamove" | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [showFPX, setShowFPX] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPointsFloat, setShowPointsFloat] = useState<number | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.listing_id));
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.listing_id)));
    }
  };

  const selectedItems = useMemo(() => items.filter((i) => selectedIds.has(i.listing_id)), [items, selectedIds]);
  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (item.listing?.discount_price || 0) * item.quantity, 0),
    [selectedItems]
  );
  const selectedCount = selectedItems.length;

  const deliveryFee = deliveryChoice ? DELIVERY_FEES[deliveryChoice].fee : 0;
  const grandTotal = selectedTotal + deliveryFee;

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
    if (selectedCount === 0) { toast.error("Please select items to checkout"); return; }
    setShowCheckout(true);
  };

  const handleConfirmOrder = () => {
    if (!deliveryChoice) { toast.error("Please select a delivery option"); return; }
    setShowCheckout(false);
    setShowFPX(true);
  };


  const handlePaymentSuccess = async (_paymentUrl: string) => {
    setShowFPX(false);
    // Decrement stock and mark sold if stock reaches 0
    for (const item of selectedItems) {
      if (!item.isMock) {
        await purchaseListing.mutateAsync({ id: item.listing_id, quantity: item.quantity });
      }
    }
    // Create order
    const deliveryLabel = deliveryChoice ? DELIVERY_FEES[deliveryChoice].label : "Self Pickup";
    const sellerNames = [...new Set(selectedItems.map((i) => i.listing?.name || "Seller"))];
    addOrder({
      items: selectedItems.map((i) => ({
        name: i.listing?.name || "Item",
        quantity: i.quantity,
        price: i.listing?.discount_price || 0,
        image: i.listing?.image_url || undefined,
        weight: i.listing?.weight || undefined,
      })),
      totalAmount: grandTotal,
      deliveryFee,
      deliveryMethod: deliveryLabel,
      paymentMethod: "FPX",
      sellerNames,
    });
    // Earn points: 1 point per RM1 spent (rounded)
    const pointsEarned = Math.max(1, Math.round(selectedTotal));
    try {
      await earnPoints.mutateAsync({ amount: pointsEarned, description: `Purchase of ${selectedCount} item${selectedCount > 1 ? "s" : ""}` });
      setShowPointsFloat(pointsEarned);
    } catch {}
    // Remove only selected items from cart
    for (const item of selectedItems) {
      await removeFromCart(item.listing_id);
    }
    setSelectedIds(new Set());
    setOrderComplete(true);
    toast.success("Payment successful! 🌿 Nice save for the planet!");
    setTimeout(() => { setOrderComplete(false); setShowPointsFloat(null); navigate("/orders"); }, 2500);
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const confirmRemoveItem = () => {
    if (confirmRemove) {
      removeFromCart(confirmRemove);
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(confirmRemove); return next; });
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
            {/* Select All */}
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 px-1 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {allSelected ? (
                <CheckSquare size={18} className="text-primary" />
              ) : (
                <Square size={18} />
              )}
              <span className="text-xs font-medium">Select All</span>
            </button>

            {items.map((item, idx) => {
              const isSelected = selectedIds.has(item.listing_id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex gap-3 rounded-xl p-3 border-2 transition-colors ${
                    isSelected
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelect(item.listing_id)}
                    className="self-center shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare size={20} className="text-primary" />
                    ) : (
                      <Square size={20} className="text-muted-foreground" />
                    )}
                  </button>

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
              );
            })}
          </div>
        )}

        {items.length > 0 && !showCheckout && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border p-4 z-30">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">
                Total ({selectedCount} selected)
              </span>
              <span className="text-xl font-bold text-primary">RM{selectedTotal.toFixed(2)}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleCheckout}
              disabled={selectedCount === 0}
              className={`w-full font-semibold py-4 rounded-2xl shadow-lg transition-colors ${
                selectedCount > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {selectedCount > 0 ? `Checkout (${selectedCount})` : "Select items to checkout"}
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
                    { key: "pickup" as const, icon: MapPin, label: "Self Pickup", desc: "Collect from the seller's location", fee: 0 },
                    { key: "grab" as const, icon: Truck, label: "GrabExpress", desc: "Delivered via Grab", fee: DELIVERY_FEES.grab.fee },
                    { key: "lalamove" as const, icon: Truck, label: "Lalamove", desc: "Delivered via Lalamove", fee: DELIVERY_FEES.lalamove.fee },
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
                      <div className="text-right shrink-0">
                        {opt.fee > 0 ? (
                          <span className="text-xs font-semibold text-primary">+RM{opt.fee.toFixed(2)}</span>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">Free</span>
                        )}
                      </div>
                      {deliveryChoice === opt.key && <Check size={18} className="text-primary shrink-0" />}
                    </button>
                  ))}
                </div>

                {deliveryChoice && deliveryChoice !== "pickup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground"
                  >
                    <Info size={14} className="shrink-0 mt-0.5 text-primary" />
                    <span>This delivery fee goes to {DELIVERY_FEES[deliveryChoice].label}, not the seller.</span>
                  </motion.div>
                )}

                <div className="mt-5 mb-3 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Subtotal ({selectedCount} items)</span>
                    <span className="text-sm font-medium text-foreground">RM{selectedTotal.toFixed(2)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Delivery fee ({DELIVERY_FEES[deliveryChoice!].label})</span>
                      <span className="text-sm font-medium text-foreground">RM{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-1.5 flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-primary">RM{grandTotal.toFixed(2)}</span>
                  </div>
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
              {showPointsFloat && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm font-bold text-primary"
                >
                  +{showPointsFloat} points earned! 🎉
                </motion.p>
              )}
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

        {/* FPX Payment Modal */}
        <FPXPaymentModal
          open={showFPX}
          amount={grandTotal}
          orderId={`PS-${Date.now().toString(36).toUpperCase()}`}
          onClose={() => {
            setShowFPX(false);
          }}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </PageTransition>
  );
};

export default CartPage;
