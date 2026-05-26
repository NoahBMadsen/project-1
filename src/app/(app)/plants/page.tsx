"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, MapPin } from "lucide-react";

import { useLocation } from "@/components/location-provider";
import { PlantImage } from "@/components/plant-image";

interface Plant {
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

const categories = [
  { key: "all", label: "All" },
  { key: "edible", label: "Edible" },
  { key: "medicinal", label: "Medicinal" },
  { key: "toxic", label: "Toxic" },
  { key: "invasive", label: "Invasive" },
];

export default function PlantsPage() {
  const { lat: userLat, lng: userLng, radiusMiles } = useLocation();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== "all") params.set("category", category);
    if (userLat != null && userLng != null) {
      params.set("lat", String(userLat));
      params.set("lng", String(userLng));
      params.set("radius", String(radiusMiles));
    }

    try {
      const res = await fetch(`/api/plants?${params.toString()}`);
      const data = await res.json();
      setPlants(data.plants ?? []);
    } catch {
      setPlants([]);
    }
    setLoading(false);
  }, [query, category, userLat, userLng, radiusMiles]);

  useEffect(() => {
    const timer = setTimeout(fetchPlants, 300);
    return () => clearTimeout(timer);
  }, [fetchPlants]);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold text-stone-900">Plant Database</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name..."
          className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm text-stone-700 placeholder:text-stone-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition ${
              category === cat.key
                ? "bg-emerald-600 text-white"
                : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-emerald-600" />
        </div>
      ) : plants.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-stone-500">No plants found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plants.map((plant) => (
            <button
              key={plant.id}
              onClick={() =>
                setExpanded(expanded === plant.id ? null : plant.id)
              }
              className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-left transition hover:border-stone-300"
            >
              <div className="flex items-start gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                  <PlantImage
                    plantId={plant.id}
                    scientificName={plant.scientific_name}
                    imageUrl={plant.image_url}
                    alt={plant.common_name ?? plant.scientific_name}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-stone-900">
                    {plant.common_name ?? plant.scientific_name}
                  </h3>
                  <p className="truncate text-xs italic text-stone-400">
                    {plant.scientific_name}
                  </p>
                  {plant.family && (
                    <p className="text-xs text-stone-400">{plant.family}</p>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {plant.spotted_nearby && (
                  <span className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <MapPin className="size-3" />
                    Spotted nearby
                  </span>
                )}
                {plant.edible && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    Edible
                  </span>
                )}
                {plant.medicinal && (
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    Medicinal
                  </span>
                )}
                {plant.toxic && (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                    Toxic
                  </span>
                )}
                {plant.invasive && (
                  <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                    Invasive
                  </span>
                )}
              </div>

              {expanded === plant.id && (
                <div className="mt-4 space-y-3 border-t border-stone-100 pt-4">
                  {plant.safety_notes && (
                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-800">
                        Safety
                      </p>
                      <p className="mt-1 text-sm text-amber-700">
                        {plant.safety_notes}
                      </p>
                    </div>
                  )}
                  {plant.edibility_notes && (
                    <div className="rounded-xl bg-stone-50 p-3">
                      <p className="text-xs font-semibold text-stone-600">
                        Edibility
                      </p>
                      <p className="mt-1 text-sm text-stone-600">
                        {plant.edibility_notes}
                      </p>
                    </div>
                  )}
                  {plant.native_range && (
                    <p className="text-xs text-stone-400">
                      Native range: {plant.native_range}
                    </p>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
