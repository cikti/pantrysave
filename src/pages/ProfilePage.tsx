import { useState, useRef } from "react";
import { Leaf, Wallet, ShoppingBag, TrendingUp, LogOut, Camera, User, Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAvatar } from "@/hooks/useAvatar";
import { usePoints } from "@/hooks/usePoints";
import { useImpact } from "@/hooks/useImpact";
import PageTransition from "@/components/PageTransition";
import MyListings from "@/components/MyListings";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { avatarUrl, uploadAvatar } = useAvatar();
  const { balance: pointsBalance } = usePoints();
  const { impact } = useImpact();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"impact" | "listings">("impact");

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    try {
      await uploadAvatar(file);
      toast.success("Avatar updated! 🌿");
    } catch { toast.error("Failed to upload avatar"); }
    finally { setUploading(false); }
  };

  // Dynamic badges based on real impact
  const badges = [
    { label: "Food Saver", emoji: "🌿", unlocked: impact.food_saved >= 5 },
    { label: "Eco Hero", emoji: "🌍", unlocked: impact.food_saved >= 10 || impact.money_saved >= 50 },
    { label: "Pantry Pro", emoji: "⭐", unlocked: impact.orders_made >= 5 },
  ];

  const stats = [
    { icon: Wallet, label: "Money Saved", value: `RM ${impact.money_saved.toFixed(2)}`, color: "bg-accent text-accent-foreground" },
    { icon: Leaf, label: "Food Saved", value: `${impact.food_saved.toFixed(1)} kg`, color: "bg-primary/10 text-primary" },
    { icon: ShoppingBag, label: "Orders Made", value: `${impact.orders_made}`, color: "bg-secondary text-secondary-foreground" },
    { icon: TrendingUp, label: "Items Listed", value: `${impact.items_listed}`, color: "bg-accent text-accent-foreground" },
  ];

  const goalKg = 25;
  const progressPct = Math.min(100, (impact.food_saved / goalKg) * 100);

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 md:pb-8">
        <header className="px-5 pt-8 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">My Profile</h1>
            <p className="text-xs text-muted-foreground mt-1">Your impact & listings</p>
          </div>
          <button onClick={handleLogout} className="w-9 h-9 rounded-full bg-card flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <LogOut size={16} className="text-muted-foreground" />
          </button>
        </header>

        {/* Avatar */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="flex flex-col items-center py-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border shadow-sm bg-muted flex items-center justify-center">
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User size={32} className="text-muted-foreground" />}
            </div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md active:scale-90 transition-transform">
              <Camera size={14} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <h2 className="text-base font-semibold text-foreground mt-3">{user?.user_metadata?.name || "Pantry Hero"}</h2>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          {uploading && <p className="text-[10px] text-primary mt-1 animate-pulse">Uploading...</p>}
        </motion.div>

        {/* Tabs */}
        <div className="px-5 flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("impact")}
            className={`flex-1 text-xs font-medium py-2.5 rounded-xl transition-all ${
              activeTab === "impact" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            Impact
          </button>
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex-1 text-xs font-medium py-2.5 rounded-xl transition-all ${
              activeTab === "listings" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            My Listings
          </button>
        </div>

        {activeTab === "impact" ? (
          <>
            {/* Stats grid */}
            <div className="px-5 grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className={`${s.color} rounded-2xl p-4 flex flex-col gap-2`}>
                  <s.icon size={20} />
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-[11px] font-medium opacity-70">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Impact progress */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="px-5 mt-5">
              <div className="bg-card rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-foreground mb-2">Impact Goal</p>
                <p className="text-xs text-muted-foreground mb-3">Save {goalKg}kg of food from landfill</p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }} className="h-full bg-primary rounded-full" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">{impact.food_saved.toFixed(1)} / {goalKg} kg</p>
              </div>
            </motion.div>

            {/* Badges */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="px-5 mt-4">
              <p className="text-xs font-semibold text-foreground mb-3">Badges</p>
              <div className="flex gap-3">
                {badges.map((b, i) => (
                  <motion.div key={b.label} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: b.unlocked ? 1 : 0.4, scale: 1 }} transition={{ delay: 0.7 + i * 0.1, type: "spring", stiffness: 300 }} className="flex flex-col items-center gap-1.5">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${b.unlocked ? "bg-accent" : "bg-muted"}`}>{b.emoji}</div>
                    <span className="text-[10px] font-medium text-muted-foreground">{b.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Wallet preview */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="px-5 mt-4">
              <button onClick={() => navigate("/points")} className="w-full bg-primary/10 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-2 mb-2">
                  <Coins size={16} className="text-primary" />
                  <p className="text-xs font-semibold text-primary">Reward Points</p>
                </div>
                <motion.p key={pointsBalance} initial={{ scale: 1.05 }} animate={{ scale: 1 }} className="text-2xl font-bold text-primary">
                  {pointsBalance} pts
                </motion.p>
                <p className="text-[10px] text-muted-foreground mt-1">Tap to view rewards & redeem points</p>
              </button>
            </motion.div>
          </>
        ) : (
          <div className="px-5">
            <MyListings />
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
