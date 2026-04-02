import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { groceryItems } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

// Fix default marker icon issue with bundlers
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Store locations around Kuala Lumpur area
const storeLocations: Record<string, [number, number]> = {
  "1": [3.1570, 101.7120], // Ali Minimart - Taman Melawati
  "2": [3.1390, 101.6869], // Kedai Ah Seng - Wangsa Maju
  "3": [3.1710, 101.7050], // Pasar Taman Sri
  "4": [3.1480, 101.7230], // Butcher Bros
  "5": [3.1620, 101.6950], // Kak Lina's Pantry
  "6": [3.1350, 101.7100], // Aunty Mei's Farm
};

const MapPage = () => {
  const navigate = useNavigate();
  const center: [number, number] = [3.155, 101.705];

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
        <div className="rounded-2xl overflow-hidden shadow-md border border-border h-[calc(100vh-10rem)]">
          <MapContainer
            center={center}
            zoom={14}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {groceryItems.map((item) => {
              const pos = storeLocations[item.id];
              if (!pos) return null;
              return (
                <Marker key={item.id} position={pos} icon={defaultIcon}>
                  <Popup>
                    <div
                      className="cursor-pointer min-w-[180px]"
                      onClick={() => navigate(`/item/${item.id}`)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-20 object-cover rounded-md mb-2"
                      />
                      <p className="font-bold text-sm leading-tight">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.seller}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs line-through text-gray-400">
                          RM{item.originalPrice.toFixed(2)}
                        </span>
                        <span className="text-sm font-bold text-green-700">
                          RM{item.clearancePrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {item.badge}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
