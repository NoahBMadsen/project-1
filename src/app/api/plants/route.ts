import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";
  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lng = parseFloat(searchParams.get("lng") ?? "0");
  const radiusMiles = parseFloat(searchParams.get("radius") ?? "25");
  const radiusMeters = radiusMiles * 1609.34;
  const hasLocation = lat !== 0 || lng !== 0;

  const conditions: ReturnType<typeof sql>[] = [];

  if (query) {
    const searchPattern = `%${query}%`;
    conditions.push(
      sql`(p.common_name ILIKE ${searchPattern} OR p.scientific_name ILIKE ${searchPattern})`
    );
  }

  if (category === "edible") conditions.push(sql`p.edible = true`);
  if (category === "medicinal") conditions.push(sql`p.medicinal = true`);
  if (category === "toxic") conditions.push(sql`p.toxic = true`);
  if (category === "invasive") conditions.push(sql`p.invasive = true`);

  const whereClause =
    conditions.length > 0
      ? sql`WHERE ${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`
      : sql``;

  let rows;

  if (hasLocation) {
    rows = await sql`
      SELECT DISTINCT ON (p.common_name, p.id)
        p.id, p.scientific_name, p.common_name, p.family,
        p.edible, p.medicinal, p.toxic, p.invasive,
        p.native_range, p.safety_notes, p.edibility_notes, p.image_url
      FROM plants p
      INNER JOIN community_pins cp ON cp.plant_id = p.id
      ${whereClause}
        ${conditions.length > 0 ? sql`AND` : sql`WHERE`}
        ST_DWithin(
          cp.location,
          ST_GeogFromText(${`SRID=4326;POINT(${lng} ${lat})`}),
          ${radiusMeters}
        )
      ORDER BY p.common_name ASC, p.id
      LIMIT 100
    `;
  } else {
    rows = await sql`
      SELECT p.id, p.scientific_name, p.common_name, p.family,
        p.edible, p.medicinal, p.toxic, p.invasive,
        p.native_range, p.safety_notes, p.edibility_notes, p.image_url
      FROM plants p
      ${whereClause}
      ORDER BY p.common_name ASC
      LIMIT 100
    `;
  }

  return NextResponse.json({ plants: rows });
}
