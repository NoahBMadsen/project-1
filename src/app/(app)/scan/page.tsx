"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RotateCcw, Loader2, BookOpen, MapPin } from "lucide-react";
import { useLocation } from "@/components/location-provider";

interface IdentifyResult {
  identification: {
    scientificName: string;
    commonNames: string[];
    family: string;
    score: number;
    relatedImage: string | null;
  };
  plant: {
    id: string;
    common_name: string;
    scientific_name: string;
    edible: boolean;
    medicinal: boolean;
    toxic: boolean;
    invasive: boolean;
    safety_notes: string;
    edibility_notes: string;
    native_range: string;
  } | null;
}

type ScanState = "camera" | "identifying" | "result";

export default function ScanPage() {
  const { invalidateJournal } = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<ScanState>("camera");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [shareNotes, setShareNotes] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError(
        "Camera access denied. Please allow camera permissions to scan plants."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    startCamera();
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    setCapturedImage(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
    setState("identifying");
    setError(null);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setError("Failed to capture image");
          setState("camera");
          startCamera();
          return;
        }

        const formData = new FormData();
        formData.append("image", blob, "scan.jpg");

        try {
          const res = await fetch("/api/identify", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "Identification failed");
            setState("camera");
            startCamera();
            return;
          }
          setResult(data);
          setState("result");
        } catch {
          setError("Network error. Please try again.");
          setState("camera");
          startCamera();
        }
      },
      "image/jpeg",
      0.85
    );
  };

  const saveToJournal = async () => {
    if (!result) return;
    setSaving(true);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: result.plant?.id ?? null,
          speciesName:
            result.identification.commonNames[0] ??
            result.identification.scientificName,
          confidenceScore: result.identification.score,
          latitude: userLocation?.lat ?? null,
          longitude: userLocation?.lng ?? null,
          notes: notes || null,
          shareNotes,
          photoData: capturedImage,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      invalidateJournal();
      setSaved(true);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setState("camera");
    setSaving(false);
    setResult(null);
    setCapturedImage(null);
    setError(null);
    setNotes("");
    setShareNotes(false);
    setSaved(false);
    startCamera();
  };

  const confidence = result?.identification.score
    ? Math.round(result.identification.score * 100)
    : 0;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-4">
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {(state === "camera" || state === "identifying") && (
        <div className="overflow-hidden rounded-2xl bg-black">
          <div className="relative aspect-[3/4]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${state === "identifying" ? "opacity-50" : ""}`}
            />

            {state === "identifying" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-black/60 px-6 py-4">
                  <Loader2 className="size-8 animate-spin text-emerald-400" />
                  <p className="text-sm text-white">Identifying plant...</p>
                </div>
              </div>
            )}

            {state === "camera" && (
              <div className="absolute inset-x-0 bottom-0 flex justify-center p-6">
                <button
                  onClick={capture}
                  className="flex size-16 items-center justify-center rounded-full bg-white shadow-lg transition active:scale-95"
                >
                  <Camera className="size-7 text-stone-700" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {state === "result" && result && (
        <div className="space-y-4">
          {capturedImage && (
            <div className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedImage}
                alt="Captured plant"
                className="w-full"
              />
            </div>
          )}

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {result.identification.commonNames[0] ??
                    result.identification.scientificName}
                </h2>
                <p className="text-sm italic text-stone-500">
                  {result.identification.scientificName}
                </p>
                <p className="text-xs text-stone-400">
                  {result.identification.family}
                </p>
              </div>
              <div
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  confidence >= 70
                    ? "bg-emerald-100 text-emerald-700"
                    : confidence >= 40
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {confidence}%
              </div>
            </div>

            {(() => {
              const p = result.plant;
              const hasVerifiedSafety =
                p && (p.edible || p.medicinal || p.toxic || p.safety_notes);

              if (!hasVerifiedSafety) {
                return (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-800">
                      Safety data not yet verified
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      Safety data for this species has not been verified yet.
                      Do not consume any plant you cannot positively identify.
                    </p>
                  </div>
                );
              }

              return (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p?.edible && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Edible
                      </span>
                    )}
                    {p?.medicinal && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        Medicinal
                      </span>
                    )}
                    {p?.toxic && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        Toxic - Use Caution
                      </span>
                    )}
                    {p?.invasive && (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                        Invasive Species
                      </span>
                    )}
                  </div>

                  {p?.safety_notes && (
                    <div className="mt-4 rounded-xl bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-800">
                        Safety Info
                      </p>
                      <p className="mt-1 text-sm text-amber-700">
                        {p.safety_notes}
                      </p>
                    </div>
                  )}

                  {p?.edibility_notes && (
                    <div className="mt-3 rounded-xl bg-stone-50 p-3">
                      <p className="text-xs font-semibold text-stone-600">
                        Edibility
                      </p>
                      <p className="mt-1 text-sm text-stone-600">
                        {p.edibility_notes}
                      </p>
                    </div>
                  )}

                  {p?.native_range && (
                    <p className="mt-3 text-xs text-stone-400">
                      Native range: {p.native_range}
                    </p>
                  )}
                </>
              );
            })()}
          </div>

          {!saved ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-stone-700">
                Save to Journal
              </h3>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this find (optional)..."
                className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 placeholder:text-stone-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                rows={3}
              />

              {notes.length > 0 && (
                <label className="mt-3 flex items-center gap-2 text-sm text-stone-600">
                  <input
                    type="checkbox"
                    checked={shareNotes}
                    onChange={(e) => setShareNotes(e.target.checked)}
                    className="size-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <BookOpen className="size-4" />
                  Share notes on community map
                </label>
              )}

              <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-400">
                <MapPin className="size-3" />
                Your find will be pinned on the community map
              </p>

              <button
                onClick={saveToJournal}
                disabled={saving}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <BookOpen className="size-4" />
                )}
                Save to Journal
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <p className="font-medium text-emerald-700">
                Saved to your journal!
              </p>
              <p className="mt-1 text-sm text-emerald-600">
                Pinned on the community map
              </p>
            </div>
          )}

          <button
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
          >
            <RotateCcw className="size-4" />
            Scan Another Plant
          </button>
        </div>
      )}
    </div>
  );
}
