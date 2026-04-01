import { MapPin } from "lucide-react";

const MapPage = () => (
  <div className="min-h-screen pb-24 animate-fade-in flex flex-col items-center justify-center px-5">
    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
      <MapPin size={28} className="text-primary" />
    </div>
    <h2 className="text-lg font-bold text-foreground">Map View</h2>
    <p className="text-sm text-muted-foreground text-center mt-2 max-w-xs">
      Discover nearby sellers and pickup points. Map integration coming soon!
    </p>
  </div>
);

export default MapPage;
