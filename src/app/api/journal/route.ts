import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sql } from "@/db";

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
      je.id, je.user_id, je.plant_id, je.species_name, je.photo_url,
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
    shareNotes,
    photoData,
  } = body;

  let photoUrl: string | null = null;
  if (photoData && typeof photoData === "string" && photoData.startsWith("data:")) {
    try {
      const base64 = photoData.split(",")[1];
      const buffer = Buffer.from(base64, "base64");
      const filename = `${user.id}/${Date.now()}.jpg`;
      const { data: upload } = await supabase.storage
        .from("user-photos")
        .upload(filename, buffer, { contentType: "image/jpeg", upsert: false });
      if (upload?.path) {
        const { data: urlData } = supabase.storage.from("user-photos").getPublicUrl(upload.path);
        photoUrl = urlData?.publicUrl ?? null;
      }
    } catch {
      // Photo upload failed - continue without it
    }
  }

  const locationValue =
    latitude != null && longitude != null
      ? `SRID=4326;POINT(${longitude} ${latitude})`
      : null;

  const entryRows = await sql`
    INSERT INTO journal_entries (user_id, plant_id, species_name, confidence_score, location, notes, photo_url)
    VALUES (
      ${user.id},
      ${plantId ?? null},
      ${speciesName ?? null},
      ${confidenceScore ?? null},
      ${locationValue ? sql`ST_GeogFromText(${locationValue})` : null},
      ${notes ?? null},
      ${photoUrl}
    )
    RETURNING *
  `;

  const entry = entryRows[0];

  if (locationValue && entry) {
    await sql`
      INSERT INTO community_pins (user_id, journal_entry_id, plant_id, species_name, location, shared_notes)
      VALUES (
        ${user.id},
        ${entry.id},
        ${plantId ?? null},
        ${speciesName ?? null},
        ST_GeogFromText(${locationValue}),
        ${shareNotes && notes ? notes : null}
      )
    `;
  }

  return NextResponse.json({ entry });
}
