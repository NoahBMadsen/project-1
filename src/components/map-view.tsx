"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocation } from "@/components/location-provider";

const LEAF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 7 20 7s2.1 4.5 .1 10.2A7 7 0 0 1 11 20"/><path d="M10 20.5c2-2.5 3-5 3.5-8.5"/></svg>`;

function plantPinIcon(imageUrl: string | null, invasive: boolean): L.DivIcon {
  const borderColor = invasive ? "#f97316" : "#16a34a";
  const size = 36;

  const inner = imageUrl
    ? `<img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.outerHTML='${LEAF_SVG.replace(/'/g, "\\'")}'" />`
    : LEAF_SVG;

  const bg = imageUrl ? "transparent" : borderColor;

  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;border:3px solid ${borderColor};background:${bg};box-shadow:0 2px 6px rgba(0,0,0,0.3);overflow:hidden;display:flex;align-items:center;justify-content:center;">${inner}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

const defaultIcon = L.divIcon({
  className: "",
  html: `<div style="width:36px;height:36px;border-radius:50%;border:3px solid #16a34a;background:#16a34a;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">${LEAF_SVG}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
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
  const { lat: ctxLat, lng: ctxLng, radiusMiles, setLocation, setRadiusMiles } = useLocation();
  const [pins, setPins] = useState<Pin[]>([]);
  const [userLat, setUserLat] = useState<number | null>(ctxLat);
  const [userLng, setUserLng] = useState<number | null>(ctxLng);
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setUserLat(lat);
    setUserLng(lng);
    setLocation(lat, lng);
  }, [setLocation]);

  const handleLocationError = useCallback(() => {
    setLocationDenied(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userLat == null || userLng == null) return;

    fetch(`/api/pins?lat=${userLat}&lng=${userLng}&radius=${radiusMiles}`)
      .then((res) => res.json())
      .then((data) => {
        setPins(data.pins ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userLat, userLng, radiusMiles]);

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-stone-50/80">
          <div className="flex flex-col items-center gap-2">
            <div className="size-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-sm text-stone-500">Finding your location...</p>
          </div>
        </div>
      )}
      {locationDenied && (
        <div className="absolute inset-x-0 top-0 z-[1000] bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          Enable location access to see nearby plant pins.
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

        {userLat != null && userLng != null && (
          <>
            <Marker
              position={[userLat, userLng]}
              icon={L.divIcon({
                className: "user-location-marker",
                html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(59,130,246,0.5)"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>You are here</Popup>
            </Marker>
            <Circle
              center={[userLat, userLng]}
              radius={radiusMiles * 1609.34}
              pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 0.05, weight: 1.5, dashArray: "6 4" }}
            />
          </>
        )}

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
                {pin.user_display_name && (
                  <p className="mt-2 text-xs text-gray-400">
                    Spotted by {pin.user_display_name}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(pin.pinned_at).toLocaleDateString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
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
