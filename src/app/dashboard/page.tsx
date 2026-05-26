import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Camera,
  BookOpen,
  Map,
  Search,
  Leaf,
  LogOut,
} from "lucide-react";

const comingSoon = [
  {
    icon: Camera,
    title: "Scan a Plant",
    description: "Point your camera at a plant to identify it with AI.",
    href: "/scan",
  },
  {
    icon: BookOpen,
    title: "My Journal",
    description: "Your personal log of every plant you've identified.",
    href: "/journal",
  },
  {
    icon: Map,
    title: "Community Map",
    description: "See what foragers near you have found.",
    href: "/map",
  },
  {
    icon: Search,
    title: "Plant Database",
    description: "Browse thousands of species with safety info.",
    href: "/plants",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Forager";

  return (
    <div className="flex min-h-full flex-col bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="size-6 text-emerald-600" />
            <span className="text-xl font-semibold text-stone-900">
              Bramble
            </span>
          </Link>
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Welcome */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-stone-900">
            Welcome back, {displayName}
          </h1>
          <p className="mt-2 text-stone-500">
            Your Bramble dashboard. Features are being built - here&apos;s
            what&apos;s on the way.
          </p>
        </div>

        {/* Coming soon cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {comingSoon.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <item.icon className="size-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-stone-900">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {item.description}
                  </p>
                  <span className="mt-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white px-6 py-6">
        <div className="mx-auto max-w-5xl text-center text-sm text-stone-400">
          Bramble - Senior Capstone Project by Noah Madsen, 2026
        </div>
      </footer>
    </div>
  );
}
