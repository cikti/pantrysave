import { useState } from "react";
import { ArrowLeft, MapPin, Truck, Package, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReservations } from "@/hooks/useReservations";
import { useAuth } from "@/contexts/AuthContext";
import { usePoints } from "@/hooks/usePoints";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const ReservedPage = () => {
  const { reservations, loading, markCollected } = useReservations();
  const { user } = useAuth();
  const { earnPoints } = usePoints();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "reserved" | "collected">("all");

  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
          <Package size={48} className="text-muted-foreground" />
          <p className="text-muted-foreground">Please log in to view reserved items</p>
          <button onClick={() => navigate("/login")} className="text-primary font-semibold">Log in</button>
        </div>
      </PageTransition>
    );
  }

  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);

  const handleCollect = async (id: string) => {
    try {
      const reservation = reservations.find((r) => r.id === id);
      await markCollected(id);
      // Earn points on collection
      const points = Math.max(1, Math.round(reservation?.listing?.discount_price || 5));
      try {
        await earnPoints.mutateAsync({ amount: points, description: `Collected: ${reservation?.listing?.name || "item"}` });
        toast.success(`Collected! +${points} points earned 🌿`);
      } catch {
        toast.success("Marked as collected! 🌿");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-foreground">Reserved Items</h1>
        </div>

        {/* Filter tabs */}
        <div className="px-4 pt-4 flex gap-2">
          {(["all", "reserved", "collected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-4 py-2 rounded-xl transition-all capitalize ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 gap-4 text-center px-6">
            <Package size={48} className="text-muted-foreground" />
            <p className="text-muted-foreground">No {filter !== "all" ? filter : ""} items yet</p>
            <button onClick={() => navigate("/")} className="text-primary font-semibold text-sm">Browse items</button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filtered.map((res, idx) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => navigate(`/item/db-${res.listing_id}`)}
                  className="w-full flex gap-3 p-3 text-left"
                >
                  {res.listing?.image_url ? (
                    <img src={res.listing.image_url} alt={res.listing?.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">{res.listing?.name || "Item"}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        res.status === "collected" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"
                      }`}>
                        {res.status === "collected" ? "Collected ✓" : "Reserved"}
                      </span>
                    </div>
                    {res.listing?.weight && (
                      <p className="text-xs text-muted-foreground">{res.listing.weight}</p>
                    )}
                    <p className="text-primary font-bold text-sm mt-1">RM{(res.listing?.discount_price || 0).toFixed(2)}</p>

                    {/* Delivery info */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                      {(res.delivery_type || res.listing?.delivery_type) === "pickup" ? (
                        <>
                          <MapPin size={12} className="text-primary shrink-0" />
                          <span className="truncate">Self Pickup{res.address || res.listing?.address ? ` — ${res.address || res.listing?.address}` : ""}</span>
                        </>
                      ) : (
                        <>
                          <Truck size={12} className="text-primary shrink-0" />
                          <span>
                            {(res.delivery_service || res.listing?.delivery_service)
                              ? `${(res.delivery_service || res.listing?.delivery_service || "").charAt(0).toUpperCase() + (res.delivery_service || res.listing?.delivery_service || "").slice(1)} Delivery`
                              : "Third-party Delivery"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>

                {/* Action bar */}
                {res.status === "reserved" && (
                  <div className="px-3 pb-3 flex gap-2">
                    <button
                      onClick={() => handleCollect(res.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl bg-primary text-primary-foreground active:scale-95 transition-transform"
                    >
                      <Check size={14} />
                      Mark Collected
                    </button>
                    {(res.delivery_type || res.listing?.delivery_type) === "pickup" && (res.listing?.latitude || res.latitude) && (
                      <button
                        onClick={() => navigate("/map")}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-4 rounded-xl bg-card border border-border text-foreground active:scale-95 transition-transform"
                      >
                        <MapPin size={14} />
                        Map
                      </button>
                    )}
                    {(res.delivery_type || res.listing?.delivery_type) !== "pickup" && (
                      <button
                        onClick={() => {
                          const service = res.delivery_service || res.listing?.delivery_service || "grab";
                          const url = service === "lalamove" ? "https://www.lalamove.com" : "https://www.grab.com";
                          window.open(url, "_blank");
                        }}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-4 rounded-xl bg-card border border-border text-foreground active:scale-95 transition-transform"
                      >
                        <ExternalLink size={14} />
                        Book
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ReservedPage;
