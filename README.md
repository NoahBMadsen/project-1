# Bramble

A community foraging web app for beginner and intermediate foragers. Point your camera at a plant, get an instant AI identification with safety and edibility info, log the find to your personal journal, and see what other foragers have found near you on a live community map.

Built as a senior shadow capstone project · May 2026 · Noah

---

## What It Does

- **AI plant identification** — point your camera at a plant, get a species match and confidence score powered by the Pl@ntNet API
- **Community map** — the default home view; shows all nearby foraged finds clustered on a map centered on your location
- **Personal journal** — automatically created after each scan, pre-filled with plant name, date, and GPS coordinates; add your own private notes
- **Plant database** — browse and search 50,000+ species seeded from the USDA PLANTS database, filterable by edible, medicinal, toxic, and invasive categories
- **Community Field Guide** — crowd-built reference for plants not in the seeded database; grows with every novel find
- **Invasive species flag** — identifies invasive/noxious plants with a clear badge and encourages responsible removal
- **Plant quiz** — quizzes you on plants from your own scan history to sharpen identification skills

---

## Technology Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js (App Router), deployed on Vercel |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Maps | react-leaflet + Leaflet.markercluster |
| Server state | TanStack Query |
| Forms & validation | React Hook Form + Zod |
| Camera | `navigator.mediaDevices.getUserMedia()` + `<input capture>` fallback |
| Geolocation | `navigator.geolocation.getCurrentPosition()` |

### Backend
| Layer | Technology |
|---|---|
| API | Next.js API Routes (Vercel serverless functions) |
| Database | Supabase — PostgreSQL + PostGIS |
| ORM | Drizzle ORM |
| Auth | Supabase Auth — Google OAuth |
| File storage | Supabase Storage |

### Plant Identification & Data
| Role | Technology |
|---|---|
| ID engine | Pl@ntNet API (free tier — 500 identifications/day) |
| Plant profile data | USDA PLANTS database (seeded into Supabase at setup) |
| Species mapping | Pl@ntNet scientific name matched against USDA seeded records |
| Seed images | USDA PLANTS / PlantNet-300K (one stock image per species) |

---

## How Plant Identification Works

```
User takes photo
    → Browser sends image to Pl@ntNet API
    → Pl@ntNet returns: scientific name + confidence score
    → App looks up scientific name in Supabase (USDA-seeded records)
    → Returns: safety info, edibility, invasive flag, stock image
    → Pre-fills journal entry with: plant name, date, GPS coordinates
    → User can attach their own photo to the journal entry
    → If plant is novel (not in DB), triggers Community Field Guide flow
```

---

## Project Files

| File | Description |
|---|---|
| `architecture.md` | Full feature list, technology stack decisions, and design rationale |
| `bramble-wireframes.excalidraw` | UI wireframes for all major screens |
| `bramble-app-map.pdf` | Visual map of the app's feature structure |
| `brainstorm.md` | Original brainstorm session and product concept development |
| `capstone-ideas.pdf` | Side-by-side comparison of the three finalist app concepts |
