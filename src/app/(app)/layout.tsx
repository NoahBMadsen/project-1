import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { LocationProvider } from "@/components/location-provider";
import { Leaf, LogOut } from "lucide-react";
import Link from "next/link";
import { sql } from "@/db";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  try {
    const rows = await sql`
      SELECT onboarded_at FROM users WHERE id = ${user.id}
    `;
    if (rows.length === 0 || rows[0].onboarded_at == null) {
      redirect("/welcome");
    }
  } catch {
    // DB unavailable - skip onboarding check rather than crash the page
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Forager";

  return (
    <div className="flex min-h-dvh flex-col bg-stone-50">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/map" className="flex items-center gap-2">
            <Leaf className="size-5 text-emerald-600" />
            <span className="text-lg font-semibold text-stone-900">
              Bramble
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-sm text-stone-500 hover:text-stone-700 transition">
              {displayName}
            </Link>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <LocationProvider>
        <main className="flex-1 pb-20">{children}</main>
      </LocationProvider>

      <BottomNav />
    </div>
  );
}
