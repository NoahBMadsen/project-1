import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await sql`
    SELECT
      je.id, je.user_id, je.plant_id, je.species_name,
      je.confidence_score, je.notes, je.scanned_at,
      ST_Y(je.location::geometry) as latitude,
      ST_X(je.location::geometry) as longitude,
      p.common_name as plant_common_name, p.scientific_name as plant_scientific_name,
      p.edible, p.medicinal, p.toxic, p.invasive, p.safety_notes
    FROM journal_entries je
    LEFT JOIN plants p ON je.plant_id = p.id
    WHERE je.user_id = ${user.id}
    ORDER BY je.scanned_at DESC
  `;

  return NextResponse.json({ entries: rows });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure user record exists
  await sql`
    INSERT INTO users (id, email, display_name, avatar_url)
    VALUES (
      ${user.id},
      ${user.email ?? ""},
      ${user.user_metadata?.full_name ?? user.user_metadata?.name ?? null},
      ${user.user_metadata?.avatar_url ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      display_name = COALESCE(EXCLUDED.display_name, users.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      updated_at = NOW()
  `;

  const body = await request.json();
  const {
    plantId,
    speciesName,
    confidenceScore,
    latitude,
    longitude,
    notes,
    shareToMap,
  } = body;

  const locationValue =
    latitude != null && longitude != null
      ? `SRID=4326;POINT(${longitude} ${latitude})`
      : null;

  const entryRows = await sql`
    INSERT INTO journal_entries (user_id, plant_id, species_name, confidence_score, location, notes)
    VALUES (
      ${user.id},
      ${plantId ?? null},
      ${speciesName ?? null},
      ${confidenceScore ?? null},
      ${locationValue ? sql`ST_GeogFromText(${locationValue})` : null},
      ${notes ?? null}
    )
    RETURNING *
  `;

  const entry = entryRows[0];

  if (shareToMap && locationValue && entry) {
    await sql`
      INSERT INTO community_pins (user_id, journal_entry_id, plant_id, species_name, location)
      VALUES (
        ${user.id},
        ${entry.id},
        ${plantId ?? null},
        ${speciesName ?? null},
        ST_GeogFromText(${locationValue})
      )
    `;
  }

  return NextResponse.json({ entry });
}
