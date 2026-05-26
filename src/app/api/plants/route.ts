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

  const conditions: ReturnType<typeof sql>[] = [];

  if (query) {
    const searchPattern = `%${query}%`;
    conditions.push(
      sql`(common_name ILIKE ${searchPattern} OR scientific_name ILIKE ${searchPattern})`
    );
  }

  if (category === "edible") conditions.push(sql`edible = true`);
  if (category === "medicinal") conditions.push(sql`medicinal = true`);
  if (category === "toxic") conditions.push(sql`toxic = true`);
  if (category === "invasive") conditions.push(sql`invasive = true`);

  const whereClause =
    conditions.length > 0
      ? sql`WHERE ${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`
      : sql``;

  const rows = await sql`
    SELECT * FROM plants
    ${whereClause}
    ORDER BY common_name ASC
    LIMIT 100
  `;

  return NextResponse.json({ plants: rows });
}
