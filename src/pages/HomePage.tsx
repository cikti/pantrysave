import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { categories, groceryItems } from "@/data/mockData";
import GroceryCard from "@/components/GroceryCard";
import PageTransition from "@/components/PageTransition";
import UserAvatar from "@/components/UserAvatar";
import { useIsMobile } from "@/hooks/use-mobile";

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const isMobile = useIsMobile();

  const filtered =
    activeCategory === "All"
      ? groceryItems
      : groceryItems.filter((i) => i.category === activeCategory);

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 md:pb-8">
        {/* Mobile Header - hidden on desktop (sidebar handles nav) */}
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
              <button className="w-9 h-9 rounded-full bg-card flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                <Search size={18} className="text-foreground" />
              </button>
            </div>
          </header>
        )}

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

        {/* Grid - responsive columns */}
        <main className="px-4 md:px-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filtered.map((item, i) => (
              <GroceryCard key={item.id} item={item} index={i} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm mt-12">
              No items in this category yet.
            </p>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default HomePage;
