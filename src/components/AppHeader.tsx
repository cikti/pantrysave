import { MessageCircle, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserAvatar from "@/components/UserAvatar";
import { useCart } from "@/contexts/CartContext";
import { useChat } from "@/contexts/ChatContext";
import { useTotalUnread } from "@/hooks/useChat";

const AppHeader = () => {
  const navigate = useNavigate();
  const { count } = useCart();
  const { openChat } = useChat();
  const unreadCount = useTotalUnread();

  return (
    <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-foreground" />
        <h1 className="text-lg font-bold text-foreground tracking-tight hidden sm:block">
          PantrySave
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => openChat()}
          className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted active:scale-90 transition-transform"
        >
          <MessageCircle size={18} className="text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate("/cart")}
          className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted active:scale-90 transition-transform"
        >
          <ShoppingCart size={18} className="text-foreground" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
        <UserAvatar size="sm" />
      </div>
    </header>
  );
};

export default AppHeader;
