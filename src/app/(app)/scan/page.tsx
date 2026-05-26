"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Camera, Leaf, ArrowLeft, Upload, Loader2, AlertCircle } from "lucide-react";

interface PlantResult {
  scientificName: string;
  commonName: string | null;
  confidence: number;
  plant: {
    id: string;
    scientific_name: string;
    common_name: string | null;
    edible: boolean;
    medicinal: boolean;
    toxic: boolean;
    invasive: boolean;
    safety_notes: string | null;
    edibility_notes: string | null;
    image_url: string | null;
  } | null;
  alternatives: {
    scientificName: string;
    commonName: string | null;
    confidence: number;
  }[];
}

const BADGE_CONFIG = [
  { key: "edible", label: "Edible", classes: "bg-emerald-100 text-emerald-800" },
  { key: "medicinal", label: "Medicinal", classes: "bg-blue-100 text-blue-800" },
  { key: "toxic", label: "Toxic", classes: "bg-red-100 text-red-800" },
  { key: "invasive", label: "Invasive", classes: "bg-amber-100 text-amber-800" },
] as const;

export default function ScanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlantResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setResult(null);
    setError(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("image", selectedFile);

      const res = await fetch("/api/identify", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data as PlantResult);
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetScan() {
    setPreview(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex min-h-full flex-col bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-6 py-4">
          <Link
            href="/map"
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
          >
            <ArrowLeft className="size-4" />
            Map
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <Leaf className="size-5 text-emerald-600" />
            <span className="font-semibold text-stone-900">Scan a Plant</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image capture area */}
            <div
              className="relative flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-white transition hover:border-emerald-400 hover:bg-emerald-50/30"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Plant preview"
                  className="max-h-72 w-full rounded-2xl object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100">
                    <Camera className="size-7 text-emerald-600" />
                  </div>
                  <p className="text-base font-medium text-stone-700">
                    Take a photo or choose from your library
                  </p>
                  <p className="text-sm text-stone-400">
                    Point at leaves, flowers, fruit, or bark for best results
                  </p>
                </div>
              )}
            </div>

            {/* Hidden file input — opens camera on mobile */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {preview && (
                <button
                  type="button"
                  onClick={resetScan}
                  className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
                >
                  Retake
                </button>
              )}
              <button
                type="submit"
                disabled={!selectedFile || loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Identifying…
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    {selectedFile ? "Identify Plant" : "Choose a Photo First"}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Result */
          <div className="space-y-5">
            {/* Top match card */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Best Match
                  </p>
                  <h1 className="mt-1 text-xl font-bold text-stone-900">
                    {result.commonName ?? result.scientificName}
                  </h1>
                  <p className="mt-0.5 text-sm italic text-stone-500">
                    {result.scientificName}
                  </p>
                </div>
                {/* Confidence badge */}
                <div className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-center">
                  <p className="text-lg font-bold text-emerald-700">
                    {Math.round(result.confidence * 100)}%
                  </p>
                  <p className="text-xs text-emerald-600">confidence</p>
                </div>
              </div>

              {/* Category badges */}
              {result.plant && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {BADGE_CONFIG.map(({ key, label, classes }) =>
                    result.plant![key] ? (
                      <span
                        key={key}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
                      >
                        {label}
                      </span>
                    ) : null
                  )}
                  {!BADGE_CONFIG.some(({ key }) => result.plant![key]) && (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500">
                      No category data yet
                    </span>
                  )}
                </div>
              )}

              {/* Safety / edibility notes */}
              {result.plant?.safety_notes && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                    Safety
                  </p>
                  <p className="mt-1 text-sm text-red-800">
                    {result.plant.safety_notes}
                  </p>
                </div>
              )}
              {result.plant?.edibility_notes && (
                <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Edibility
                  </p>
                  <p className="mt-1 text-sm text-emerald-800">
                    {result.plant.edibility_notes}
                  </p>
                </div>
              )}

              {!result.plant && (
                <p className="mt-4 text-sm text-stone-400">
                  This species isn&apos;t in the Bramble database yet.
                </p>
              )}
            </div>

            {/* Alternative matches */}
            {result.alternatives.length > 0 && (
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-stone-700">
                  Other possible matches
                </p>
                <ul className="mt-3 divide-y divide-stone-100">
                  {result.alternatives.map((alt) => (
                    <li
                      key={alt.scientificName}
                      className="flex items-center justify-between py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-stone-800">
                          {alt.commonName ?? alt.scientificName}
                        </p>
                        <p className="text-xs italic text-stone-400">
                          {alt.scientificName}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-stone-500">
                        {Math.round(alt.confidence * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetScan}
                className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
              >
                Scan Another
              </button>
              <Link
                href="/map"
                className="flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Back to Map
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
