import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Info } from "lucide-react";
import { groceryItems } from "@/data/mockData";
import { toast } from "sonner";

const badgeColors: Record<string, string> = {
  expiry: "bg-[hsl(25,90%,52%)] text-primary-foreground",
  imperfect: "bg-primary text-primary-foreground",
  overstock: "bg-[hsl(210,60%,50%)] text-primary-foreground",
};

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = groceryItems.find((i) => i.id === id);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Item not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 animate-fade-in">
      {/* Image */}
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          width={640}
          height={640}
          className="w-full aspect-square object-cover"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-warm-white/80 backdrop-blur flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <span
          className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full ${badgeColors[item.badgeType]}`}
        >
          {item.badge}
        </span>
      </div>

      {/* Details */}
      <div className="px-5 pt-5">
        <p className="text-xs text-muted-foreground">{item.seller}</p>
        <h2 className="text-xl font-bold text-foreground mt-1">{item.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">{item.weight}</p>

        <div className="flex items-baseline gap-3 mt-3">
          <span className="text-muted-foreground line-through text-sm">
            RM{item.originalPrice.toFixed(2)}
          </span>
          <span className="text-2xl font-bold text-primary">
            RM{item.clearancePrice.toFixed(2)}
          </span>
          <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
            {Math.round(
              ((item.originalPrice - item.clearancePrice) / item.originalPrice) *
                100
            )}
            % off
          </span>
        </div>

        {/* Reason */}
        <div className="mt-6 bg-accent/60 rounded-xl p-4 flex gap-3">
          <Info size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-accent-foreground">
              Why it's discounted
            </p>
            <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-border">
        <button
          onClick={() => toast.success(`${item.name} reserved!`)}
          className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
        >
          <ShoppingCart size={18} />
          Add to Cart & Reserve
        </button>
      </div>
    </div>
  );
};

export default ItemDetail;
