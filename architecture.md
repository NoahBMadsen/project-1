# Bramble — Feature Architecture
**Senior Shadow Program · May 2026 · Noah**

---

## Core Premise

**AI photo plant identification is the engine of this app.** Every other feature exists to support, enrich, or extend what happens when a user points their camera at a plant and gets an answer. Without it, the journal has no trigger, the Field Guide has no source, the map has no pins, and the quiz has nothing to test. The photo ID feature is not one feature among many — it is the one feature everything else is built around.

---

## Open Design Decisions

| Decision | Options | Consideration |
|---|---|---|
| **Map pin image source** | A) Use seeded database image (USDA / PlantNet-300K) &nbsp; B) Use user's photo taken at scan time | Option A is cheaper — no per-user storage cost, consistent image quality. Option B is more authentic — shows the actual local specimen. Option A is likely correct for v1; user photos could replace or supplement in v2. Decide based on storage cost and Supabase free tier limits. |
| **Map library** | Leaflet.js vs. Google Maps | Leaflet.js is free and open source; Google Maps has a generous free tier but costs money at scale. Leaflet.js recommended for v1. |

---

## Must-Have
*Required for launch. The app is not shippable without these.*

| # | Feature | What it does |
|---|---|---|
| 1 | **User entity** | Handles account creation, login, logout, and profile so every user's journal entries, shared finds, and map pins are tied to them personally. |
| 2 | **Plant database** | A structured dataset of forageable plants (images, identifiable features, edibility/safety notes, geolocation) that users can browse and search at any time — returnable as a row list or directly on the map. Default filter is all plants within 25 miles; radius is user-adjustable. Built to be trainable by an AI model later. |
| 3 | **Community map** | The default app view — opens to a map centered on the user's location with their pin shown. All community entries within the user's radius are displayed and clustered accordingly. Users can also switch to map view while browsing the plant database to see results plotted geographically. |
| 4 | **AI plant identification** | User points their camera at a plant and takes a photo — the app sends it to the Plant.id API or iNaturalist CV API and returns an identification. Immediately displays the plant's safety info, best uses, and key features from the database. The result automatically pre-fills a journal entry with the plant name, date, and location. |
| 5 | **Personal journal** | Auto-created after each AI identification, pre-filled with plant name, location, and date. Users can add personal notes to each entry — notes are private and never shared at launch. |
| 6 | **Community Field Guide** | A crowd-built reference that only grows when a user finds a plant not already in Bramble's seeded database — novel finds fill the gaps that USDA and PlantNet data don't cover. |
| 7 | **Mobile-friendly UI** | Ensures the app works cleanly on a phone screen, since users will be in the field when they use it. |
| 8 | **Deploy to Vercel** | Makes the app publicly accessible at a real URL (bramblemap.com) so it can be demoed to anyone. |
| 9 | **Invasive species flag** | Marks invasive plants in the database and on the map with a clear badge, and tells the user it's safe (and encouraged) to remove them. USDA database includes invasive/noxious flags; PlantNet-300K for images. |
| 10 | **Plant database search + filter** | Lets users search and filter the plant database by category (edible, medicinal, toxic, invasive) and toggle results between row list view and map view. |
| 11 | **Plant quiz** | Pulls plants from the user's historical interactions with the app and quizzes them to improve identification skills. |

---

## Nice-to-Have
*Valuable features that improve the app but won't block launch.*

| # | Feature | What it does |
|---|---|---|
| 1 | **Seasonal filter on map (automatic)** | Lets users filter map pins by season so they only see what's actually findable right now. |
| 2 | **Advanced plant database filter** | Adds compound filtering (combine multiple categories at once) and saved filter presets for power users. |
| 3 | **Photo upload on journal entries** | Lets users attach a photo to each log entry so they have a visual record of what they actually found. |
| 4 | **Share notes on journal entries** | Lets users optionally share their personal notes publicly alongside the plant ID, location, and date when a find is posted to the Field Guide and map. |
| 5 | **Safety badge on plant cards** | Displays a clear visual indicator (safe / caution / toxic) on each plant card so edibility is obvious at a glance. |

---

## Later
*Post-launch ideas for a v2 or beyond — too ambitious for 25 hours.*

| # | Feature | What it does |
|---|---|---|
| 1 | **Train proprietary AI model** | Replace the third-party Plant.id / iNaturalist API with a custom-trained model built on the community's own logged plant data. |
| 2 | **In-season notifications** | Sends a push notification when a plant the user has logged before comes back into season in their area. |
| 3 | **Social forager profiles** | Lets users follow other foragers, see their public logs, and comment on community map pins. |
| 4 | **Mushroom / fungi section** | Expands the plant browser to cover foraging fungi with spore prints, cap shapes, and look-alike warnings. |
| 5 | **Offline mode (PWA)** | Caches the plant browser and the user's field guide locally so the app works without cell service in the woods. |
| 6 | **Weather + conditions integration** | Pulls local weather data to tell users whether today is a good foraging day based on recent rain and temperature. |
| 7 | **Foraging certification track** | Adds a structured quiz path that takes a beginner through progressively harder plant identification challenges. |
| 8 | **Badges** | Gamified version of app, gives badges based off of a certain number of logs to journal. |

---

*Feature list derived from brainstorm session conducted May 14–15, 2026.*
