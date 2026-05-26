"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue with Next.js/webpack
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const invasiveIcon = L.divIcon({
  className: "",
  html: '<div style="width:14px;height:14px;background:#f97316;border:3px solid white;border-radius:50%;box-shadow:0 0 4px rgba(249,115,22,0.5)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
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
    map.locate({ setView: true, maxZoom: 13 });
    map.on("locationfound", (e) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
    });
    map.on("locationerror", () => {
      onLocationError();
    });
  }, [map, onLocationFound, onLocationError]);

  return null;
}

export function MapView() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setUserLat(lat);
    setUserLng(lng);
  }, []);

  const handleLocationError = useCallback(() => {
    setLocationDenied(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userLat == null || userLng == null) return;

    fetch(`/api/pins?lat=${userLat}&lng=${userLng}&radius=25`)
      .then((res) => res.json())
      .then((data) => {
        setPins(data.pins ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userLat, userLng]);

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
        )}

        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.latitude, pin.longitude]}
            icon={pin.invasive ? invasiveIcon : defaultIcon}
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
    </div>
  );
}
