import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

// Community pins are only visible to authenticated users
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lng = parseFloat(searchParams.get("lng") ?? "0");
  const radiusMiles = parseFloat(searchParams.get("radius") ?? "25");
  const radiusMeters = radiusMiles * 1609.34;

  if (lat === 0 && lng === 0 || isNaN(lat) || isNaN(lng) || isNaN(radiusMeters)) {
    return NextResponse.json({ pins: [] });
  }

  try {
    const point = `SRID=4326;POINT(${lng} ${lat})`;
    const rows = await sql`
      SELECT
        cp.id,
        cp.species_name,
        cp.pinned_at,
        ST_Y(cp.location::geometry) as latitude,
        ST_X(cp.location::geometry) as longitude,
        p.common_name,
        p.scientific_name,
        p.edible,
        p.medicinal,
        p.toxic,
        p.invasive,
        p.safety_notes,
        p.image_url,
        u.display_name as user_display_name
      FROM community_pins cp
      LEFT JOIN plants p ON cp.plant_id = p.id
      LEFT JOIN users u ON cp.user_id = u.id
      WHERE ST_DWithin(
        cp.location,
        ST_GeogFromText(${point}),
        ${radiusMeters}
      )
      ORDER BY cp.pinned_at DESC
      LIMIT 200
    `;

    return NextResponse.json({ pins: rows });
  } catch (err) {
    console.error("Pins query error:", err);
    return NextResponse.json({ pins: [] });
  }
}
