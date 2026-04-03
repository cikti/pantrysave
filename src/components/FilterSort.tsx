import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type SortOption = "default" | "price-asc" | "price-desc" | "expiry" | "name-az";
export type PriceFilter = "all" | "under5" | "under10" | "under20" | "under50";

interface FilterSortProps {
  sort: SortOption;
  priceFilter: PriceFilter;
  onSortChange: (s: SortOption) => void;
  onPriceFilterChange: (f: PriceFilter) => void;
  resultCount: number;
}

const sortLabels: Record<SortOption, string> = {
  default: "Default",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  expiry: "Expiring Soonest",
  "name-az": "Name: A → Z",
};

const priceLabels: Record<PriceFilter, string> = {
  all: "All Prices",
  under5: "Under RM5",
  under10: "Under RM10",
  under20: "Under RM20",
  under50: "Under RM50",
};

const FilterSort = ({ sort, priceFilter, onSortChange, onPriceFilterChange, resultCount }: FilterSortProps) => {
  const [open, setOpen] = useState(false);
  const hasFilters = sort !== "default" || priceFilter !== "all";

  const activeLabel =
    sort !== "default" && priceFilter !== "all"
      ? `${sortLabels[sort]} · ${priceLabels[priceFilter]}`
      : sort !== "default"
      ? sortLabels[sort]
      : priceFilter !== "all"
      ? priceLabels[priceFilter]
      : null;

  const reset = () => {
    onSortChange("default");
    onPriceFilterChange("all");
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full transition-all active:scale-95 ${
            hasFilters
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card text-muted-foreground border border-border"
          }`}
        >
          <SlidersHorizontal size={13} />
          <span>{activeLabel || "Filter / Sort"}</span>
          <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {hasFilters && (
          <button
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-all flex items-center gap-0.5"
          >
            <X size={12} /> Reset
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 z-50 w-64 bg-card border border-border rounded-xl shadow-lg p-3 space-y-3"
            >
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Sort by</p>
                <div className="space-y-0.5">
                  {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { onSortChange(key); }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                        sort === key ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {sortLabels[key]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Price range</p>
                <div className="space-y-0.5">
                  {(Object.keys(priceLabels) as PriceFilter[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => { onPriceFilterChange(key); }}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                        priceFilter === key ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {priceLabels[key]}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-full text-xs font-medium text-center py-1.5 rounded-lg bg-primary text-primary-foreground active:scale-95 transition-transform"
              >
                Done
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {hasFilters && (
        <p className="text-[11px] text-muted-foreground mt-1.5">
          Showing {resultCount} item{resultCount !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};

export default FilterSort;
