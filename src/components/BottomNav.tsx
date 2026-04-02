import { ShoppingBag, MapPin, PlusCircle, ShoppingCart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";

const tabs = [
  { icon: ShoppingBag, label: "Shop", path: "/" },
  { icon: MapPin, label: "Map", path: "/map" },
  { icon: PlusCircle, label: "Sell", path: "/sell" },
  { icon: ShoppingCart, label: "Cart", path: "/cart" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { count: cartCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-warm-white/95 border-t border-border backdrop-blur-lg">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              whileTap={{ scale: 0.85 }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors relative ${
                active
                  ? "text-primary"
                  : "text-charcoal-light"
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[11px] font-bold rounded-full flex items-center justify-center px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 w-6 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
