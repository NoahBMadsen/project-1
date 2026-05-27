"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";

export interface CachedJournalEntry {
  id: string;
  species_name: string;
  confidence_score: number | null;
  notes: string | null;
  scanned_at: string;
  plant_common_name: string | null;
  plant_scientific_name: string | null;
  edible: boolean;
  medicinal: boolean;
  toxic: boolean;
  invasive: boolean;
  safety_notes: string | null;
}

export interface CachedPlant {
  id: string;
  scientific_name: string;
  common_name: string | null;
  family: string | null;
  edible: boolean;
  medicinal: boolean;
  toxic: boolean;
  invasive: boolean;
  native_range: string | null;
  safety_notes: string | null;
  edibility_notes: string | null;
  image_url: string | null;
  spotted_nearby: boolean;
}

export interface CachedPin {
  id: string;
  species_name: string;
  pinned_at: string;
  latitude: number;
  longitude: number;
  common_name: string | null;
  scientific_name: string | null;
  edible: boolean;
  medicinal: boolean;
  toxic: boolean;
  invasive: boolean;
  safety_notes: string | null;
  image_url: string | null;
  shared_notes: string | null;
  user_display_name: string | null;
}

interface LocationState {
  lat: number | null;
  lng: number | null;
  radiusMiles: number;
  setLocation: (lat: number, lng: number) => void;
  setRadiusMiles: (r: number) => void;
  cachedPlants: CachedPlant[] | null;
  plantsCacheKey: string | null;
  prefetchPlants: (lat: number, lng: number, radius: number) => void;
  cachedJournal: CachedJournalEntry[] | null;
  prefetchJournal: () => void;
  invalidateJournal: () => void;
  cachedPins: CachedPin[] | null;
  setCachedPins: (pins: CachedPin[]) => void;
}

const LocationContext = createContext<LocationState>({
  lat: null,
  lng: null,
  radiusMiles: 25,
  setLocation: () => {},
  setRadiusMiles: () => {},
  cachedPlants: null,
  plantsCacheKey: null,
  prefetchPlants: () => {},
  cachedJournal: null,
  prefetchJournal: () => {},
  invalidateJournal: () => {},
  cachedPins: null,
  setCachedPins: () => {},
});

export function useLocation() {
  return useContext(LocationContext);
}

function buildCacheKey(lat: number, lng: number, radius: number) {
  return `${lat.toFixed(4)}:${lng.toFixed(4)}:${radius}`;
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [cachedPlants, setCachedPlants] = useState<CachedPlant[] | null>(null);
  const [plantsCacheKey, setPlantsCacheKey] = useState<string | null>(null);
  const [cachedJournal, setCachedJournal] = useState<CachedJournalEntry[] | null>(null);
  const [cachedPins, setCachedPins] = useState<CachedPin[] | null>(null);
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

  const prefetchJournal = useCallback(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((data) => {
        if (data.entries) setCachedJournal(data.entries);
      })
      .catch(() => {});
  }, []);

  const invalidateJournal = useCallback(() => {
    setCachedJournal(null);
  }, []);

  const prefetchPlants = useCallback((pLat: number, pLng: number, radius: number) => {
    const key = buildCacheKey(pLat, pLng, radius);
    const params = new URLSearchParams({
      lat: String(pLat),
      lng: String(pLng),
      radius: String(radius),
    });
    fetch(`/api/plants?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.plants) {
          setCachedPlants(data.plants);
          setPlantsCacheKey(key);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <LocationContext.Provider
      value={{ lat, lng, radiusMiles, setLocation, setRadiusMiles, cachedPlants, plantsCacheKey, prefetchPlants, cachedJournal, prefetchJournal, invalidateJournal, cachedPins, setCachedPins }}
    >
      {children}
    </LocationContext.Provider>
  );
}
