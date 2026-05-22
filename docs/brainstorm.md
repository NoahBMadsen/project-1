# Bramble — Capstone Project Brainstorm
**Senior Shadow Program · May 2026 · Noah**

---

## The Chosen Idea

### Project Name
**Bramble** *(working title — subject to change)*

*A bramble is a rough, wild, thorny plant — blackberries, raspberries, and their kin. The word evokes rugged outdoor terrain, foraging, and things that grow untamed.*

---

### One-Line Pitch
A foraging companion where you identify plants, log your finds, quiz yourself on what you've learned, and discover community-pinned spots near you.

---

### Target User
Beginner and intermediate foragers — teens, young adults, and general outdoors lovers — who want a personal field guide, a way to learn plant identification, and a map to connect with their local foraging community.

---

### Core v1 Features
1. **Plant browser** — search and browse plants with identification tips, edibility notes, and safety warnings
2. **Personal journal** — log your finds with date, location, and notes; grows into your own field guide over time
3. **Community map** — drop pins on foraging spots; browse what others have found nearby (with seasonal filters)
4. **Plant quiz** — identify plants from descriptions or images pulled from your own log; turns passive logging into active learning
5. **"My Field Guide"** — a personal, growing collection of every plant you've encountered

---

### Suggested Tech Stack
- **Frontend:** Next.js deployed on Vercel
- **Database:** Supabase (user journals, map pins, quiz history)
- **Map:** Leaflet.js
- **Auth:** Supabase Auth (email or magic link)
- **Plant data:** hand-curated JSON to start; can expand later

---

### Scope Assessment
**YELLOW — Shippable with focus**

The plant browser and personal journal are very doable in the first ~10 hours. The community map introduces auth and database complexity but is manageable with Supabase. The quiz feature is a strong addition that can be scoped simply (multiple choice from your own log entries). If time gets tight, the community map can be simplified to a read-only view of pre-seeded spots.

---

### Competing Apps

| App | What Auxia has that they don't |
|---|---|
| PictureThis | Paywall after free uses, no foraging map, no personal journal |
| iNaturalist / Seek | General nature app — not foraging-specific, no spot-pinning, no seasonal filter |
| PlantNet | ID-only, no community, no journal, no safety/edibility focus |
| PlantSnap | SnapMap shows species globally, not user-curated local foraging spots |

**Our edge:** Bramble is the only app built specifically for foragers — combining a personal log, community spot map, a quiz to reinforce learning, and seasonal awareness in one free tool.

---

### Why This One
*In Noah's words:*

> I found this to be the most in alignment with my current interests. Foraging is something I genuinely care about, and I think this app could serve a real purpose — not just for people like me, but for general outdoors lovers and anyone who wants an excuse to go outside. There's also something I want to build into it that none of the other apps have: a quiz section where users have to identify plants based on descriptions or images from their own log. That turns the app from a simple diary into something that actually teaches you.
>
> The working name is Bramble — a wild, thorny plant that most people have actually foraged from without realizing it. It's short, rugged, and immediately brings nature to mind. The name is still subject to change, but the direction is community + nature + learning with a rugged feel.

---

### Ideas Considered but Not Chosen

**ClearView** *(Ideas 3 + 6 + 12)* — A news bias checker and multi-perspective daily digest. Strong idea with a real gap in the market (AllSides and Ground News both require subscriptions; neither has a paste-your-own-article bias highlighter). Rated GREEN for scope. Set aside because Bramble felt more personally meaningful.

**RiseUp** *(Ideas 2 + 9 + 14)* — A morning accountability app with a challenge gate (you prove you're awake before checking in) and a social friend feed. Genuinely unique mechanic that no competitor has. Rated YELLOW for scope. Set aside in favor of Bramble.

---

*Brainstorm session conducted May 14–15, 2026.*
