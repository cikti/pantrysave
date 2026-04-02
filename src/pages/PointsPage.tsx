import { useState } from "react";
import { Award, Coins, Leaf, Truck, Tag, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { usePoints, PointTransaction } from "@/hooks/usePoints";
import { useCountUp } from "@/hooks/useCountUp";
import PageTransition from "@/components/PageTransition";

const rewards = [
  { id: "rm5", label: "RM5 Off Voucher", description: "Get RM5 off your next purchase", cost: 100, icon: Tag, emoji: "🎫" },
  { id: "rm10", label: "RM10 Off Voucher", description: "Get RM10 off your next purchase", cost: 200, icon: Tag, emoji: "🎟️" },
  { id: "free-delivery", label: "Free Delivery", description: "Free delivery on your next order", cost: 150, icon: Truck, emoji: "🚚" },
  { id: "eco-badge", label: "Eco Champion Badge", description: "Exclusive profile badge", cost: 300, icon: Leaf, emoji: "🌿" },
];

const tiers = [
  { name: "Saver", min: 0, max: 200, color: "bg-muted" },
  { name: "Hero", min: 200, max: 500, color: "bg-primary/20" },
  { name: "Champion", min: 500, max: 1000, color: "bg-primary/40" },
  { name: "Legend", min: 1000, max: Infinity, color: "bg-primary" },
];

const PointsPage = () => {
  const { balance, transactions, redeemPoints } = usePoints();
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rewards" | "history">("rewards");

  const animatedBalance = useCountUp(balance, 800, 0);

  const currentTier = tiers.find((t) => balance >= t.min && balance < t.max) || tiers[tiers.length - 1];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier
    ? ((balance - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const handleRedeem = async (reward: typeof rewards[0]) => {
    if (balance < reward.cost) {
      toast.error("Not enough points!");
      return;
    }
    setRedeeming(reward.id);
    try {
      await redeemPoints.mutateAsync({ amount: reward.cost, description: `Redeemed ${reward.label}` });
      toast.success(`🎉 Reward unlocked: ${reward.label}!`);
    } catch {
      // error handled in hook
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 md:pb-8">
        <header className="px-5 pt-8 pb-4">
          <h1 className="text-lg font-bold text-foreground">My Points</h1>
          <p className="text-xs text-muted-foreground mt-1">Earn, track & redeem rewards</p>
        </header>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 rounded-2xl bg-primary/10 p-6 relative overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-1">
            <Coins size={18} className="text-primary" />
            <span className="text-xs font-semibold text-primary">Points Balance</span>
          </div>
          <motion.p
            key={balance}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold text-primary"
          >
            {animatedBalance}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">
            Tier: <span className="font-semibold text-primary">{currentTier.name}</span>
          </p>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>{currentTier.name}</span>
                <span>{nextTier.name} ({nextTier.min} pts)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          )}

          {/* Decorative */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full" />
          <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-primary/5 rounded-full" />
        </motion.div>

        {/* Tabs */}
        <div className="px-5 flex gap-2 my-5">
          <button
            onClick={() => setActiveTab("rewards")}
            className={`flex-1 text-xs font-medium py-2.5 rounded-xl transition-all ${
              activeTab === "rewards" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            <Award size={12} className="inline mr-1" />
            Rewards
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 text-xs font-medium py-2.5 rounded-xl transition-all ${
              activeTab === "history" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            <Clock size={12} className="inline mr-1" />
            History
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "rewards" ? (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="px-5 space-y-3"
            >
              {rewards.map((reward, i) => {
                const canAfford = balance >= reward.cost;
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`bg-card rounded-2xl p-4 shadow-sm flex items-center gap-4 ${
                      !canAfford ? "opacity-60" : ""
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl shrink-0">
                      {reward.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{reward.label}</p>
                      <p className="text-[11px] text-muted-foreground">{reward.description}</p>
                      <p className="text-xs font-bold text-primary mt-1">{reward.cost} pts</p>
                    </div>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford || redeeming === reward.id}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                        canAfford
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {redeeming === reward.id ? "..." : "Redeem"}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="px-5 space-y-2"
            >
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
              ) : (
                transactions.map((tx: PointTransaction, i: number) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl p-3 flex items-center gap-3 shadow-sm"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === "earn" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {tx.type === "earn" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        tx.type === "earn" ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {tx.type === "earn" ? "+" : "-"}{tx.amount}
                    </span>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default PointsPage;
