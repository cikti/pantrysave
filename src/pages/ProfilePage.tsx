import { Leaf, Wallet, ShoppingBag, TrendingUp, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const stats = [
  {
    icon: Wallet,
    label: "Money Saved",
    value: "RM 124.50",
    color: "bg-accent text-accent-foreground",
  },
  {
    icon: Leaf,
    label: "Food Saved",
    value: "18.2 kg",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ShoppingBag,
    label: "Orders Made",
    value: "12",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    icon: TrendingUp,
    label: "Items Listed",
    value: "5",
    color: "bg-accent text-accent-foreground",
  },
];

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
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
          className="w-9 h-9 rounded-full bg-card flex items-center justify-center shadow-sm"
        >
          <LogOut size={16} className="text-muted-foreground" />
        </button>
      </header>

      {/* Avatar area */}
      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
          <Leaf size={32} className="text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground mt-3">
          {user?.user_metadata?.name || "Pantry Hero"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {user?.email}
        </p>
      </div>

      {/* Stats grid */}
      <div className="px-5 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`${s.color} rounded-2xl p-4 flex flex-col gap-2`}
          >
            <s.icon size={20} />
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-[11px] font-medium opacity-70">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
