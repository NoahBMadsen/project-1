"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Camera, BookOpen, Search } from "lucide-react";

const navItems = [
  { href: "/map", icon: Map, label: "Map" },
  { href: "/scan", icon: Camera, label: "Scan" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/plants", icon: Search, label: "Plants" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur-sm safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition ${
                isActive
                  ? "text-emerald-600"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <item.icon
                className={`size-6 ${isActive ? "text-emerald-600" : ""}`}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
