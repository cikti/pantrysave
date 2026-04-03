import { useState } from "react";
import { Coins, Tag, TrendingUp, TrendingDown, Clock, Ticket, CheckCircle, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { usePoints, PointTransaction } from "@/hooks/usePoints";
import { useClaimableVouchers, useUserVouchers, useClaimVoucher, useRedeemVoucherCode, Voucher } from "@/hooks/useVouchers";
import { useCountUp } from "@/hooks/useCountUp";
import PageTransition from "@/components/PageTransition";

const tiers = [
  { name: "Saver", min: 0, max: 200, color: "bg-muted" },
  { name: "Hero", min: 200, max: 500, color: "bg-primary/20" },
  { name: "Champion", min: 500, max: 1000, color: "bg-primary/40" },
  { name: "Legend", min: 1000, max: Infinity, color: "bg-primary" },
];

const PointsPage = () => {
  const { balance, transactions, redeemPoints } = usePoints();
  const { data: claimableVouchers = [], isLoading: vouchersLoading } = useClaimableVouchers();
  const { data: userVouchers = [] } = useUserVouchers();
  const claimVoucher = useClaimVoucher();
  const redeemCode = useRedeemVoucherCode();
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"vouchers" | "codes" | "history">("vouchers");
  const [promoCode, setPromoCode] = useState("");
  const [applyingCode, setApplyingCode] = useState(false);

  const animatedBalance = useCountUp(balance, 800, 0);

  const currentTier = tiers.find((t) => balance >= t.min && balance < t.max) || tiers[tiers.length - 1];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier
    ? ((balance - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const isAlreadyClaimed = (voucherId: string) =>
    userVouchers.some((uv) => uv.voucher_id === voucherId && !uv.is_used);

  const handleClaimVoucher = async (voucher: Voucher) => {
    const cost = voucher.points_cost;
    if (balance < cost) { toast.error("Not enough points!"); return; }
    if (isAlreadyClaimed(voucher.id)) { toast.error("You already have this voucher!"); return; }

    setRedeeming(voucher.id);
    try {
      await redeemPoints.mutateAsync({ amount: cost, description: `Claimed voucher: ${voucher.name}` });
      await claimVoucher.mutateAsync(voucher.id);
      toast.success("🎉 Voucher claimed! Check My Vouchers in Cart");
    } catch { /* handled */ } finally { setRedeeming(null); }
  };

  const handleApplyCode = async () => {
    if (!promoCode.trim()) { toast.error("Please enter a code"); return; }
    setApplyingCode(true);
    try {
      const voucher = await redeemCode.mutateAsync(promoCode);
      toast.success(`🎉 "${voucher.name}" added to My Vouchers!`);
      setPromoCode("");
    } catch (err: any) {
      toast.error(err.message || "Invalid code");
    } finally { setApplyingCode(false); }
  };

  const getVoucherDescription = (v: Voucher) => {
    const parts: string[] = [];
    if (v.discount_type === "percentage") parts.push(`${v.discount_value}% off`);
    else parts.push(`RM${v.discount_value} off`);
    if (v.min_spend > 0) parts.push(`Min spend: RM${v.min_spend}`);
    return parts.join(" · ");
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 md:pb-8">
        <header className="px-5 pt-8 pb-4">
          <h1 className="text-lg font-bold text-foreground">My Points</h1>
          <p className="text-xs text-muted-foreground mt-1">Earn, track & redeem vouchers</p>
        </header>

        {/* Balance Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-5 rounded-2xl bg-primary/10 p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Coins size={18} className="text-primary" />
            <span className="text-xs font-semibold text-primary">Points Balance</span>
          </div>
          <motion.p key={balance} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-4xl font-bold text-primary">{animatedBalance}</motion.p>
          <p className="text-xs text-muted-foreground mt-1">Tier: <span className="font-semibold text-primary">{currentTier.name}</span></p>
          {nextTier && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>{currentTier.name}</span>
                <span>{nextTier.name} ({nextTier.min} pts)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }} className="h-full bg-primary rounded-full" />
              </div>
            </div>
          )}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full" />
          <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-primary/5 rounded-full" />
        </motion.div>

        {/* Tabs */}
        <div className="px-5 flex gap-2 my-5">
          {([
            { key: "vouchers" as const, icon: Ticket, label: "Claim Vouchers" },
            { key: "codes" as const, icon: KeyRound, label: "Promo Code" },
            { key: "history" as const, icon: Clock, label: "History" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-xs font-medium py-2.5 rounded-xl transition-all ${
                activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
              }`}
            >
              <tab.icon size={12} className="inline mr-1" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "vouchers" && (
            <motion.div key="vouchers" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="px-5 space-y-3">
              {vouchersLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading vouchers...</p>
              ) : claimableVouchers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No vouchers available</p>
              ) : (
                claimableVouchers.map((voucher, i) => {
                  const cost = voucher.points_cost;
                  const canAfford = balance >= cost;
                  const alreadyClaimed = isAlreadyClaimed(voucher.id);
                  return (
                    <motion.div key={voucher.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className={`bg-card rounded-2xl p-4 shadow-sm flex items-center gap-4 ${!canAfford && !alreadyClaimed ? "opacity-60" : ""}`}>
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl shrink-0">
                        {voucher.discount_type === "percentage" ? "🏷️" : "🎫"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{voucher.name}</p>
                        <p className="text-[11px] text-muted-foreground">{getVoucherDescription(voucher)}</p>
                        <p className="text-xs font-bold text-primary mt-1">{cost} pts</p>
                      </div>
                      {alreadyClaimed ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                          <CheckCircle size={14} /> Claimed
                        </div>
                      ) : (
                        <button onClick={() => handleClaimVoucher(voucher)} disabled={!canAfford || redeeming === voucher.id}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                            canAfford ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}>
                          {redeeming === voucher.id ? "..." : "Claim"}
                        </button>
                      )}
                    </motion.div>
                  );
                })
              )}

              {/* My Vouchers section */}
              {userVouchers.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Tag size={14} className="text-primary" /> My Vouchers ({userVouchers.length})
                  </h3>
                  {userVouchers.map((uv, i) => (
                    <motion.div key={uv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-primary/5 rounded-xl p-3 flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">🎫</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">{uv.voucher?.name ?? "Voucher"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {uv.voucher?.discount_type === "percentage" ? `${uv.voucher.discount_value}% off` : `RM${uv.voucher?.discount_value} off`}
                          {uv.voucher && uv.voucher.min_spend > 0 ? ` · Min RM${uv.voucher.min_spend}` : ""}
                        </p>
                      </div>
                      <span className="text-[10px] text-primary font-medium">Use in Cart</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "codes" && (
            <motion.div key="codes" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="px-5 space-y-4">
              <div className="bg-card rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-1">Enter Promo Code</h3>
                <p className="text-[11px] text-muted-foreground mb-4">Got a promo code? Enter it below to add the voucher to your collection.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
                  />
                  <button
                    onClick={handleApplyCode}
                    disabled={applyingCode || !promoCode.trim()}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applyingCode ? "..." : "Apply"}
                  </button>
                </div>
              </div>

              {/* My Vouchers from codes */}
              {userVouchers.filter((uv) => uv.voucher?.voucher_type === "system").length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <KeyRound size={14} className="text-primary" /> Redeemed Codes
                  </h3>
                  {userVouchers.filter((uv) => uv.voucher?.voucher_type === "system").map((uv, i) => (
                    <motion.div key={uv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-primary/5 rounded-xl p-3 flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">🎟️</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">{uv.voucher?.name ?? "Voucher"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Code: {uv.voucher?.code} · {uv.voucher?.discount_type === "percentage" ? `${uv.voucher.discount_value}% off` : `RM${uv.voucher?.discount_value} off`}
                        </p>
                      </div>
                      <span className="text-[10px] text-primary font-medium">Use in Cart</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="px-5 space-y-2">
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
              ) : (
                transactions.map((tx: PointTransaction, i: number) => (
                  <motion.div key={tx.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl p-3 flex items-center gap-3 shadow-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "earn" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                      {tx.type === "earn" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === "earn" ? "text-primary" : "text-destructive"}`}>
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
