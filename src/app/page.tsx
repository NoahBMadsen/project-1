import Link from "next/link";
import {
  Camera,
  BookOpen,
  Map,
  Leaf,
  Search,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI Plant Identification",
    description:
      "Point your camera at any plant. Bramble uses the Pl@ntNet API to identify the species and tell you if it's edible, medicinal, or one to avoid.",
  },
  {
    icon: BookOpen,
    title: "Foraging Journal",
    description:
      "Every scan auto-creates a journal entry with the plant name, GPS coordinates, and date. Add your own notes and photos.",
  },
  {
    icon: Map,
    title: "Community Map",
    description:
      "See what other foragers have found nearby. Browse community pins within 25 miles, clustered on an interactive map.",
  },
  {
    icon: Search,
    title: "Plant Database",
    description:
      "Browse and search a USDA-powered database of plants. Filter by edible, medicinal, toxic, or invasive categories.",
  },
  {
    icon: Leaf,
    title: "Community Field Guide",
    description:
      "Found a plant that's not in our database? Contribute it to the Community Field Guide and help others learn.",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    description:
      "Every plant result includes safety info, edibility notes, and invasive species warnings so you forage with confidence.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Leaf className="size-6 text-emerald-600" />
            <span className="text-xl font-semibold text-stone-900">
              Bramble
            </span>
          </div>
          <Link
            href="/sign-in"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50 to-stone-50 px-6 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <Leaf className="size-4" />
            Community Foraging App
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl">
            Know what grows
            <br />
            around you
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-stone-600">
            Bramble helps you identify wild plants with AI, keep a personal
            foraging journal, and share your finds on a community map. Built for
            foragers, hikers, and the naturally curious.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-in"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              Get Started with Google
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-stone-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-emerald-600">
            How it works
          </h2>
          <p className="mt-2 text-center text-2xl font-bold text-stone-900">
            Three steps from camera to knowledge
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Scan",
                text: "Point your camera at a plant and snap a photo.",
              },
              {
                step: "2",
                title: "Identify",
                text: "Bramble matches it against a database of thousands of species.",
              },
              {
                step: "3",
                title: "Learn & Share",
                text: "Get safety info, save to your journal, and pin it on the community map.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="border-t border-stone-200 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-emerald-600">
            What&apos;s coming
          </h2>
          <p className="mt-2 text-center text-2xl font-bold text-stone-900">
            The full Bramble roadmap
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100">
                  <feature.icon className="size-5 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-stone-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="border-t border-stone-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Built with
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {[
              "Next.js",
              "React",
              "TypeScript",
              "Tailwind CSS",
              "Supabase",
              "PostGIS",
              "Drizzle ORM",
              "Pl@ntNet API",
              "Vercel",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-stone-200 bg-stone-50 px-4 py-1.5 text-sm font-medium text-stone-600"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-5xl text-center text-sm text-stone-400">
          <p>Bramble - Senior Capstone Project by Noah Madsen, 2026</p>
          <p className="mt-1">bramblemap.com</p>
        </div>
      </footer>
    </div>
  );
}
