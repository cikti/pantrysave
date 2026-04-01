import { type GroceryItem } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

const badgeColors: Record<string, string> = {
  expiry: "bg-[hsl(25,90%,52%)] text-primary-foreground",
  imperfect: "bg-primary text-primary-foreground",
  overstock: "bg-[hsl(210,60%,50%)] text-primary-foreground",
};

const GroceryCard = ({ item }: { item: GroceryItem }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/item/${item.id}`)}
      className="flex flex-col bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left animate-fade-in"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width={320}
          height={320}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColors[item.badgeType]}`}
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
      </div>
    </button>
  );
};

export default GroceryCard;
