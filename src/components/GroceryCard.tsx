import { type GroceryItem } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const badgeColors: Record<string, string> = {
  expiry: "bg-[hsl(var(--badge-expiry))] text-primary-foreground",
  imperfect: "bg-primary text-primary-foreground",
  overstock: "bg-[hsl(var(--badge-overstock))] text-primary-foreground",
};

const GroceryCard = ({ item, index = 0 }: { item: GroceryItem; index?: number }) => {
  const navigate = useNavigate();
  const saving = (item.originalPrice - item.clearancePrice).toFixed(2);

  return (
    <motion.button
      onClick={() => navigate(`/item/${item.id}`)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -4, boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.15)" }}
      className="flex flex-col bg-card rounded-2xl overflow-hidden shadow-sm text-left tap-highlight"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width={320}
          height={320}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColors[item.badgeType]} ${
            item.badgeType === "expiry" ? "animate-pulse-badge" : ""
          }`}
        >
          {item.badge}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">{item.seller}</p>
        <h3 className="text-sm font-semibold text-foreground leading-tight">
          {item.name}
        </h3>
        <p className="text-xs text-muted-foreground">{item.weight}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground line-through">
            RM{item.originalPrice.toFixed(2)}
          </span>
          <span className="text-sm font-bold text-primary">
            RM{item.clearancePrice.toFixed(2)}
          </span>
        </div>
        <span className="text-[10px] font-medium bg-accent rounded-full px-2 py-0.5 w-fit mt-0.5 text-[#288157]">
          Save RM{saving}
        </span>
      </div>
    </motion.button>
  );
};

export default GroceryCard;
