import { ShoppingBag, MapPin, PlusCircle, ShoppingCart, Package, MessageCircle, Coins, ClipboardList } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";
import { useTotalUnread } from "@/hooks/useChat";
import { useCart } from "@/contexts/CartContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Shop", url: "/", icon: ShoppingBag },
  { title: "Map View", url: "/map", icon: MapPin },
  { title: "Sell / List", url: "/sell", icon: PlusCircle },
  { title: "Cart", url: "/cart", icon: ShoppingCart },
  { title: "My Orders", url: "/orders", icon: ClipboardList },
  { title: "Reserved", url: "/reserved", icon: Package },
  { title: "Points", url: "/points", icon: Coins },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { openChat } = useChat();
  const unreadCount = useTotalUnread();
  const { count: cartCount } = useCart();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-1">
            {!collapsed && "PantrySave"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <div className="relative mr-2">
                        <item.icon className="h-4 w-4" />
                        {item.title === "Cart" && cartCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 bg-primary">
                            {cartCount > 99 ? "99+" : cartCount}
                          </span>
                        )}
                      </div>
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Chat button in sidebar */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => openChat()}
                    className="flex items-center w-full hover:bg-muted/50 px-2 py-1.5 rounded-md text-sm"
                  >
                    <div className="relative mr-2">
                      <MessageCircle className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-primary-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                    {!collapsed && <span>Chat</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
