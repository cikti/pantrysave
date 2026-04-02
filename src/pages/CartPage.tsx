import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const CartPage = () => {
  const { items, count, total, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const handleCheckout = async () => {
    await clearCart();
    toast.success("Items reserved! 🌿 Nice save for the planet!");
    navigate("/");
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
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.listing_id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.listing_id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center active:scale-90 transition-transform">
                      <Plus size={14} />
                    </button>
                    <button onClick={() => removeFromCart(item.listing_id)} className="ml-auto p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {items.length > 0 && (
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
              Reserve All ({count} item{count !== 1 ? "s" : ""})
            </motion.button>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default CartPage;
