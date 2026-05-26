"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Leaf } from "lucide-react";

interface PlantImageProps {
  plantId: string;
  scientificName: string;
  imageUrl: string | null;
  alt: string;
}

export function PlantImage({ plantId, scientificName, imageUrl, alt }: PlantImageProps) {
  const [src, setSrc] = useState(imageUrl);
  const [loading, setLoading] = useState(!imageUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (src || failed) return;

    let cancelled = false;
    fetch("/api/plants/resolve-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: plantId, scientific_name: scientificName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.image_url) {
          setSrc(data.image_url);
        } else {
          setFailed(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [plantId, scientificName, src, failed]);

  if (loading) {
    return (
      <div className="flex size-full items-center justify-center bg-emerald-50">
        <div className="size-4 animate-pulse rounded-full bg-emerald-200" />
      </div>
    );
  }

  if (!src || failed) {
    return (
      <div className="flex size-full items-center justify-center bg-emerald-50">
        <Leaf className="size-6 text-emerald-300" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="56px"
      unoptimized
      onError={() => {
        setFailed(true);
        setSrc(null);
      }}
    />
  );
}
