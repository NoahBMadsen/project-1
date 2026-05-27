import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Leaf } from "lucide-react";

export default async function OnboardingLayout({
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

  return (
    <div className="flex min-h-dvh flex-col bg-stone-50">
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-3">
          <div className="flex items-center gap-2">
            <Leaf className="size-5 text-emerald-600" />
            <span className="text-lg font-semibold text-stone-900">Bramble</span>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
