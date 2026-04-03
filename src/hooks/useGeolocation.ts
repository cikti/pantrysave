import { useState, useEffect } from "react";

const CACHE_KEY = "pantrysave_user_location";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

type CachedLocation = {
  lat: number;
  lng: number;
  timestamp: number;
};

function getCached(): [number, number] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedLocation = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;
    return [cached.lat, cached.lng];
  } catch {
    return null;
  }
}

function setCache(lat: number, lng: number) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ lat, lng, timestamp: Date.now() }));
}

export function useGeolocation() {
  const [position, setPosition] = useState<[number, number] | null>(getCached);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(!getCached());

  useEffect(() => {
    // If we already have a cached position, don't re-request immediately
    if (position) {
      setLoading(false);
    }

    if (!navigator.geolocation) {
      setError(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setCache(coords[0], coords[1]);
        setLoading(false);
      },
      () => {
        if (!position) setError(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { position, error, loading };
}
