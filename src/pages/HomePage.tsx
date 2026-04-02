import { useState, useMemo } from "react";
import { MapPin, Search, X } from "lucide-react";
import { categories, groceryItems } from "@/data/mockData";
import GroceryCard from "@/components/GroceryCard";
import PageTransition from "@/components/PageTransition";
import UserAvatar from "@/components/UserAvatar";
import { useIsMobile } from "@/hooks/use-mobile";

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    let items = activeCategory === "All"
      ? groceryItems
      : groceryItems.filter((i) => i.category === activeCategory);

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
  }, [activeCategory, searchQuery]);

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 md:pb-8">
        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  PantrySave
                </h1>
                <button className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin size={12} />
                  <span>Taman Melawati</span>
                </button>
              </div>
              <UserAvatar size="sm" />
            </div>
          </header>
        )}

        {/* Search bar */}
        <div className="px-4 md:px-6 pt-3 pb-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for food, items, or categories…"
              className="w-full h-10 pl-9 pr-9 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:scale-90 transition-transform"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="sticky top-0 md:top-0 z-30 bg-background/90 backdrop-blur-md px-4 md:px-6 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x-mandatory">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap text-xs font-medium px-4 py-2 rounded-full transition-all duration-200 snap-center active:scale-95 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <main className="px-4 md:px-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((item, i) => (
              <GroceryCard key={item.id} item={item} index={i} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center mt-16">
              <p className="text-muted-foreground text-sm">No items found</p>
              <p className="text-muted-foreground/70 text-xs mt-1">
                Try different keywords or browse a category
              </p>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default HomePage;
