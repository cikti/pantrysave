import { useState, useEffect } from "react";
import { Leaf, Wallet, ShoppingBag, TrendingUp, LogOut, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import PageTransition from "@/components/PageTransition";

const badges = [
  { label: "Food Saver", emoji: "🌿", unlocked: true },
  { label: "Eco Hero", emoji: "🌍", unlocked: true },
  { label: "Pantry Pro", emoji: "⭐", unlocked: false },
];

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const moneySaved = useCountUp(124.5, 1200, 2);
  const foodSaved = useCountUp(18.2, 1000, 1);
  const orders = useCountUp(12, 800, 0);
  const items = useCountUp(5, 600, 0);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const stats = [
    {
      icon: Wallet,
      label: "Money Saved",
      value: `RM ${moneySaved.toFixed(2)}`,
      color: "bg-accent text-accent-foreground",
    },
    {
      icon: Leaf,
      label: "Food Saved",
      value: `${foodSaved.toFixed(1)} kg`,
      color: "bg-primary/10 text-primary",
    },
    {
      icon: ShoppingBag,
      label: "Orders Made",
      value: `${orders}`,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      icon: TrendingUp,
      label: "Items Listed",
      value: `${items}`,
      color: "bg-accent text-accent-foreground",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <header className="px-5 pt-8 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Community Impact
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Your contribution to reducing food waste
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-card flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <LogOut size={16} className="text-muted-foreground" />
          </button>
        </header>

        {/* Avatar area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center py-6"
        >
          <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
            <Leaf size={32} className="text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground mt-3">
            {user?.user_metadata?.name || "Pantry Hero"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {user?.email}
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="px-5 grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
              className={`${s.color} rounded-2xl p-4 flex flex-col gap-2`}
            >
              <s.icon size={20} />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-[11px] font-medium opacity-70">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Impact progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-5 mt-5"
        >
          <div className="bg-card rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-foreground mb-2">Impact Goal</p>
            <p className="text-xs text-muted-foreground mb-3">
              Save 25kg of food from landfill
            </p>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "73%" }}
                transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">18.2 / 25 kg</p>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="px-5 mt-4"
        >
          <p className="text-xs font-semibold text-foreground mb-3">Badges</p>
          <div className="flex gap-3">
            {badges.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: b.unlocked ? 1 : 0.4, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1, type: "spring", stiffness: 300 }}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                    b.unlocked ? "bg-accent" : "bg-muted"
                  }`}
                >
                  {b.emoji}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {b.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Wallet preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="px-5 mt-4"
        >
          <div className="bg-primary/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-primary" />
              <p className="text-xs font-semibold text-primary">Reward Points</p>
            </div>
            <p className="text-2xl font-bold text-primary">350 pts</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Earn points with every rescue purchase
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
