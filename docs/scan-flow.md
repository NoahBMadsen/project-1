# Bramble - Plant Scan Flow

This diagram shows the complete flow when a user scans a plant, from camera capture through identification, database lookup, and journal/map storage.

## Scan Identification Flow

```mermaid
sequenceDiagram
    participant User
    participant ScanPage as /scan page
    participant API as /api/identify
    participant PlantNet as Pl@ntNet API
    participant DB as Supabase DB
    participant USDA as Local USDA CSV

    User->>ScanPage: Opens camera, takes photo
    ScanPage->>API: POST image as FormData
    API->>PlantNet: Forward image for identification
    PlantNet-->>API: Species name, confidence score, family
    API->>DB: Look up scientific name in plants table
    alt Plant exists in DB
        DB-->>API: Full plant record (safety notes, edibility, flags)
    else Plant NOT in DB
        API->>USDA: Search local CSV by scientific name
        alt Found in USDA
            USDA-->>API: Name, family, range, invasive flag
            API->>DB: INSERT new plant (safety fields = NULL)
        else Not in USDA either
            API->>DB: INSERT with Pl@ntNet data only (name, family)
        end
        DB-->>API: New plant record (partial data)
    end
    API-->>ScanPage: Combined result (identification + plant data)
    ScanPage-->>User: Shows species, confidence %, badges, safety info
    Note over ScanPage: NULL safety flags show "Not yet verified" warning
```

## Save to Journal and Map

```mermaid
sequenceDiagram
    participant User
    participant ScanPage as /scan page
    participant JournalAPI as /api/journal
    participant DB as Supabase DB

    User->>ScanPage: Adds notes, toggles "share to map"
    User->>ScanPage: Taps "Save to Journal"
    ScanPage->>JournalAPI: POST (plantId, speciesName, score, lat/lng, notes, shareToMap)
    JournalAPI->>DB: Ensure user record exists (upsert)
    JournalAPI->>DB: INSERT journal_entry with GPS location
    alt User chose "share to map"
        JournalAPI->>DB: INSERT community_pin with GPS location
    end
    DB-->>JournalAPI: Entry + pin created
    JournalAPI-->>ScanPage: Success
    ScanPage-->>User: "Saved to journal! Pinned on map."
```

## Data Enrichment Pipeline

```mermaid
flowchart TD
    subgraph tier1 [Tier 1: Instant - On Every Scan]
        Scan[User scans plant] --> PlantNet[Pl@ntNet identifies species]
        PlantNet --> DBCheck{In our DB?}
        DBCheck -->|Yes| ReturnFull[Return full record with safety data]
        DBCheck -->|No| USDALookup[Search local USDA CSV]
        USDALookup --> AutoInsert["Auto-insert into DB\nname, family, range, invasive\nEdible/toxic/safety = NULL"]
        AutoInsert --> ReturnPartial["Return partial record\n+ 'Not yet verified' warning"]
    end

    subgraph tier2 [Tier 2: Daily Batch - AI Agent]
        DailyAgent[Scheduled AI agent] --> FindNulls["Query plants WHERE edible IS NULL"]
        FindNulls --> Research["LLM researches each species\nagainst botanical reference sources"]
        Research --> UpdateDB["UPDATE edible, toxic, medicinal,\nsafety_notes, edibility_notes\nSET verified_by = 'ai-agent'"]
    end

    subgraph tier3 [Tier 3: Future - Human Review]
        ReviewQueue[Botanist review queue] --> VerifyFlags["Confirm or correct AI flags\nSET verified_by = 'human'"]
    end

    tier1 -.->|"New plants with NULL safety flags"| tier2
    tier2 -.->|"Uncertain or high-risk species"| tier3
```

## Data Source Matrix

| Field | Pl@ntNet API | USDA CSV | Curated Seed | Future: AI Agent |
|---|---|---|---|---|
| Scientific name | Yes | Yes | Yes | - |
| Common name | Yes | Yes | Yes | - |
| Family | Yes | Yes | Yes | - |
| Confidence score | Yes | - | - | - |
| Related photo | Yes | - | - | - |
| Native range | - | Yes | Yes | - |
| Invasive flag | - | Yes | Yes | - |
| Edible flag | - | - | Yes | Yes |
| Medicinal flag | - | - | Yes | Yes |
| Toxic flag | - | - | Yes | Yes |
| Safety notes | - | - | Yes | Yes |
| Edibility notes | - | - | Yes | Yes |
