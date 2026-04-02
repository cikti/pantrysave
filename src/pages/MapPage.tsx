import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { groceryItems } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import type { GroceryItem } from "@/data/mockData";

const storeLocations: Record<string, [number, number]> = {
  "1": [3.1570, 101.7120],
  "2": [3.1390, 101.6869],
  "3": [3.1710, 101.7050],
  "4": [3.1480, 101.7230],
  "5": [3.1620, 101.6950],
  "6": [3.1350, 101.7100],
};

const MapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

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

    groceryItems.forEach((item, i) => {
      const pos = storeLocations[item.id];
      if (!pos) return;

      const marker = L.marker(pos, { icon: defaultIcon }).addTo(map);

      // Animate marker drop with CSS
      const el = marker.getElement();
      if (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(-30px)";
        setTimeout(() => {
          el.style.transition = "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        }, 150 + i * 100);
      }

      marker.on("click", () => {
        setSelectedItem(item);
        // Bounce the marker
        if (el) {
          el.style.transition = "transform 0.2s ease";
          el.style.transform = "translateY(-8px)";
          setTimeout(() => {
            el.style.transform = "translateY(0)";
          }, 200);
        }
      });
    });

    map.on("click", () => setSelectedItem(null));

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 flex flex-col">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 pt-4 pb-3">
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            Nearby Listings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tap a marker to see item details
          </p>
        </header>

        <div className="flex-1 px-4 pb-4 relative">
          <div
            ref={mapRef}
            className="rounded-2xl overflow-hidden shadow-md border border-border"
            style={{ height: "calc(100vh - 10rem)" }}
          />

          {/* Slide-up preview card */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 120, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="absolute bottom-6 left-4 right-4 bg-card rounded-2xl shadow-lg border border-border p-3 flex gap-3 z-[1000] cursor-pointer"
                onClick={() => navigate(`/item/${selectedItem.id}`)}
              >
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {selectedItem.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedItem.seller}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground line-through">
                      RM{selectedItem.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      RM{selectedItem.clearancePrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-primary mt-0.5">
                    Tap to view →
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default MapPage;
