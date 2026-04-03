import { useMyListings, useUpdateListingStatus, useDeleteListing, type Listing } from "@/hooks/useListings";
import { Trash2, CheckCircle, Package, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useImpact } from "@/hooks/useImpact";

const statusColors: Record<string, string> = {
  available: "bg-primary/10 text-primary",
  reserved: "bg-amber-100 text-amber-700",
  sold: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

const MyListings = () => {
  const { data: listings, isLoading } = useMyListings();
  const updateStatus = useUpdateListingStatus();
  const deleteListing = useDeleteListing();
  const { incrementItemsListed } = useImpact();

  const handleMarkSold = (id: string) => {
    updateStatus.mutate(
      { id, status: "sold" },
      { onSuccess: () => toast.success("Marked as sold! 🎉") }
    );
  };

  const handleDelete = (id: string) => {
    deleteListing.mutate(id, {
      onSuccess: () => toast.success("Listing removed"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-8">
        <Package size={32} className="mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No listings yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Items you list will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((listing, i) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          index={i}
          onMarkSold={handleMarkSold}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

const ListingCard = ({
  listing,
  index,
  onMarkSold,
  onDelete,
}: {
  listing: Listing;
  index: number;
  onMarkSold: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="bg-card rounded-xl border border-border p-3 flex gap-3"
  >
    {listing.image_url ? (
      <img src={listing.image_url} alt={listing.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
    ) : (
      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Package size={20} className="text-muted-foreground" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{listing.name}</p>
          <p className="text-xs text-muted-foreground">
            RM{Number(listing.discount_price).toFixed(2)}
            <span className="line-through ml-1.5 text-muted-foreground/60">
              RM{Number(listing.original_price).toFixed(2)}
            </span>
          </p>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColors[listing.status]}`}>
          {statusLabels[listing.status]}
        </span>
      </div>
      {listing.status !== "sold" && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onMarkSold(listing.id)}
            className="flex items-center gap-1 text-[11px] text-primary font-medium active:scale-95 transition-transform"
          >
            <CheckCircle size={12} /> Mark Sold
          </button>
          <button
            onClick={() => onDelete(listing.id)}
            className="flex items-center gap-1 text-[11px] text-destructive font-medium active:scale-95 transition-transform"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      )}
    </div>
  </motion.div>
);

export default MyListings;
