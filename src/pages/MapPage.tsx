import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { groceryItems } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useListings, type Listing } from "@/hooks/useListings";
import { useOrders } from "@/contexts/OrderContext";
import type { GroceryItem } from "@/data/mockData";

const storeLocations: Record<string, [number, number]> = {
  "1": [3.157, 101.712],
  "2": [3.139, 101.6869],
  "3": [3.171, 101.705],
  "4": [3.148, 101.723],
  "5": [3.162, 101.695],
  "6": [3.135, 101.71],
};

type PreviewItem = {
  id: string;
  name: string;
  seller: string;
  image: string;
  originalPrice: number;
  discountPrice: number;
  isDbListing?: boolean;
};

const MapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<PreviewItem | null>(null);
  const { data: dbListings } = useListings();
  const { purchasedIds } = useOrders();

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous instance
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current).setView([3.155, 101.705], 14);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const defaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    let markerIndex = 0;

    // Add mock items
    groceryItems.forEach((item) => {
      if (purchasedIds.has(item.id)) return;
      const pos = storeLocations[item.id];
      if (!pos) return;
      const idx = markerIndex++;
      const marker = L.marker(pos, { icon: defaultIcon }).addTo(map);
      animateMarker(marker, idx);
      marker.on("click", () => {
        setSelectedItem({
          id: item.id,
          name: item.name,
          seller: item.seller,
          image: item.image,
          originalPrice: item.originalPrice,
          discountPrice: item.clearancePrice,
        });
      });
    });

    // Add DB listings with coordinates
    (dbListings || []).forEach((listing) => {
      if (!listing.latitude || !listing.longitude) return;
      const idx = markerIndex++;
      const marker = L.marker([listing.latitude, listing.longitude], { icon: defaultIcon }).addTo(map);
      animateMarker(marker, idx);
      marker.on("click", () => {
        setSelectedItem({
          id: listing.id,
          name: listing.name,
          seller: listing.address || "Local seller",
          image: listing.image_url || "",
          originalPrice: Number(listing.original_price),
          discountPrice: Number(listing.discount_price),
          isDbListing: true,
        });
      });
    });

    map.on("click", () => setSelectedItem(null));
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [dbListings]);

  const handlePreviewClick = () => {
    if (!selectedItem) return;
    if (selectedItem.isDbListing) {
      navigate(`/item/db-${selectedItem.id}`);
    } else {
      navigate(`/item/${selectedItem.id}`);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 flex flex-col">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 pt-4 pb-3">
          <h1 className="text-lg font-bold text-foreground tracking-tight">Nearby Listings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Tap a marker to see item details</p>
        </header>

        <div className="flex-1 px-4 pb-4 relative">
          <div
            ref={mapRef}
            className="rounded-2xl overflow-hidden shadow-md border border-border"
            style={{ height: "calc(100vh - 10rem)" }}
          />

          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 120, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="absolute bottom-6 left-4 right-4 bg-card rounded-2xl shadow-lg border border-border p-3 flex gap-3 z-[1000] cursor-pointer"
                onClick={handlePreviewClick}
              >
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-muted shrink-0" />
                )}
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{selectedItem.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedItem.seller}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground line-through">
                      RM{selectedItem.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      RM{selectedItem.discountPrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-primary mt-0.5">Tap to view →</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

function animateMarker(marker: L.Marker, index: number) {
  const el = marker.getElement();
  if (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(-30px)";
    setTimeout(() => {
      el.style.transition = "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 150 + index * 100);
  }
}

export default MapPage;
