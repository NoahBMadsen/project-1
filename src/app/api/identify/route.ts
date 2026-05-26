import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

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
    const dbPlant = dbRows[0] ?? null;

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
