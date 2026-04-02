import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { groceryItems } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

// Store locations around Kuala Lumpur area
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

    groceryItems.forEach((item) => {
      const pos = storeLocations[item.id];
      if (!pos) return;

      const popupContent = `
        <div style="min-width:180px;cursor:pointer;font-family:'DM Sans',sans-serif" class="map-popup" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:6px" />
          <p style="font-weight:700;font-size:13px;margin:0;line-height:1.3">${item.name}</p>
          <p style="font-size:11px;color:#888;margin:2px 0 0">${item.seller}</p>
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
            <span style="font-size:11px;text-decoration:line-through;color:#aaa">RM${item.originalPrice.toFixed(2)}</span>
            <span style="font-size:13px;font-weight:700;color:#4a6741">RM${item.clearancePrice.toFixed(2)}</span>
          </div>
          <span style="display:inline-block;margin-top:4px;font-size:10px;padding:2px 8px;border-radius:99px;background:#fef3c7;color:#92400e">${item.badge}</span>
        </div>
      `;

      const marker = L.marker(pos, { icon: defaultIcon }).addTo(map);
      marker.bindPopup(popupContent, { maxWidth: 220 });
    });

    // Handle popup clicks for navigation
    map.on("popupopen", (e) => {
      const container = e.popup.getElement();
      const popupDiv = container?.querySelector(".map-popup") as HTMLElement | null;
      if (popupDiv) {
        popupDiv.addEventListener("click", () => {
          const id = popupDiv.dataset.id;
          if (id) navigate(`/item/${id}`);
        });
      }
    });

    // Fix map sizing
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen pb-24 animate-fade-in flex flex-col">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 pt-4 pb-3">
        <h1 className="text-lg font-bold text-foreground tracking-tight">
          Nearby Listings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tap a marker to see item details
        </p>
      </header>

      <div className="flex-1 px-4 pb-4">
        <div
          ref={mapRef}
          className="rounded-2xl overflow-hidden shadow-md border border-border"
          style={{ height: "calc(100vh - 10rem)" }}
        />
      </div>
    </div>
  );
};

export default MapPage;
