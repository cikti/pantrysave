import { useState, useEffect, useCallback } from "react";

const CACHE_KEY = "pantrysave_user_location";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

type CachedLocation = {
  lat: number;
  lng: number;
  timestamp: number;
};

function getCached(): { coords: [number, number]; timestamp: number } | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedLocation = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;
    return { coords: [cached.lat, cached.lng], timestamp: cached.timestamp };
  } catch {
    return null;
  }
}

function setCache(lat: number, lng: number) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ lat, lng, timestamp: Date.now() }));
}

export function useGeolocation() {
  const cached = getCached();
  const [position, setPosition] = useState<[number, number] | null>(cached?.coords ?? null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(!cached);
  const [updatedAt, setUpdatedAt] = useState<number | null>(cached?.timestamp ?? null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setCache(coords[0], coords[1]);
        const now = Date.now();
        setUpdatedAt(now);
        setLoading(false);
      },
      () => {
        if (!position) setError(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (position) setLoading(false);
    requestLocation();
  }, []);

  const refresh = useCallback(() => {
    sessionStorage.removeItem(CACHE_KEY);
    requestLocation();
  }, [requestLocation]);

  return { position, error, loading, refresh, updatedAt };
}
