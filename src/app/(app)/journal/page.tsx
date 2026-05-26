"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2, Camera } from "lucide-react";
import Link from "next/link";

interface JournalEntry {
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

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/journal")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <BookOpen className="size-12 text-stone-300" />
        <h2 className="mt-4 text-lg font-semibold text-stone-700">
          No journal entries yet
        </h2>
        <p className="mt-2 max-w-xs text-sm text-stone-500">
          Scan your first plant to start building your foraging journal.
        </p>
        <Link
          href="/scan"
          className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Camera className="size-4" />
          Scan a Plant
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-xl font-bold text-stone-900">
        My Foraging Journal
      </h1>

      <div className="space-y-3">
        {entries.map((entry) => {
          const confidence = entry.confidence_score
            ? Math.round(entry.confidence_score * 100)
            : null;
          return (
            <div
              key={entry.id}
              className="rounded-2xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-900">
                    {entry.plant_common_name ?? entry.species_name}
                  </h3>
                  {entry.plant_scientific_name && (
                    <p className="text-xs italic text-stone-400">
                      {entry.plant_scientific_name}
                    </p>
                  )}
                </div>
                {confidence != null && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      confidence >= 70
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {confidence}%
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {entry.edible && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    Edible
                  </span>
                )}
                {entry.medicinal && (
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    Medicinal
                  </span>
                )}
                {entry.toxic && (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                    Toxic
                  </span>
                )}
                {entry.invasive && (
                  <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                    Invasive
                  </span>
                )}
              </div>

              {entry.notes && (
                <p className="mt-3 text-sm text-stone-600">{entry.notes}</p>
              )}

              <p className="mt-3 text-xs text-stone-400">
                {new Date(entry.scanned_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
