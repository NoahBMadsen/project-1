"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, User, Eye, EyeOff } from "lucide-react";

type DisplayPref = "anonymous" | "username" | "real_name";

const prefOptions: { value: DisplayPref; label: string; desc: string }[] = [
  { value: "anonymous", label: "Anonymous", desc: "Your name is hidden on all activity" },
  { value: "username", label: "Username", desc: "Show your chosen username on map pins" },
  { value: "real_name", label: "Real Name", desc: "Show your real name on map pins" },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [displayPref, setDisplayPref] = useState<DisplayPref>("anonymous");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        const p = data.profile;
        setDisplayName(p.display_name ?? "");
        setUsername(p.username ?? "");
        setDisplayPref(p.display_preference ?? "anonymous");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || null,
          display_preference: displayPref,
        }),
      });
      if (res.ok) setSaved(true);
    } catch {}
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const previewName =
    displayPref === "real_name"
      ? displayName || "Your Name"
      : displayPref === "username"
        ? username || "Set a username"
        : "Anonymous forager";

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-xl font-bold text-stone-900">Profile Settings</h1>

      <div className="space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-stone-700">Display Name</h2>
          <p className="mb-3 text-xs text-stone-400">
            How you appear on the community map and shared activity
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
              Username
            </label>
            <p className="mb-3 text-xs text-stone-400">
              Choose a name that will appear on your map pins
            </p>
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

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-stone-700">Preview</h2>
          <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
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
          disabled={saving || (displayPref === "username" && !username.trim())}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="size-4" />
              Saved!
            </>
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>
    </div>
  );
}
