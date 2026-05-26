# Bramble - Trifold Poster Board Draft

Standard trifold foam core: 3 panels (left, center, right)

---

## LEFT PANEL: The Experience

### Header
**Shadowing a Professional Software Engineer**
Noah B. Madsen - Senior Project, 2026

### What I Did
I spent up to 50 hours shadowing Timothy L. Long, a professional software engineer and owner of Longitudinal Intelligence Technologies, a software company based in Sheridan, WY. Over the course of May 13-26, I observed and participated in real-world software development practices.

### What I Observed and Learned

**The Software Development Lifecycle**
How professional software moves from idea to architecture to code to deployment. Not just writing code - planning, designing, and making decisions before a single line gets written.

**System Design and Architecture**
Choosing the right tools for the job. Why we picked Supabase over Firebase, Drizzle over Prisma, PostGIS for geospatial queries. Every decision has trade-offs.

**Professional Development Tools**
- Git and GitHub for version control and collaboration
- Linear for project management and issue tracking
- Vercel for deployment and hosting
- Supabase for database and authentication
- Cursor IDE for AI-assisted development

**Remote-First Team Collaboration**
Working across time zones, asynchronous communication, pair programming, code review. How engineers ask for help - and why that's a skill, not a weakness.

**Stakeholder Communication**
Observing how a software company owner communicates with clients - scoping work, setting expectations, explaining technical decisions in non-technical language.

**The Business Side**
What it looks like to own and operate a software company. The intersection of engineering, business development, and client management.

### The Biggest Lesson
"I learned that asking for help is engineering, not weakness. Senior engineers pair-program with junior engineers every day. Getting stuck and knowing when to reach out is a core professional skill."

---

## CENTER PANEL: The Application

### Header
**Bramble**
A Community Foraging App
bramblemap.com

[QR CODE to bramblemap.com]

### The Problem
There's no free, purpose-built app for foragers. Existing plant ID apps like PictureThis charge after a few uses. iNaturalist is great for general nature but has no foraging focus, no personal journal, no community map of local finds.

### The Solution
Bramble lets you identify wild plants with AI, keep a personal foraging journal, and share your finds on a community map. Point your camera at a plant, get species info and safety data, and log it automatically.

### How It Works
1. Scan - Point your camera at a plant and snap a photo
2. Identify - AI matches it against thousands of species
3. Learn & Share - Get safety info, save to your journal, pin it on the map

### Screenshots
[Landing page screenshot]
[Sign-in page screenshot]
[Supabase dashboard showing tables]

---

## RIGHT PANEL: The Technical Foundation

### Architecture
[Architecture diagram or data flow diagram]

**Frontend:** Next.js 16 (React) on Vercel
**Styling:** Tailwind CSS + shadcn/ui
**Database:** Supabase (PostgreSQL + PostGIS)
**ORM:** Drizzle ORM
**Auth:** Google OAuth via Supabase Auth
**Plant ID:** Pl@ntNet API (500 IDs/day free tier)
**Hosting:** Vercel at bramblemap.com

### Database Schema
5 tables designed with PostGIS geospatial support:
- plants - USDA species data (edibility, safety, invasive flags)
- users - profile data linked to Google auth
- journal_entries - auto-created scan logs with GPS coordinates
- community_pins - shared finds on the public map
- field_guide_entries - community-contributed novel species

[Screenshot of schema code or Supabase table editor]

### What's Built vs. What's Next

**Completed (Foundation)**
- Project scaffold with Next.js, Tailwind, shadcn/ui
- Full database schema with 5 PostGIS-aware tables
- Supabase project with PostGIS extension
- Google OAuth sign-in flow
- Database migrations run and verified
- Deployed to Vercel at bramblemap.com
- Landing page with product vision and roadmap

**Roadmap (Next Phase)**
- Pl@ntNet API integration for plant scanning
- USDA data seeding for plant database
- Community map with Leaflet.js
- Personal foraging journal
- Plant quiz for learning

### GitHub Activity
[Screenshot of commit history or GitHub insights]

---

## FOOTER (across all 3 panels)
Bramble - bramblemap.com - Senior Shadow Program - May 2026
Supervised by Timothy L. Long, Longitudinal Intelligence Technologies
