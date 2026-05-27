"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, MapPin, Leaf, AlertTriangle, Info } from "lucide-react";

import { useLocation, type CachedPlant } from "@/components/location-provider";
import { PlantImage } from "@/components/plant-image";

type Plant = CachedPlant;

function PlantDescription({ scientificName }: { scientificName: string }) {
  const [desc, setDesc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const name = scientificName.split(" ").slice(0, 2).join("_");
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.extract) setDesc(data.extract);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [scientificName]);

  if (!loaded) return <div className="h-12 animate-pulse rounded-lg bg-stone-100" />;
  if (!desc) return null;

  return (
    <div className="rounded-xl bg-stone-50 p-3">
      <p className="text-xs font-semibold text-stone-600">About</p>
      <p className="mt-1 text-sm leading-relaxed text-stone-600">{desc}</p>
    </div>
  );
}

const categories = [
  { key: "all", label: "All" },
  { key: "edible", label: "Edible" },
  { key: "medicinal", label: "Medicinal" },
  { key: "toxic", label: "Toxic" },
  { key: "invasive", label: "Invasive" },
];

function SkeletonCard() {
  return (
    <div className="w-full rounded-2xl border border-stone-200 bg-white p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="size-14 shrink-0 rounded-xl bg-stone-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-stone-200" />
          <div className="h-3 w-1/2 rounded bg-stone-100" />
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">
        <div className="h-5 w-14 rounded bg-stone-100" />
        <div className="h-5 w-16 rounded bg-stone-100" />
      </div>
    </div>
  );
}

function filterByCategory(plants: Plant[], cat: string): Plant[] {
  if (cat === "all") return plants;
  return plants.filter((p) => {
    if (cat === "edible") return p.edible;
    if (cat === "medicinal") return p.medicinal;
    if (cat === "toxic") return p.toxic;
    if (cat === "invasive") return p.invasive;
    return true;
  });
}

export default function PlantsPage() {
  const { lat: userLat, lng: userLng, radiusMiles, cachedPlants } = useLocation();
  const [allPlants, setAllPlants] = useState<Plant[]>(cachedPlants ?? []);
  const [searchResults, setSearchResults] = useState<Plant[] | null>(null);
  const [loading, setLoading] = useState(cachedPlants == null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const initialLoaded = useRef(cachedPlants != null);

  useEffect(() => {
    if (initialLoaded.current) return;
    if (cachedPlants && cachedPlants.length > 0) {
      setAllPlants(cachedPlants);
      setLoading(false);
      initialLoaded.current = true;
    }
  }, [cachedPlants]);

  useEffect(() => {
    if (initialLoaded.current || cachedPlants != null) return;

    const params = new URLSearchParams();
    if (userLat != null && userLng != null) {
      params.set("lat", String(userLat));
      params.set("lng", String(userLng));
      params.set("radius", String(radiusMiles));
    }
    fetch(`/api/plants?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setAllPlants(data.plants ?? []);
        initialLoaded.current = true;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cachedPlants, userLat, userLng, radiusMiles]);

  useEffect(() => {
    if (!query) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ q: query });
      if (userLat != null && userLng != null) {
        params.set("lat", String(userLat));
        params.set("lng", String(userLng));
        params.set("radius", String(radiusMiles));
      }
      fetch(`/api/plants?${params}`)
        .then((r) => r.json())
        .then((data) => setSearchResults(data.plants ?? []))
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, userLat, userLng, radiusMiles]);

  const plants = filterByCategory(
    query ? (searchResults ?? []) : allPlants,
    category
  );
  const isSearching = query.length > 0 && searchResults == null;

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

      {loading || isSearching ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
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
                  <PlantDescription scientificName={plant.scientific_name} />

                  {plant.family && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <Leaf className="size-3.5 text-emerald-500" />
                      <span>Family: <span className="font-medium">{plant.family}</span></span>
                    </div>
                  )}

                  {plant.native_range && (
                    <div className="flex items-start gap-2 text-sm text-stone-600">
                      <Info className="mt-0.5 size-3.5 shrink-0 text-stone-400" />
                      <span>Native range: {plant.native_range}</span>
                    </div>
                  )}

                  {plant.safety_notes && (
                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                        <AlertTriangle className="size-3" />
                        Safety
                      </p>
                      <p className="mt-1 text-sm text-amber-700">
                        {plant.safety_notes}
                      </p>
                    </div>
                  )}
                  {plant.edibility_notes && (
                    <div className="rounded-xl bg-green-50 p-3">
                      <p className="text-xs font-semibold text-green-800">
                        Edibility
                      </p>
                      <p className="mt-1 text-sm text-green-700">
                        {plant.edibility_notes}
                      </p>
                    </div>
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
