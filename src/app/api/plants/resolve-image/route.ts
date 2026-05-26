import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function fetchWikipediaImage(scientificName: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(scientificName)}`,
      { headers: { "User-Agent": "BrambleApp/1.0 (bramblemap.com)" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source ?? data.originalimage?.source ?? null;
  } catch {
    return null;
  }
}

async function fetchPlantNetImage(scientificName: string): Promise<string | null> {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://my-api.plantnet.org/v2/species?lang=en&api-key=${apiKey}&q=${encodeURIComponent(scientificName)}&nb-results=1`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const firstImage = data?.[0]?.images?.[0]?.url?.m ?? data?.[0]?.images?.[0]?.url?.s ?? null;
    return firstImage;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, scientific_name } = body as { id: string; scientific_name: string };

  if (!id || !scientific_name) {
    return NextResponse.json({ error: "Missing id or scientific_name" }, { status: 400 });
  }

  const existing = await sql`SELECT image_url FROM plants WHERE id = ${id}`;
  if (existing[0]?.image_url) {
    return NextResponse.json({ image_url: existing[0].image_url });
  }

  let imageUrl = await fetchWikipediaImage(scientific_name);

  if (!imageUrl) {
    const parts = scientific_name.split(" ");
    if (parts.length >= 2) {
      imageUrl = await fetchWikipediaImage(parts.slice(0, 2).join(" "));
    }
  }

  if (!imageUrl) {
    imageUrl = await fetchPlantNetImage(scientific_name);
  }

  if (imageUrl) {
    await sql`UPDATE plants SET image_url = ${imageUrl}, updated_at = NOW() WHERE id = ${id}`;
  }

  return NextResponse.json({ image_url: imageUrl });
}
