import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  latitude: number | null;
  longitude: number | null;
  address: string;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange: (address: string) => void;
};

const DEFAULT_CENTER: [number, number] = [3.155, 101.705];

const LocationPicker = ({ latitude, longitude, address, onLocationChange, onAddressChange }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);

  const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  useEffect(() => {
    if (!showMap || !mapRef.current || mapInstance.current) return;

    const center: [number, number] = latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER;
    const map = L.map(mapRef.current).setView(center, 15);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    if (latitude && longitude) {
      markerRef.current = L.marker([latitude, longitude], { icon: defaultIcon }).addTo(map);
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);
      }
    });

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstance.current = null;
      markerRef.current = null;
    };
  }, [showMap]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        onLocationChange(lat, lng);
        if (mapInstance.current) {
          mapInstance.current.setView([lat, lng], 15);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { icon: defaultIcon }).addTo(mapInstance.current);
          }
        }
        setLocating(false);
        if (!showMap) setShowMap(true);
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-foreground block">Location</label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="flex-1 flex items-center justify-center gap-2 bg-card border border-border rounded-xl px-3 py-3 text-xs text-foreground active:scale-95 transition-transform"
        >
          <Navigation size={14} className={locating ? "animate-pulse text-primary" : ""} />
          {locating ? "Locating..." : "Use Current Location"}
        </button>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex-1 flex items-center justify-center gap-2 bg-card border border-border rounded-xl px-3 py-3 text-xs text-foreground active:scale-95 transition-transform"
        >
          <MapPin size={14} />
          {showMap ? "Hide Map" : "Pick on Map"}
        </button>
      </div>

      {latitude && longitude && (
        <p className="text-[10px] text-muted-foreground">
          📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}

      {showMap && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 200 }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden rounded-xl border border-border"
        >
          <div ref={mapRef} style={{ height: 200, width: "100%" }} />
        </motion.div>
      )}

      <input
        type="text"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder="Address or meetup point (optional)"
        className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
      />
    </div>
  );
};

export default LocationPicker;
