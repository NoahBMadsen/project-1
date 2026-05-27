import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sql } from "@/db";

const PLANT_COLS = sql`
  p.id, p.scientific_name, p.common_name, p.family,
  p.edible, p.medicinal, p.toxic, p.invasive,
  p.native_range, p.safety_notes, p.edibility_notes, p.image_url
`;

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
  const hasLocation = (lat !== 0 || lng !== 0) && !isNaN(lat) && !isNaN(lng);
  const isSearching = query.length > 0;
  const isCategoryFilter = category !== "all";

  try {
    let rows;

    if (isSearching || isCategoryFilter) {
      const conditions: ReturnType<typeof sql>[] = [];

      if (query) {
        const pattern = `%${query}%`;
        conditions.push(sql`(p.common_name ILIKE ${pattern} OR p.scientific_name ILIKE ${pattern})`);
      }
      if (category === "edible") conditions.push(sql`p.edible = true`);
      if (category === "medicinal") conditions.push(sql`p.medicinal = true`);
      if (category === "toxic") conditions.push(sql`p.toxic = true`);
      if (category === "invasive") conditions.push(sql`p.invasive = true`);

      const filter = conditions.reduce((a, b) => sql`${a} AND ${b}`);

      rows = await sql`
        SELECT ${PLANT_COLS}, false as spotted_nearby
        FROM plants p
        WHERE ${filter}
        ORDER BY p.common_name ASC
        LIMIT 100
      `;
    } else if (hasLocation) {
      const radiusMeters = radiusMiles * 1609.34;
      const point = `SRID=4326;POINT(${lng} ${lat})`;

      const spotted = await sql`
        SELECT ${PLANT_COLS}, true as spotted_nearby
        FROM plants p
        WHERE p.id IN (
          SELECT DISTINCT plant_id FROM community_pins
          WHERE plant_id IS NOT NULL
            AND ST_DWithin(location, ST_GeogFromText(${point}), ${radiusMeters})
        )
        ORDER BY p.common_name ASC
      `;

      const spottedIds = spotted.map((r: Record<string, string>) => r.id);
      const excludeClause = spottedIds.length > 0
        ? sql`AND p.id NOT IN ${sql(spottedIds)}`
        : sql``;

      const curated = await sql`
        SELECT ${PLANT_COLS}, false as spotted_nearby
        FROM plants p
        WHERE (p.safety_notes IS NOT NULL OR p.edibility_notes IS NOT NULL
               OR p.edible = true OR p.medicinal = true OR p.toxic = true)
          ${excludeClause}
        ORDER BY p.common_name ASC
        LIMIT ${100 - spotted.length}
      `;

      rows = [...spotted, ...curated];
    } else {
      rows = await sql`
        SELECT ${PLANT_COLS}, false as spotted_nearby
        FROM plants p
        ORDER BY
          CASE WHEN p.safety_notes IS NOT NULL OR p.edibility_notes IS NOT NULL THEN 0 ELSE 1 END,
          p.common_name ASC
        LIMIT 100
      `;
    }

    return NextResponse.json({ plants: rows });
  } catch (err) {
    console.error("Plants query error:", err);
    return NextResponse.json({ plants: [], error: String(err) }, { status: 500 });
  }
}
