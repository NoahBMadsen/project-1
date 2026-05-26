"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";

interface LocationState {
  lat: number | null;
  lng: number | null;
  radiusMiles: number;
  setLocation: (lat: number, lng: number) => void;
  setRadiusMiles: (r: number) => void;
}

const LocationContext = createContext<LocationState>({
  lat: null,
  lng: null,
  radiusMiles: 25,
  setLocation: () => {},
  setRadiusMiles: () => {},
});

export function useLocation() {
  return useContext(LocationContext);
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(25);
  const geoRequested = useRef(false);

  useEffect(() => {
    if (geoRequested.current) return;
    geoRequested.current = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => {}
    );
  }, []);

  const setLocation = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  }, []);

  return (
    <LocationContext.Provider value={{ lat, lng, radiusMiles, setLocation, setRadiusMiles }}>
      {children}
    </LocationContext.Provider>
  );
}
