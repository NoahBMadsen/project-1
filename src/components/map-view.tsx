"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocation } from "@/components/location-provider";

const LEAF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 7 20 7s2.1 4.5 .1 10.2A7 7 0 0 1 11 20"/><path d="M10 20.5c2-2.5 3-5 3.5-8.5"/></svg>`;

const PIN_SIZE = 38;
const PIN_BORDER = 3;
const PIN_INNER = PIN_SIZE - PIN_BORDER * 2;

const iconCache = new Map<string, L.DivIcon>();

function plantPinIcon(imageUrl: string | null, invasive: boolean): L.DivIcon {
  const cacheKey = `${imageUrl ?? ""}|${invasive}`;
  const cached = iconCache.get(cacheKey);
  if (cached) return cached;

  const border = invasive ? "#f97316" : "#16a34a";

  let inner: string;
  if (imageUrl) {
    inner = `<img src="${encodeURI(imageUrl)}" width="${PIN_INNER}" height="${PIN_INNER}" style="position:absolute;top:0;left:0;width:${PIN_INNER}px;height:${PIN_INNER}px;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.nextSibling.style.display='block'" /><div style="display:none;width:${PIN_INNER}px;height:${PIN_INNER}px;background:${border};border-radius:50%;text-align:center;line-height:${PIN_INNER}px">${LEAF_SVG}</div>`;
  } else {
    inner = LEAF_SVG;
  }

  const icon = L.divIcon({
    className: "",
    html: `<div style="width:${PIN_SIZE}px;height:${PIN_SIZE}px;border-radius:50%;border:${PIN_BORDER}px solid ${border};background:${imageUrl ? '#e5e5e5' : border};box-shadow:0 2px 8px rgba(0,0,0,0.3);overflow:hidden;position:relative;text-align:center;line-height:${PIN_INNER}px">${inner}</div>`,
    iconSize: [PIN_SIZE, PIN_SIZE],
    iconAnchor: [PIN_SIZE / 2, PIN_SIZE / 2],
    popupAnchor: [0, -(PIN_SIZE / 2 + 4)],
  });

  iconCache.set(cacheKey, icon);
  return icon;
}

const defaultIcon = L.divIcon({
  className: "",
  html: `<div style="width:${PIN_SIZE}px;height:${PIN_SIZE}px;border-radius:50%;border:${PIN_BORDER}px solid #16a34a;background:#16a34a;box-shadow:0 2px 8px rgba(0,0,0,0.3);overflow:hidden;text-align:center;line-height:${PIN_INNER}px">${LEAF_SVG}</div>`,
  iconSize: [PIN_SIZE, PIN_SIZE],
  iconAnchor: [PIN_SIZE / 2, PIN_SIZE / 2],
  popupAnchor: [0, -(PIN_SIZE / 2 + 4)],
});

L.Marker.prototype.options.icon = defaultIcon;

interface Pin {
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

function LocationTracker({
  onLocationFound,
  onLocationError,
}: {
  onLocationFound: (lat: number, lng: number) => void;
  onLocationError: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    const onFound = (e: L.LocationEvent) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
    };
    const onError = () => {
      onLocationError();
    };
    map.locate({ setView: true, maxZoom: 13 });
    map.on("locationfound", onFound);
    map.on("locationerror", onError);
    return () => {
      map.off("locationfound", onFound);
      map.off("locationerror", onError);
    };
  }, [map, onLocationFound, onLocationError]);

  return null;
}

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

export function MapView() {
  const { lat: ctxLat, lng: ctxLng, radiusMiles, setLocation, setRadiusMiles, prefetchPlants, prefetchJournal, cachedPins, setCachedPins } = useLocation();
  const [pins, setPins] = useState<Pin[]>((cachedPins as Pin[]) ?? []);
  const [userLat, setUserLat] = useState<number | null>(ctxLat);
  const [userLng, setUserLng] = useState<number | null>(ctxLng);
  const hasLocationFromCtx = ctxLat != null && ctxLng != null;
  const hasCachedPins = cachedPins != null && cachedPins.length > 0;
  const [loading, setLoading] = useState(!hasLocationFromCtx);
  const [loadingPins, setLoadingPins] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    if (ctxLat != null && ctxLng != null) {
      setUserLat(ctxLat);
      setUserLng(ctxLng);
    }
  }, [ctxLat, ctxLng]);

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setUserLat(lat);
    setUserLng(lng);
    setLocation(lat, lng);
  }, [setLocation]);

  const handleLocationError = useCallback(() => {
    setLocationDenied(true);
    setLoading(false);
  }, []);

  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (userLat == null || userLng == null) return;

    if (!hasCachedPins) setLoadingPins(true);
    fetch(`/api/pins?lat=${userLat}&lng=${userLng}&radius=${radiusMiles}`)
      .then((res) => res.json())
      .then((data) => {
        const freshPins = data.pins ?? [];
        setPins(freshPins);
        setCachedPins(freshPins);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setLoadingPins(false);
      });

    if (prefetchTimer.current) clearTimeout(prefetchTimer.current);
    prefetchTimer.current = setTimeout(() => {
      prefetchPlants(userLat, userLng, radiusMiles);
      prefetchJournal();
    }, 500);

    return () => {
      if (prefetchTimer.current) clearTimeout(prefetchTimer.current);
    };
  }, [userLat, userLng, radiusMiles, prefetchPlants]);

  return (
    <div className="relative h-full w-full">
      {(loading || (loadingPins && pins.length === 0)) && (
        <div className="absolute inset-x-0 bottom-16 z-[1000] flex justify-center">
          <div className="flex items-center gap-3 rounded-full bg-black/60 px-5 py-3 shadow-lg backdrop-blur-md">
            <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span className="text-sm font-medium text-white">
              {loading ? "Finding your location..." : "Loading nearby plants..."}
            </span>
          </div>
        </div>
      )}
      {locationDenied && (
        <div className="absolute inset-x-0 top-0 z-[1000] bg-amber-50 px-4 py-4 text-center text-sm text-amber-800">
          <p className="font-medium">Location access is needed to show nearby plants.</p>
          <p className="mt-1.5 text-xs text-amber-600">
            On Mac: System Settings &gt; Privacy &amp; Security &gt; Location Services - make sure it&apos;s on and your browser is allowed.
          </p>
          <p className="mt-1 text-xs text-amber-600">
            On iPhone: Settings &gt; Privacy &gt; Location Services &gt; Safari/Chrome.
          </p>
          <button
            onClick={() => {
              setLocationDenied(false);
              setLoading(true);
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  handleLocationFound(pos.coords.latitude, pos.coords.longitude);
                  setLoading(false);
                },
                () => {
                  setLocationDenied(true);
                  setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
              );
            }}
            className="mt-3 rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700"
          >
            Try Again
          </button>
        </div>
      )}
      {!loading && loadingPins && (
        <div className="absolute inset-x-0 top-0 z-[1000] h-1 overflow-hidden bg-emerald-100">
          <div className="h-full w-1/3 animate-[shimmer_1s_ease-in-out_infinite] rounded-full bg-emerald-500" style={{ animation: "shimmer 1s ease-in-out infinite" }} />
          <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
        </div>
      )}
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationTracker onLocationFound={handleLocationFound} onLocationError={handleLocationError} />

        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          maxClusterRadius={40}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount();
            const size = count < 10 ? 36 : count < 50 ? 44 : 52;
            return L.divIcon({
              className: "",
              html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#16a34a;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="color:white;font-weight:700;font-size:${count < 10 ? 13 : 12}px">${count}</span></div>`,
              iconSize: L.point(size, size),
              iconAnchor: L.point(size / 2, size / 2),
            });
          }}
        >
          {pins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.latitude, pin.longitude]}
              icon={plantPinIcon(pin.image_url, pin.invasive)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <p className="text-base font-semibold">
                    {pin.common_name ?? pin.species_name}
                  </p>
                  {pin.scientific_name && (
                    <p className="text-xs italic text-gray-500">
                      {pin.scientific_name}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {pin.edible && (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                        Edible
                      </span>
                    )}
                    {pin.medicinal && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                        Medicinal
                      </span>
                    )}
                    {pin.toxic && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                        Toxic
                      </span>
                    )}
                    {pin.invasive && (
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">
                        Invasive
                      </span>
                    )}
                  </div>
                  {pin.shared_notes && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      &ldquo;{pin.shared_notes}&rdquo;
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    {pin.user_display_name
                      ? `Spotted by ${pin.user_display_name}`
                      : "Anonymous forager"}
                    {" · "}
                    {new Date(pin.pinned_at).toLocaleDateString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {userLat != null && userLng != null && (
          <>
            <Circle
              center={[userLat, userLng]}
              radius={radiusMiles * 1609.34}
              pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.05, weight: 1.5, dashArray: "6 4" }}
            />
            <Marker
              position={[userLat, userLng]}
              zIndexOffset={1000}
              icon={L.divIcon({
                className: "user-location-marker",
                html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(59,130,246,0.5)"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>You are here</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
      <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <span className="text-xs font-medium text-stone-500">Radius:</span>
        {RADIUS_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRadiusMiles(r)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              radiusMiles === r
                ? "bg-emerald-600 text-white"
                : "text-stone-500 hover:bg-stone-100"
            }`}
          >
            {r}mi
          </button>
        ))}
      </div>
    </div>
  );
}
