import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { MapPin, Search, X, Clock, Trash2, ShoppingCart, MessageCircle } from "lucide-react";
import { categories, groceryItems } from "@/data/mockData";
import GroceryCard from "@/components/GroceryCard";
import PageTransition from "@/components/PageTransition";
import UserAvatar from "@/components/UserAvatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useListings } from "@/hooks/useListings";
import { useCart } from "@/contexts/CartContext";
import { useChat } from "@/contexts/ChatContext";
import { useOrders } from "@/contexts/OrderContext";
import { useTotalUnread } from "@/hooks/useChat";
import type { GroceryItem } from "@/data/mockData";
import MyOrders from "@/components/MyOrders";

const STORAGE_KEY = "pantrysave_recent_searches";
const MAX_RECENT = 6;

function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveRecentSearch(query: string) {
  const q = query.trim();
  if (!q) return;
  const updated = [q, ...getRecentSearches().filter((s) => s !== q)].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
function clearRecentSearches() { localStorage.removeItem(STORAGE_KEY); }

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecent, setShowRecent] = useState(false);
  
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: dbListings } = useListings();
  const { count: cartCount } = useCart();
  const { openChat } = useChat();
  const unreadCount = useTotalUnread();
  const { purchasedIds } = useOrders();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowRecent(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commitSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (q.trim()) { saveRecentSearch(q.trim()); setRecentSearches(getRecentSearches()); }
    setShowRecent(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") commitSearch(searchQuery); };
  const handleClearHistory = () => { clearRecentSearches(); setRecentSearches([]); };

  // Convert DB listings to GroceryItem-like shape for display
  const dbItems: GroceryItem[] = useMemo(() => {
    return (dbListings || []).map((l) => ({
      id: `db-${l.id}`,
      name: l.name,
      seller: l.seller_name || l.address || "Local seller",
      image: l.image_url || "",
      category: l.category || "Fresh Produce",
      weight: l.weight || "",
      originalPrice: Number(l.original_price),
      clearancePrice: Number(l.discount_price),
      badge: l.condition || "Discounted",
      badgeType: (l.condition === "Near Expiry" ? "expiry" : l.condition === "Imperfect Look" ? "imperfect" : "overstock") as GroceryItem["badgeType"],
      reason: l.reason || "Discounted item",
    }));
  }, [dbListings]);

  const allItems = useMemo(() => [...groceryItems, ...dbItems], [dbItems]);

  // Filter out items that are already in the cart
  const { items: cartItems } = useCart();
  const cartListingIds = useMemo(() => new Set(cartItems.map((ci) => ci.listing_id)), [cartItems]);

  const shopItems = useMemo(() => allItems.filter((item) => {
    const rawId = item.id.startsWith("db-") ? item.id.replace("db-", "") : item.id;
    // Hide items in cart OR already purchased
    if (cartListingIds.has(rawId)) return false;
    if (purchasedIds.has(rawId)) return false;
    return true;
  }), [allItems, cartListingIds, purchasedIds]);

  const filtered = useMemo(() => {
    let items = activeCategory === "All" ? shopItems : shopItems.filter((i) => i.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.seller.toLowerCase().includes(q) ||
          i.reason.toLowerCase().includes(q) ||
          i.badge.toLowerCase().includes(q)
      );
    }
    return items;
  }, [activeCategory, searchQuery, allItems]);

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 md:pb-8">
        {isMobile && (
          <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">PantrySave</h1>
                <button className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin size={12} /><span>Taman Melawati</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => openChat()} className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted active:scale-90 transition-transform">
                  <MessageCircle size={18} className="text-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <button onClick={() => navigate("/cart")} className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted active:scale-90 transition-transform">
                  <ShoppingCart size={18} className="text-foreground" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </button>
                <UserAvatar size="sm" />
              </div>
            </div>
          </header>
        )}

        <div className="px-4 md:px-6 pt-3 pb-1" ref={searchRef}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowRecent(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search for food, items, or categories…"
              className="w-full h-10 pl-9 pr-9 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setShowRecent(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:scale-90 transition-transform"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {showRecent && !searchQuery && recentSearches.length > 0 && (
            <div className="mt-1.5 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-[11px] font-medium text-muted-foreground">Recent</span>
                <button onClick={handleClearHistory} className="text-[11px] text-muted-foreground/70 flex items-center gap-1 active:scale-95 transition-transform">
                  <Trash2 size={11} /> Clear
                </button>
              </div>
              {recentSearches.map((term) => (
                <button key={term} onClick={() => commitSearch(term)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/50 active:bg-muted transition-colors">
                  <Clock size={13} className="text-muted-foreground shrink-0" /><span className="truncate">{term}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sticky top-0 md:top-0 z-30 bg-background/90 backdrop-blur-md px-4 md:px-6 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x-mandatory">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap text-xs font-medium px-4 py-2 rounded-full transition-all duration-200 snap-center active:scale-95 ${
                  activeCategory === cat ? "bg-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <MyOrders />

        <main className="px-4 md:px-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((item, i) => (
              <GroceryCard key={item.id} item={item} index={i} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center mt-16">
              <p className="text-muted-foreground text-sm">No items found</p>
              <p className="text-muted-foreground/70 text-xs mt-1">Try different keywords or browse a category</p>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default HomePage;
