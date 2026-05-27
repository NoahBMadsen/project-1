"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Eye, EyeOff, Leaf } from "lucide-react";

type DisplayPref = "anonymous" | "username" | "real_name";

const prefOptions: { value: DisplayPref; label: string; desc: string }[] = [
  { value: "anonymous", label: "Anonymous", desc: "Your name is hidden on all activity" },
  { value: "username", label: "Username", desc: "Choose a custom name for the community" },
  { value: "real_name", label: "Real Name", desc: "Use your Google account name" },
];

export default function WelcomePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [displayPref, setDisplayPref] = useState<DisplayPref>("anonymous");

  const previewName =
    displayPref === "real_name"
      ? "Your Google name"
      : displayPref === "username"
        ? username || "Set a username"
        : "Anonymous forager";

  const canSave = displayPref !== "username" || username.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || null,
          display_preference: displayPref,
        }),
      });
      if (res.ok) {
        router.push("/map");
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100">
          <Leaf className="size-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Welcome to Bramble!</h1>
        <p className="mt-2 text-sm text-stone-500">
          Before you start foraging, choose how you want to appear on the community map.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-stone-700">How should we display your name?</h2>
          <p className="mb-4 text-xs text-stone-400">
            This controls what others see on your map pins and shared notes. You can change this anytime in settings.
          </p>

          <div className="space-y-2">
            {prefOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  displayPref === opt.value
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="displayPref"
                  value={opt.value}
                  checked={displayPref === opt.value}
                  onChange={() => setDisplayPref(opt.value)}
                  className="mt-0.5 size-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="text-sm font-medium text-stone-700">{opt.label}</p>
                  <p className="text-xs text-stone-400">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {displayPref === "username" && (
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <label className="mb-1 block text-sm font-semibold text-stone-700">
              Choose a username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username..."
                maxLength={50}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm text-stone-700 placeholder:text-stone-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-3">
            {displayPref === "anonymous" ? (
              <EyeOff className="size-5 text-stone-400" />
            ) : (
              <Eye className="size-5 text-emerald-500" />
            )}
            <div>
              <p className="text-sm text-stone-700">
                Others will see: <span className="font-medium">{previewName}</span>
              </p>
              <p className="text-xs text-stone-400">On map pins and shared notes</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Start Foraging"
          )}
        </button>
      </div>
    </div>
  );
}
