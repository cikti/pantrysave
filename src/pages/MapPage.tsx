import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useListings, type Listing } from "@/hooks/useListings";
import { MapPin } from "lucide-react";

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
  lat?: number;
  lng?: number;
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<PreviewItem | null>(null);
  const { data: dbListings } = useListings();
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [locError, setLocError] = useState(false);

  // Request geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setLocError(true),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const center: [number, number] = userPos || [3.155, 101.705];
    const map = L.map(mapRef.current).setView(center, 14);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // User location blue dot
    if (userPos) {
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;background:hsl(217,91%,60%);border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.5);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker(userPos, { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup("You are here");
    }

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

    groceryItems.forEach((item) => {
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
          lat: pos[0],
          lng: pos[1],
        });
      });
    });

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
          lat: listing.latitude!,
          lng: listing.longitude!,
        });
      });
    });

    map.on("click", () => setSelectedItem(null));
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [dbListings, userPos]);

  const handlePreviewClick = () => {
    if (!selectedItem) return;
    if (selectedItem.isDbListing) {
      navigate(`/item/db-${selectedItem.id}`);
    } else {
      navigate(`/item/${selectedItem.id}`);
    }
  };

  const distanceText =
    userPos && selectedItem?.lat && selectedItem?.lng
      ? `${haversineKm(userPos[0], userPos[1], selectedItem.lat, selectedItem.lng).toFixed(1)}km away`
      : null;

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 flex flex-col">
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 pt-4 pb-3">
          <h1 className="text-lg font-bold text-foreground tracking-tight">Nearby Listings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locError ? (
              <span className="flex items-center gap-1 text-destructive">
                <MapPin size={12} /> Enable location to see nearby products
              </span>
            ) : userPos ? (
              "Tap a marker to see item details"
            ) : (
              "Getting your location…"
            )}
          </p>
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
                  <div className="flex items-center gap-2 mt-0.5">
                    {distanceText && (
                      <span className="text-[10px] font-medium text-accent-foreground bg-accent px-1.5 py-0.5 rounded-full">
                        {distanceText}
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-primary">Tap to view →</span>
                  </div>
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
