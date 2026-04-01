import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { categories, groceryItems } from "@/data/mockData";
import GroceryCard from "@/components/GroceryCard";

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? groceryItems
      : groceryItems.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
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
          <button className="w-9 h-9 rounded-full bg-card flex items-center justify-center shadow-sm">
            <Search size={18} className="text-foreground" />
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap text-xs font-medium px-4 py-2 rounded-full transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <main className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item) => (
            <GroceryCard key={item.id} item={item} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm mt-12">
            No items in this category yet.
          </p>
        )}
      </main>
    </div>
  );
};

export default HomePage;
