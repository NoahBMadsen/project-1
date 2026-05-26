import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PLANTNET_URL = "https://my-api.plantnet.org/v2/identify/all";

interface PlantNetResult {
  score: number;
  species: {
    scientificNameWithoutAuthor: string;
    commonNames: string[];
    family: { scientificNameWithoutAuthor: string };
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PLANTNET_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let imageFile: File | null = null;
  try {
    const form = await request.formData();
    imageFile = form.get("image") as File | null;
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  if (!imageFile || imageFile.size === 0) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  // Forward image to Pl@ntNet
  const plantnetForm = new FormData();
  plantnetForm.append("images", imageFile);
  plantnetForm.append("organs", "auto");

  let plantnetRes: Response;
  try {
    plantnetRes = await fetch(
      `${PLANTNET_URL}?api-key=${apiKey}&lang=en&nb-results=5`,
      { method: "POST", body: plantnetForm }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach Pl@ntNet API.", detail: String(err) },
      { status: 502 }
    );
  }

  if (!plantnetRes.ok) {
    const detail = await plantnetRes.text();
    return NextResponse.json(
      { error: `Pl@ntNet returned ${plantnetRes.status}.`, detail },
      { status: 502 }
    );
  }

  const plantnetData = await plantnetRes.json();
  const results: PlantNetResult[] = plantnetData.results ?? [];
  const top = results[0];

  if (!top) {
    return NextResponse.json(
      { error: "Pl@ntNet could not identify any plant in this image." },
      { status: 422 }
    );
  }

  const scientificName = top.species.scientificNameWithoutAuthor;
  const confidence = top.score;
  const commonNamesFromApi = top.species.commonNames ?? [];

  // Look up plant record in Supabase by scientific name
  const supabase = await createClient();
  const { data: plant } = await supabase
    .from("plants")
    .select(
      "id, scientific_name, common_name, edible, medicinal, toxic, invasive, safety_notes, edibility_notes, image_url"
    )
    .ilike("scientific_name", scientificName)
    .maybeSingle();

  return NextResponse.json({
    scientificName,
    commonName: plant?.common_name ?? commonNamesFromApi[0] ?? null,
    confidence,
    plant: plant ?? null,
    alternatives: results.slice(1, 4).map((r) => ({
      scientificName: r.species.scientificNameWithoutAuthor,
      commonName: r.species.commonNames[0] ?? null,
      confidence: r.score,
    })),
  });
}
