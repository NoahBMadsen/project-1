# Bramble — Application Flow Diagram

> **MAD-28** · Senior Project Presentation · Noah Madsen · May 2026
>
> This diagram covers every user flow in Bramble: authentication, bottom nav, the full
> scan-to-journal pipeline, and all data sources. Render `docs/app-flow.mmd` with
> `mmdc` for the poster-board PNG.

---

## Route Reference

| Route | Description | Auth Required |
|---|---|---|
| `/` | Landing page — hero, features, sign-in CTA | No |
| `/sign-in` | Google OAuth sign-in button | No |
| `/auth/callback` | Exchange OAuth code for session | No |
| `/auth/sign-out` | Clear session, redirect to landing | Yes |
| `/map` | Community map — default authenticated view | Yes |
| `/scan` | Live camera capture and plant identification | Yes |
| `/journal` | Personal foraging journal | Yes |
| `/plants` | Plant database search and browse | Yes |

---

## Full Application Flow

```mermaid
flowchart TD
    subgraph PUBLIC["🌐  Public Pages"]
        Landing["/ Landing Page\nHero · Features · Sign-in CTA"]
        SignIn["/sign-in\nSign In with Google"]
    end

    subgraph AUTH["🔐  Authentication"]
        Google["Google OAuth\nConsent Screen"]
        Callback["/auth/callback\nExchange code · Create session"]
        SignOut["/auth/sign-out\nClear session cookies"]
    end

    BottomNav(["  ← Bottom Navigation Bar →  \n Map · Scan · Journal · Plants"])

    subgraph APP["✅  Authenticated App"]
        Map["/map\n🗺  Community Map"]
        Scan["/scan\n📷  Plant Scanner"]
        Journal["/journal\n📔  My Journal"]
        Plants["/plants\n🌿  Plant Database"]
    end

    subgraph SCAN_FLOW["📷  Scan Flow"]
        Camera["Live camera stream\ngetUserMedia"]
        Capture["Capture photo\ncanvas.toBlob"]
        IdentifyAPI["/api/identify\nPOST image FormData"]
        DBCheck{"In plants\ntable?"}
        USDACheck{"In USDA\nCSV?"}
        InsertUSDA["Auto-insert plant\nUSDA: name · family · range\nsafety_notes = NULL"]
        InsertPN["Auto-insert plant\nPl@ntNet: name · family\nsafety_notes = NULL"]
        ResultCard["Result card\nSpecies · Confidence % · Family"]
        SafetyCheck{"Verified\nsafety data?"}
        Badges["Safety badges + notes\nEdible / Medicinal / Toxic"]
        Warning["⚠️  Not yet verified\n'Do not consume any plant\nyou cannot positively identify'"]
        JournalSave["/api/journal POST\nplantId · score · GPS · notes"]
        PinCheck{"Share to\ncommunity map?"}
        CreatePin["INSERT community_pin\nGPS point · species"]
    end

    subgraph DATA["💾  Data Sources"]
        PlantNet["Pl@ntNet API\nSpecies name · Confidence · Family\n500 req/day free tier"]
        USDACSV["USDA PLANTS CSV\ndata/usda-plants.csv\n~33,000 accepted species"]
        SupabaseDB["Supabase PostgreSQL\nplants · users\njournal_entries · community_pins"]
        GeoAPI["Browser Geolocation API\nlat / lng"]
    end

    %% ── Authentication flow ─────────────────────────────────────────────────
    Landing -->|"Sign In CTA"| SignIn
    SignIn -->|"Continue with Google"| Google
    Google -->|"OAuth redirect + code"| Callback
    Callback -->|"Session created → redirect"| Map
    SignOut -->|"Cookies cleared → redirect"| Landing

    %% ── Sign out from app header ────────────────────────────────────────────
    Map -->|"Header: Sign Out"| SignOut

    %% ── Bottom nav (undirected — each tab navigates to any other) ───────────
    Map --- BottomNav
    Scan --- BottomNav
    Journal --- BottomNav
    Plants --- BottomNav

    %% ── Map data flow ───────────────────────────────────────────────────────
    GeoAPI -->|"Center map + 25mi radius\nGET /api/pins"| Map
    SupabaseDB -->|"community_pins rows"| Map

    %% ── Journal data flow ───────────────────────────────────────────────────
    SupabaseDB -->|"GET /api/journal\nuser's entries"| Journal

    %% ── Plants data flow ────────────────────────────────────────────────────
    SupabaseDB -->|"GET /api/plants\nsearch + filter"| Plants

    %% ── Scan: capture and identify ──────────────────────────────────────────
    Scan --> Camera
    Camera --> Capture
    Capture -->|"POST image"| IdentifyAPI
    IdentifyAPI -->|"Forward image"| PlantNet
    PlantNet -->|"Name · score · family"| IdentifyAPI
    IdentifyAPI -->|"ILIKE lookup"| DBCheck

    %% ── DB miss → USDA lookup → auto-insert ────────────────────────────────
    DBCheck -->|"Found"| ResultCard
    DBCheck -->|"Not found"| USDACheck
    USDACSV --> USDACheck
    USDACheck -->|"Match"| InsertUSDA
    USDACheck -->|"No match"| InsertPN
    InsertUSDA -->|"INSERT"| SupabaseDB
    InsertPN -->|"INSERT"| SupabaseDB
    InsertUSDA --> ResultCard
    InsertPN --> ResultCard

    %% ── Safety data branch ──────────────────────────────────────────────────
    ResultCard --> SafetyCheck
    SafetyCheck -->|"edible / toxic / safety_notes set"| Badges
    SafetyCheck -->|"all NULL"| Warning

    %% ── Save to journal + community map ────────────────────────────────────
    Badges --> JournalSave
    Warning --> JournalSave
    GeoAPI -->|"GPS coordinates"| JournalSave
    JournalSave -->|"INSERT journal_entry"| SupabaseDB
    JournalSave --> PinCheck
    PinCheck -->|"Yes"| CreatePin
    PinCheck -->|"No"| Scan
    CreatePin -->|"INSERT community_pin"| SupabaseDB
    CreatePin -->|"Return to scanner"| Scan

    %% ── Colour coding ──────────────────────────────────────────────────────
    classDef publicStyle  fill:#f3f4f6,stroke:#9ca3af,color:#374151
    classDef authStyle    fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
    classDef appStyle     fill:#dcfce7,stroke:#22c55e,color:#14532d
    classDef externalStyle fill:#ffedd5,stroke:#f97316,color:#7c2d12
    classDef decisionStyle fill:#fef9c3,stroke:#ca8a04,color:#713f12
    classDef navStyle     fill:#f0fdf4,stroke:#86efac,color:#166534

    class Landing,SignIn publicStyle
    class Google,Callback,SignOut authStyle
    class Map,Scan,Journal,Plants,Camera,Capture,IdentifyAPI,ResultCard,Badges,Warning,JournalSave,InsertUSDA,InsertPN,CreatePin appStyle
    class PlantNet,USDACSV,SupabaseDB,GeoAPI externalStyle
    class DBCheck,USDACheck,SafetyCheck,PinCheck decisionStyle
    class BottomNav navStyle
```

---

## Data Enrichment Pipeline

```mermaid
flowchart TD
    subgraph T1["Tier 1 · Instant — On Every Scan"]
        S[User scans plant] --> PN[Pl@ntNet identifies species]
        PN --> DBC{"In our DB?"}
        DBC -->|Yes| RF["Return full record\nwith safety data"]
        DBC -->|No| UL[Search local USDA CSV]
        UL --> AI["Auto-insert into plants table\nname · family · range · invasive\nedible / toxic / safety = NULL"]
        AI --> RP["Return partial record\n+ 'Not yet verified' warning"]
    end

    subgraph T2["Tier 2 · Daily Batch — AI Agent"]
        DA[Scheduled AI agent] --> FN["SELECT * FROM plants\nWHERE edible IS NULL"]
        FN --> RS["LLM researches each species\nagainst botanical reference sources"]
        RS --> UD["UPDATE edible · toxic · medicinal\nsafety_notes · edibility_notes\nSET verified_by = 'ai-agent'"]
    end

    subgraph T3["Tier 3 · Future — Human Review"]
        RQ[Botanist review queue] --> VF["Confirm or correct AI flags\nSET verified_by = 'human'"]
    end

    T1 -.->|"New plants with NULL safety flags"| T2
    T2 -.->|"Uncertain or high-risk species"| T3
```

---

## Data Source Matrix

| Field | Pl@ntNet API | USDA CSV | Curated 30 Plants | AI Agent (future) |
|---|:---:|:---:|:---:|:---:|
| Scientific name | ✓ | ✓ | ✓ | — |
| Common name | ✓ | ✓ | ✓ | — |
| Family | ✓ | ✓ | ✓ | — |
| Confidence score | ✓ | — | — | — |
| Related photo | ✓ | — | — | — |
| Native range | — | ✓ | ✓ | — |
| Invasive flag | — | ✓ | ✓ | — |
| Edible flag | — | — | ✓ | ✓ |
| Medicinal flag | — | — | ✓ | ✓ |
| Toxic flag | — | — | ✓ | ✓ |
| Safety notes | — | — | ✓ | ✓ |
| Edibility notes | — | — | ✓ | ✓ |
