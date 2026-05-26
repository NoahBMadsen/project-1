import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

interface USDAEntry {
  scientific_name: string;
  common_name: string | null;
  family: string | null;
}

let usdaCache: Map<string, USDAEntry> | null = null;

function getUSDALookup(): Map<string, USDAEntry> {
  if (usdaCache) return usdaCache;

  usdaCache = new Map();
  const csvPath = path.join(process.cwd(), "data", "usda-plants.csv");
  if (!fs.existsSync(csvPath)) return usdaCache;

  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n");

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols: string[] = [];
    let inQuote = false;
    let current = "";
    for (const ch of line) {
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        cols.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    cols.push(current);

    if (cols.length < 5) continue;
    if (cols[1].trim() !== "") continue;

    const fullName = cols[2].trim();
    const stripped = fullName.replace(/\s*\([^)]*\)/g, "").trim();
    const parts = stripped.split(/\s+/);
    if (parts.length < 2) continue;

    const rankMarkers = new Set(["var.", "subsp.", "ssp.", "f.", "subf.", "cv."]);
    const result: string[] = [parts[0]];
    for (let j = 1; j < parts.length; j++) {
      const word = parts[j];
      if (word.length > 0 && (word[0] === word[0].toLowerCase() || rankMarkers.has(word))) {
        result.push(word);
      } else {
        break;
      }
    }
    if (result.length < 2) continue;

    const sciName = result.join(" ");
    if (!usdaCache.has(sciName.toLowerCase())) {
      usdaCache.set(sciName.toLowerCase(), {
        scientific_name: sciName,
        common_name: cols[3].trim() || null,
        family: cols[4].trim() || null,
      });
    }
  }

  return usdaCache;
}

let invasiveCache: Set<string> | null = null;

function getInvasiveLookup(): Set<string> {
  if (invasiveCache) return invasiveCache;

  invasiveCache = new Set();
  const tsvPath = path.join(process.cwd(), "data", "usgs-invasive.tsv");
  if (!fs.existsSync(tsvPath)) return invasiveCache;

  const raw = fs.readFileSync(tsvPath, "utf-8");
  const lines = raw.split("\n");

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const [name, flag] = line.split("\t");
    if (flag === "true" && name) {
      invasiveCache.add(name.toLowerCase());
    }
  }

  return invasiveCache;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY;
  if (!PLANTNET_API_KEY) {
    return NextResponse.json(
      { error: "Pl@ntNet API key not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const plantnetForm = new FormData();
    plantnetForm.append("images", image);
    plantnetForm.append("organs", "auto");

    const plantnetRes = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?include-related-images=true&nb-results=3&lang=en&api-key=${PLANTNET_API_KEY}`,
      { method: "POST", body: plantnetForm }
    );

    if (!plantnetRes.ok) {
      const errText = await plantnetRes.text();
      console.error("Pl@ntNet error:", plantnetRes.status, errText);
      return NextResponse.json(
        {
          error:
            plantnetRes.status === 404
              ? "Could not identify this plant. Try a clearer photo."
              : "Plant identification service error",
        },
        { status: plantnetRes.status === 404 ? 404 : 502 }
      );
    }

    const plantnetData = await plantnetRes.json();
    const topResult = plantnetData.results?.[0];

    if (!topResult) {
      return NextResponse.json(
        { error: "No identification results" },
        { status: 404 }
      );
    }

    const scientificName =
      topResult.species?.scientificNameWithoutAuthor ?? "";
    const commonNames: string[] = topResult.species?.commonNames ?? [];
    const family =
      topResult.species?.family?.scientificNameWithoutAuthor ?? "";
    const score: number = topResult.score ?? 0;

    const relatedImage =
      topResult.images?.[0]?.url?.m ?? topResult.images?.[0]?.url?.s ?? null;

    const dbRows = await sql`
      SELECT * FROM plants
      WHERE scientific_name ILIKE ${scientificName}
      LIMIT 1
    `;
    let dbPlant = dbRows[0] ?? null;

    if (!dbPlant && scientificName) {
      const usda = getUSDALookup();
      const usdaMatch = usda.get(scientificName.toLowerCase());
      const invasiveSet = getInvasiveLookup();
      const isInvasive = invasiveSet.has(scientificName.toLowerCase());

      const newName = usdaMatch?.scientific_name ?? scientificName;
      const newCommon = usdaMatch?.common_name ?? commonNames[0] ?? null;
      const newFamily = usdaMatch?.family ?? (family || null);

      const inserted = await sql`
        INSERT INTO plants (scientific_name, common_name, family, invasive, image_url)
        VALUES (${newName}, ${newCommon}, ${newFamily}, ${isInvasive}, ${relatedImage})
        ON CONFLICT (scientific_name) DO NOTHING
        RETURNING *
      `;

      if (inserted[0]) {
        dbPlant = inserted[0];
      } else {
        const refetch = await sql`
          SELECT * FROM plants
          WHERE scientific_name ILIKE ${scientificName}
          LIMIT 1
        `;
        dbPlant = refetch[0] ?? null;
      }
    }

    if (dbPlant && relatedImage && !dbPlant.image_url) {
      await sql`
        UPDATE plants SET image_url = ${relatedImage}, updated_at = NOW()
        WHERE id = ${dbPlant.id}
      `;
      dbPlant.image_url = relatedImage;
    }

    return NextResponse.json({
      identification: {
        scientificName,
        commonNames,
        family,
        score,
        relatedImage,
      },
      plant: dbPlant,
      allResults: plantnetData.results.slice(0, 3).map(
        (r: {
          score: number;
          species: {
            scientificNameWithoutAuthor: string;
            commonNames: string[];
          };
        }) => ({
          score: r.score,
          scientificName: r.species?.scientificNameWithoutAuthor,
          commonNames: r.species?.commonNames,
        })
      ),
    });
  } catch (err) {
    console.error("Identify error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
