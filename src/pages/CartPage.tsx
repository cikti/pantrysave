import { useState, useMemo, useEffect } from "react";
import { Trash2, ShoppingCart, ArrowLeft, MapPin, Truck, Check, Info, Square, CheckSquare, Tag, X, AlertTriangle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart, CartItem } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseListing } from "@/hooks/useListings";
import { supabase } from "@/integrations/supabase/client";
import { usePoints } from "@/hooks/usePoints";
import { useOrders } from "@/contexts/OrderContext";
import { useUserVouchers, useMarkVoucherUsed, calculateDiscount } from "@/hooks/useVouchers";
import { useImpact } from "@/hooks/useImpact";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import FPXPaymentModal from "@/components/FPXPaymentModal";
import { useGeolocation } from "@/hooks/useGeolocation";

const DELIVERY_FEES: Record<string, { fee: number; label: string }> = {
  grab: { fee: 8, label: "GrabExpress" },
  lalamove: { fee: 6, label: "Lalamove" },
  pickup: { fee: 0, label: "Self Pickup" },
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CartPage = () => {
  const { items, count, total, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const purchaseListing = usePurchaseListing();
  const { earnPoints } = usePoints();
  const { addOrder } = useOrders();
  const { recordPurchase } = useImpact();
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryChoice, setDeliveryChoice] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [showFPX, setShowFPX] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPointsFloat, setShowPointsFloat] = useState<number | null>(null);
  const { position: buyerPos } = useGeolocation();

  // Voucher state
  const { data: userVouchers } = useUserVouchers();
  const markVoucherUsed = useMarkVoucherUsed();
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [showVouchers, setShowVouchers] = useState(false);

  const toggleSelect = (id: string) => {
    const item = items.find((i) => i.listing_id === id);
    if (item?.isSold) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const availableItems = items.filter((i) => !i.isSold);
  const allSelected = availableItems.length > 0 && availableItems.every((i) => selectedIds.has(i.listing_id));
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(availableItems.map((i) => i.listing_id)));
  };

  const selectedItems = useMemo(() => items.filter((i) => selectedIds.has(i.listing_id) && !i.isSold), [items, selectedIds]);
  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + (item.listing?.discount_price || 0) * item.quantity, 0),
    [selectedItems]
  );
  const selectedCount = selectedItems.length;

  const selectedVoucher = useMemo(() => {
    if (!selectedVoucherId) return null;
    const uv = userVouchers?.find((v) => v.id === selectedVoucherId);
    if (uv?.voucher) return { userVoucherId: uv.id, voucher: uv.voucher };
    return null;
  }, [selectedVoucherId, userVouchers]);

  const voucherDiscount = useMemo(() => {
    if (!selectedVoucher) return 0;
    return calculateDiscount(selectedVoucher.voucher, selectedTotal);
  }, [selectedVoucher, selectedTotal]);

  // Available delivery options based on sellers
  const availableDeliveryOptions = useMemo(() => {
    const allOptions = new Map<string, { key: string; label: string; fee: number; estimatedTime: string }>();
    for (const item of selectedItems) {
      const listing = item.listing as any;
      const opts = listing?.delivery_options;
      if (Array.isArray(opts) && opts.length > 0) {
        for (const opt of opts) {
          if (!allOptions.has(opt.key)) allOptions.set(opt.key, opt);
        }
      } else {
        const dt = listing?.delivery_type;
        if (dt === "pickup" || !dt) {
          allOptions.set("pickup", { key: "pickup", label: "Self Pickup", fee: 0, estimatedTime: "Ready in 1 hour" });
        }
        if (dt === "third_party") {
          const svc = listing?.delivery_service || "grab";
          allOptions.set(svc, {
            key: svc,
            label: DELIVERY_FEES[svc]?.label || svc,
            fee: listing?.delivery_fee || DELIVERY_FEES[svc]?.fee || 6,
            estimatedTime: svc === "grab" ? "1-2 hours" : "1-3 hours",
          });
        }
      }
    }
    if (allOptions.size === 0) {
      return [
        { key: "pickup", label: "Self Pickup", fee: 0, estimatedTime: "Ready in 1 hour" },
        { key: "grab", label: "GrabExpress", fee: 8, estimatedTime: "1-2 hours" },
        { key: "lalamove", label: "Lalamove", fee: 6, estimatedTime: "1-3 hours" },
      ];
    }
    return [...allOptions.values()];
  }, [selectedItems]);

  // Pickup info: seller name, address, distance
  const pickupInfo = useMemo(() => {
    if (deliveryChoice !== "pickup") return null;
    const sellers: { name: string; address: string; distance: number | null }[] = [];
    const seen = new Set<string>();
    for (const item of selectedItems) {
      const listing = item.listing as any;
      const key = listing?.seller_name || listing?.name || "Seller";
      if (seen.has(key)) continue;
      seen.add(key);
      const lat = listing?.latitude;
      const lng = listing?.longitude;
      const dist = buyerPos && lat && lng ? haversineKm(buyerPos[0], buyerPos[1], lat, lng) : null;
      sellers.push({ name: key, address: listing?.address || "", distance: dist });
    }
    return sellers.length > 0 ? sellers : null;
  }, [buyerPos, deliveryChoice, selectedItems]);

  const chosenOption = availableDeliveryOptions.find((o) => o.key === deliveryChoice);
  const deliveryFee = chosenOption?.fee ?? 0;
  const grandTotal = Math.max(0, selectedTotal - voucherDiscount + deliveryFee);

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
    const soldInSelection = selectedItems.filter((i) => i.isSold);
    if (soldInSelection.length > 0) {
      toast.error("Please remove sold-out items before checking out");
      return;
    }
    setDeliveryChoice(null);
    setShowCheckout(true);
  };

  const handleConfirmOrder = () => {
    if (!deliveryChoice) { toast.error("Please select a delivery option"); return; }
    setShowCheckout(false);
    setShowFPX(true);
  };

  const handlePaymentSuccess = async (_paymentUrl: string) => {
    setShowFPX(false);

    const soldOutItems: string[] = [];
    for (const item of selectedItems) {
      if (!item.isMock) {
        const { data } = await supabase
          .from("listings")
          .select("stock_quantity, status")
          .eq("id", item.listing_id)
          .maybeSingle();
        if (!data || data.status === "sold" || data.stock_quantity < item.quantity) {
          soldOutItems.push(item.listing?.name || "Item");
        }
      }
    }
    if (soldOutItems.length > 0) {
      toast.error(`Sold out: ${soldOutItems.join(", ")}. Please remove and try again.`);
      return;
    }

    for (const item of selectedItems) {
      if (!item.isMock) {
        try {
          await purchaseListing.mutateAsync({ id: item.listing_id, quantity: item.quantity });
        } catch {
          toast.error(`Failed to purchase ${item.listing?.name || "item"} — it may have been sold out.`);
          return;
        }
      }
    }

    if (selectedVoucher?.userVoucherId) {
      try { await markVoucherUsed.mutateAsync(selectedVoucher.userVoucherId); } catch {}
    }

    const deliveryLabel = chosenOption?.label || "Self Pickup";
    const sellerNames = [...new Set(selectedItems.map((i) => (i.listing as any)?.seller_name || i.listing?.name || "Seller"))];
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

    const moneySaved = selectedItems.reduce((sum, i) => {
      const orig = i.listing?.original_price || 0;
      const disc = i.listing?.discount_price || 0;
      return sum + Math.max(0, orig - disc);
    }, 0);
    const foodSavedKg = selectedItems.reduce((sum, i) => {
      const w = i.listing?.weight || "";
      const kgMatch = w.match(/([\d.]+)\s*kg/i);
      if (kgMatch) return sum + parseFloat(kgMatch[1]);
      const gMatch = w.match(/([\d.]+)\s*g(?!r)/i);
      if (gMatch) return sum + parseFloat(gMatch[1]) / 1000;
      return sum;
    }, 0);
    try { await recordPurchase.mutateAsync({ moneySaved, foodSavedKg }); } catch {}

    const pointsEarned = Math.max(1, Math.round(selectedTotal));
    try {
      await earnPoints.mutateAsync({ amount: pointsEarned, description: `Purchase of ${selectedCount} item${selectedCount > 1 ? "s" : ""}` });
      setShowPointsFloat(pointsEarned);
    } catch {}

    for (const item of selectedItems) {
      await removeFromCart(item.listing_id);
    }
    setSelectedIds(new Set());
    setSelectedVoucherId(null);
    setOrderComplete(true);
    toast.success("Payment successful! 🌿 Nice save for the planet!");
    setTimeout(() => { setOrderComplete(false); setShowPointsFloat(null); navigate("/orders"); }, 2500);
  };

  const handlePaymentError = (error: string) => { toast.error(error); };

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
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 px-1 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {allSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
              <span className="text-xs font-medium">Select All</span>
            </button>

            {items.map((item, idx) => {
              const isSelected = selectedIds.has(item.listing_id);
              const isSold = !!item.isSold;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex gap-3 rounded-xl p-3 border-2 transition-colors ${
                    isSold ? "border-destructive/30 bg-muted/60 opacity-60"
                      : isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <button onClick={() => toggleSelect(item.listing_id)} className="self-center shrink-0" disabled={isSold}>
                    {isSold ? <Square size={20} className="text-muted-foreground/40" />
                      : isSelected ? <CheckSquare size={20} className="text-primary" />
                      : <Square size={20} className="text-muted-foreground" />}
                  </button>

                  {item.listing?.image_url ? (
                    <img src={item.listing.image_url} alt={item.listing?.name} className={`w-20 h-20 rounded-lg object-cover shrink-0 ${isSold ? "grayscale" : ""}`} />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm truncate ${isSold ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.listing?.name || "Item"}
                      </p>
                      {isSold && (
                        <span className="shrink-0 text-[10px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">SOLD</span>
                      )}
                    </div>
                    {isSold && <p className="text-[11px] text-destructive mt-0.5">This item has been purchased by another user</p>}
                    {item.listing?.weight && (
                      <p className={`text-xs ${isSold ? "text-muted-foreground/60" : "text-muted-foreground"}`}>{item.listing.weight}</p>
                    )}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={`font-bold text-sm ${isSold ? "text-muted-foreground line-through" : "text-primary"}`}>
                        RM{(item.listing?.discount_price || 0).toFixed(2)}
                      </span>
                      {item.listing?.original_price && !isSold && (
                        <span className="text-xs text-muted-foreground line-through">RM{item.listing.original_price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${isSold ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                        Qty: {item.listing?.weight || item.quantity}
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

        {/* Apply Voucher Button */}
        {selectedCount > 0 && (
          <div className="px-4 pb-3">
            <button
              onClick={() => setShowVouchers(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {selectedVoucher ? selectedVoucher.voucher.name : "Apply Voucher"}
                </span>
                {selectedVoucher && voucherDiscount > 0 && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">-RM{voucherDiscount.toFixed(2)}</span>
                )}
              </div>
              <Tag size={14} className="text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Voucher Selection Modal */}
        <Dialog open={showVouchers} onOpenChange={setShowVouchers}>
          <DialogContent className="max-w-md mx-auto max-h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag size={18} className="text-primary" />
                My Vouchers
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-2">
              <button
                onClick={() => { setSelectedVoucherId(null); setShowVouchers(false); }}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors text-sm ${!selectedVoucherId ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                <span className="font-medium text-foreground">No voucher</span>
              </button>
              {userVouchers?.map((uv) => {
                if (!uv.voucher) return null;
                const discount = calculateDiscount(uv.voucher, selectedTotal);
                const meetsMin = selectedTotal >= uv.voucher.min_spend;
                return (
                  <button
                    key={uv.id}
                    onClick={() => {
                      if (!meetsMin) { toast.error(`Min spend RM${uv.voucher!.min_spend.toFixed(2)} required`); return; }
                      setSelectedVoucherId(uv.id);
                      setShowVouchers(false);
                      toast.success(`Voucher "${uv.voucher!.name}" applied!`);
                    }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selectedVoucherId === uv.id ? "border-primary bg-primary/5" : "border-border bg-card"} ${!meetsMin ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{uv.voucher.name}</span>
                      {meetsMin && discount > 0 && <span className="text-xs font-semibold text-primary">-RM{discount.toFixed(2)}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        {uv.voucher.min_spend > 0 && (
                          <p className="text-[11px] text-muted-foreground">Min spend RM{uv.voucher.min_spend.toFixed(2)}{!meetsMin && " (not met)"}</p>
                        )}
                        {uv.voucher.expires_at && (
                          <p className="text-[11px] text-muted-foreground">Expires: {new Date(uv.voucher.expires_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      {meetsMin && <span className="text-xs font-semibold text-primary-foreground bg-primary px-3 py-1 rounded-full">Apply</span>}
                    </div>
                  </button>
                );
              })}
              {(!userVouchers?.length) && (
                <p className="text-xs text-muted-foreground text-center py-3">No vouchers available. Claim vouchers from the Points page!</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Bottom bar */}
        {items.length > 0 && !showCheckout && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border p-4 z-30 px-[16px] py-[8px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Subtotal ({selectedCount} selected)</span>
              <span className="text-sm font-medium text-foreground">RM{selectedTotal.toFixed(2)}</span>
            </div>
            {voucherDiscount > 0 && (
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-primary">Voucher discount</span>
                <span className="text-sm font-semibold text-primary">-RM{voucherDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-primary">RM{(selectedTotal - voucherDiscount).toFixed(2)}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleCheckout}
              disabled={selectedCount === 0}
              className={`w-full font-semibold py-4 rounded-2xl shadow-lg transition-colors ${
                selectedCount > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"
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
                className="bg-card rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md shadow-xl border border-border max-h-[85vh] overflow-y-auto"
              >
                <h3 className="text-base font-bold text-foreground text-center mb-1">How do you want to get your items?</h3>
                <p className="text-xs text-muted-foreground text-center mb-5">Only showing delivery options available from the seller(s)</p>

                <div className="space-y-3">
                  {availableDeliveryOptions.map((opt) => {
                    const Icon = opt.key === "pickup" ? MapPin : Truck;
                    return (
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
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {opt.estimatedTime}
                          </p>
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
                    );
                  })}
                </div>

                {/* Distance alert for pickup */}
                {deliveryChoice === "pickup" && distanceInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3"
                  >
                    {distanceInfo.distance > 5 ? (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <p className="font-semibold text-amber-800">
                            ⚠️ This seller is {distanceInfo.distance.toFixed(1)}km away from you
                          </p>
                          <p className="text-amber-700 mt-0.5">
                            Pickup may take ~{Math.ceil(distanceInfo.distance * 3)} minutes by car. Consider using delivery instead if available.
                          </p>
                          {availableDeliveryOptions.some((o) => o.key !== "pickup") && (
                            <button
                              onClick={() => setDeliveryChoice(null)}
                              className="mt-1.5 text-amber-800 font-semibold underline"
                            >
                              View delivery options →
                            </button>
                          )}
                        </div>
                      </div>
                    ) : distanceInfo.distance <= 3 ? (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                        <Check size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                        <p className="text-emerald-700">
                          ✅ Great news! This seller is only {distanceInfo.distance.toFixed(1)}km away — just around the corner! Pickup will be quick and easy. 😊
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                        <MapPin size={14} className="shrink-0 mt-0.5 text-primary" />
                        <span>📍 Seller is {distanceInfo.distance.toFixed(1)}km away. Pickup is available.</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {deliveryChoice && deliveryChoice !== "pickup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground"
                  >
                    <Info size={14} className="shrink-0 mt-0.5 text-primary" />
                    <span>This delivery fee goes to {chosenOption?.label || "the delivery service"}, not the seller.</span>
                  </motion.div>
                )}

                <div className="mt-5 mb-3 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Subtotal ({selectedCount} items)</span>
                    <span className="text-sm font-medium text-foreground">RM{selectedTotal.toFixed(2)}</span>
                  </div>
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-primary">Voucher</span>
                      <span className="text-sm font-semibold text-primary">-RM{voucherDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Delivery ({chosenOption?.label})</span>
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
                      deliveryChoice ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground"
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
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-sm font-bold text-primary">
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
                <p className="text-xs text-muted-foreground text-center mt-2">Are you sure you want to remove this from your cart?</p>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setConfirmRemove(null)} className="flex-1 py-2.5 rounded-xl bg-muted text-sm font-medium text-foreground active:scale-95 transition-transform">Cancel</button>
                  <button onClick={confirmRemoveItem} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium active:scale-95 transition-transform">Remove</button>
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
          onClose={() => setShowFPX(false)}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>
    </PageTransition>
  );
};

export default CartPage;
