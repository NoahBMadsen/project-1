"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(
  () => import("@/components/map-view").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <div className="h-[calc(100dvh-120px)]">
      <MapView />
    </div>
  );
}
