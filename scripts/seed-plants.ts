import "dotenv/config";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

interface PlantSeed {
  scientific_name: string;
  common_name: string;
  family: string;
  edible: boolean;
  medicinal: boolean;
  toxic: boolean;
  invasive: boolean;
  native_range: string;
  safety_notes: string;
  edibility_notes: string;
}

const plants: PlantSeed[] = [
  {
    scientific_name: "Taraxacum officinale",
    common_name: "Dandelion",
    family: "Asteraceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Europe, Asia; naturalized across North America",
    safety_notes: "Safe to eat. Avoid areas sprayed with herbicides.",
    edibility_notes:
      "Young leaves in salads, roots roasted as coffee substitute, flowers for wine or fritters.",
  },
  {
    scientific_name: "Urtica dioica",
    common_name: "Stinging Nettle",
    family: "Urticaceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Europe, Asia, North Africa, North America",
    safety_notes:
      "Wear gloves when harvesting. Cooking or drying neutralizes the sting.",
    edibility_notes:
      "Blanch or steam young leaves. Rich in iron, calcium, and vitamins A and C.",
  },
  {
    scientific_name: "Sambucus nigra",
    common_name: "Elderberry",
    family: "Adoxaceae",
    edible: true,
    medicinal: true,
    toxic: true,
    invasive: false,
    native_range: "Europe, North America",
    safety_notes:
      "Raw berries, bark, and leaves contain cyanogenic glycosides. Always cook berries before eating.",
    edibility_notes:
      "Cooked berries for syrup, jam, and wine. Flowers for elderflower cordial and fritters.",
  },
  {
    scientific_name: "Allium tricoccum",
    common_name: "Ramps (Wild Leek)",
    family: "Amaryllidaceae",
    edible: true,
    medicinal: false,
    toxic: false,
    invasive: false,
    native_range: "Eastern North America",
    safety_notes:
      "Positively identify before eating. Can be confused with lily of the valley (toxic).",
    edibility_notes:
      "Leaves, stems, and bulbs all edible. Strong garlic-onion flavor. Sauté, pickle, or use fresh.",
  },
  {
    scientific_name: "Morchella esculenta",
    common_name: "Morel Mushroom",
    family: "Morchellaceae",
    edible: true,
    medicinal: false,
    toxic: false,
    invasive: false,
    native_range: "North America, Europe, Asia",
    safety_notes:
      "Never eat raw. False morels (Gyromitra) are toxic - learn the difference. True morels have a hollow interior.",
    edibility_notes:
      "Sauté in butter. One of the most prized wild edibles. Season: spring.",
  },
  {
    scientific_name: "Rubus allegheniensis",
    common_name: "Blackberry",
    family: "Rosaceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: true,
    native_range: "Eastern North America",
    safety_notes: "Watch for thorns. Berries are safe when ripe (dark black).",
    edibility_notes:
      "Eat fresh, bake into pies, make jam. Leaves can be dried for tea.",
  },
  {
    scientific_name: "Plantago major",
    common_name: "Broadleaf Plantain",
    family: "Plantaginaceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Europe; naturalized worldwide",
    safety_notes: "Safe. One of the most common yard weeds.",
    edibility_notes:
      "Young leaves in salads or cooked like spinach. Seeds are edible. Leaves used as a poultice for stings.",
  },
  {
    scientific_name: "Toxicodendron radicans",
    common_name: "Poison Ivy",
    family: "Anacardiaceae",
    edible: false,
    medicinal: false,
    toxic: true,
    invasive: true,
    native_range: "Eastern North America",
    safety_notes:
      "Do NOT touch. Urushiol oil causes severe skin rash. 'Leaves of three, let it be.'",
    edibility_notes: "Not edible. Toxic at all growth stages.",
  },
  {
    scientific_name: "Conium maculatum",
    common_name: "Poison Hemlock",
    family: "Apiaceae",
    edible: false,
    medicinal: false,
    toxic: true,
    invasive: true,
    native_range: "Europe, North Africa; invasive in North America",
    safety_notes:
      "Extremely poisonous. All parts of the plant are deadly. Resembles wild carrot - do not confuse.",
    edibility_notes: "Fatal if ingested. Do not consume any part of this plant.",
  },
  {
    scientific_name: "Achillea millefolium",
    common_name: "Yarrow",
    family: "Asteraceae",
    edible: false,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Northern Hemisphere temperate regions",
    safety_notes:
      "Generally safe in small amounts. Avoid during pregnancy. Can cause skin sensitivity in some people.",
    edibility_notes:
      "Not typically eaten. Used as herbal tea and traditional wound treatment.",
  },
  {
    scientific_name: "Rosa canina",
    common_name: "Dog Rose (Wild Rose)",
    family: "Rosaceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Europe, Northwest Africa, Western Asia",
    safety_notes: "Remove seeds and hairs from rose hips before eating.",
    edibility_notes:
      "Rose hips are very high in vitamin C. Make into tea, jam, or syrup. Petals are edible in salads.",
  },
  {
    scientific_name: "Typha latifolia",
    common_name: "Cattail",
    family: "Typhaceae",
    edible: true,
    medicinal: false,
    toxic: false,
    invasive: false,
    native_range: "North America, Europe, Asia",
    safety_notes:
      "Harvest from clean water sources only. Do not confuse with iris (toxic).",
    edibility_notes:
      "Young shoots raw or cooked, pollen as flour, rhizomes roasted or boiled. Almost every part is edible.",
  },
  {
    scientific_name: "Chenopodium album",
    common_name: "Lamb's Quarters",
    family: "Amaranthaceae",
    edible: true,
    medicinal: false,
    toxic: false,
    invasive: false,
    native_range: "Europe; naturalized globally",
    safety_notes:
      "Contains oxalates - eat in moderation if prone to kidney stones.",
    edibility_notes:
      "Cook like spinach. Young leaves are best. Very nutritious - more iron and protein than spinach.",
  },
  {
    scientific_name: "Cichorium intybus",
    common_name: "Chicory",
    family: "Asteraceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Europe; naturalized in North America",
    safety_notes: "Safe. The blue flowers are unmistakable along roadsides.",
    edibility_notes:
      "Young leaves in salads (bitter). Roots roasted as a coffee substitute. Flowers are edible.",
  },
  {
    scientific_name: "Amanita phalloides",
    common_name: "Death Cap Mushroom",
    family: "Amanitaceae",
    edible: false,
    medicinal: false,
    toxic: true,
    invasive: true,
    native_range: "Europe; invasive in North America, Australia",
    safety_notes:
      "One of the deadliest organisms on earth. A single cap can kill an adult. No antidote.",
    edibility_notes:
      "FATAL. Responsible for the majority of mushroom poisoning deaths worldwide.",
  },
  {
    scientific_name: "Trifolium pratense",
    common_name: "Red Clover",
    family: "Fabaceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Europe, Western Asia; naturalized in North America",
    safety_notes: "Safe in normal food amounts. Avoid large medicinal doses during pregnancy.",
    edibility_notes:
      "Flower heads for tea or dried and ground into flour. Young leaves in salads.",
  },
  {
    scientific_name: "Claytonia perfoliata",
    common_name: "Miner's Lettuce",
    family: "Montiaceae",
    edible: true,
    medicinal: false,
    toxic: false,
    invasive: false,
    native_range: "Western North America",
    safety_notes: "Safe. One of the mildest and most pleasant wild greens.",
    edibility_notes:
      "Eat leaves and stems raw in salads. Mild, slightly sweet flavor. Rich in vitamin C.",
  },
  {
    scientific_name: "Daucus carota",
    common_name: "Queen Anne's Lace (Wild Carrot)",
    family: "Apiaceae",
    edible: true,
    medicinal: false,
    toxic: false,
    invasive: true,
    native_range: "Europe, Southwest Asia; naturalized in North America",
    safety_notes:
      "CAUTION: Easily confused with poison hemlock and water hemlock (both deadly). Only harvest if 100% certain of ID.",
    edibility_notes:
      "First-year roots are edible but tough. Seeds used as seasoning. Not recommended for beginners.",
  },
  {
    scientific_name: "Arctium lappa",
    common_name: "Burdock",
    family: "Asteraceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: true,
    native_range: "Europe, Asia; naturalized in North America",
    safety_notes: "Safe. Can be confused with cocklebur (toxic) - learn the difference.",
    edibility_notes:
      "First-year roots peeled and cooked (gobo in Japanese cuisine). Young leaf stalks peeled and eaten.",
  },
  {
    scientific_name: "Gaultheria procumbens",
    common_name: "Wintergreen",
    family: "Ericaceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Eastern North America",
    safety_notes:
      "Safe in food amounts. Wintergreen oil is concentrated - do not ingest the essential oil.",
    edibility_notes:
      "Leaves chewed fresh or brewed as tea. Berries edible with a minty flavor.",
  },
  {
    scientific_name: "Phytolacca americana",
    common_name: "Pokeweed",
    family: "Phytolaccaceae",
    edible: true,
    medicinal: true,
    toxic: true,
    invasive: false,
    native_range: "Eastern North America",
    safety_notes:
      "Roots, mature stems, and berries are TOXIC. Only very young shoots are edible and must be boiled twice with water changes.",
    edibility_notes:
      "Young spring shoots under 6 inches only. Boil in two changes of water. Traditional Appalachian green ('poke sallet').",
  },
  {
    scientific_name: "Matricaria chamomilla",
    common_name: "Chamomile",
    family: "Asteraceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Europe, Western Asia",
    safety_notes: "Safe. Avoid if allergic to ragweed family.",
    edibility_notes: "Flower heads dried for tea. Mild apple-like flavor.",
  },
  {
    scientific_name: "Stellaria media",
    common_name: "Chickweed",
    family: "Caryophyllaceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Europe; naturalized worldwide",
    safety_notes: "Safe. Very common lawn weed.",
    edibility_notes:
      "Mild flavor, eat raw in salads or lightly cooked. High in vitamins C and A.",
  },
  {
    scientific_name: "Heracleum mantegazzianum",
    common_name: "Giant Hogweed",
    family: "Apiaceae",
    edible: false,
    medicinal: false,
    toxic: true,
    invasive: true,
    native_range: "Caucasus region; invasive in North America and Europe",
    safety_notes:
      "EXTREMELY DANGEROUS. Sap causes severe burns and permanent scarring when skin is exposed to sunlight. Report sightings to local authorities.",
    edibility_notes: "Not edible. Do not touch any part of this plant.",
  },
  {
    scientific_name: "Vaccinium myrtillus",
    common_name: "Bilberry (Wild Blueberry)",
    family: "Ericaceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Europe, Northern Asia",
    safety_notes: "Safe. Similar to cultivated blueberries.",
    edibility_notes:
      "Eat fresh, bake, or make jam. Rich in antioxidants. Used traditionally for eye health.",
  },
  {
    scientific_name: "Impatiens capensis",
    common_name: "Jewelweed",
    family: "Balsaminaceae",
    edible: false,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Eastern North America",
    safety_notes: "Stem juice is a traditional remedy for poison ivy rash.",
    edibility_notes:
      "Not commonly eaten. Known primarily as a topical remedy for skin irritation.",
  },
  {
    scientific_name: "Alliaria petiolata",
    common_name: "Garlic Mustard",
    family: "Brassicaceae",
    edible: true,
    medicinal: false,
    toxic: false,
    invasive: true,
    native_range: "Europe, Western Asia; invasive in North America",
    safety_notes:
      "Safe to eat. Harvesting is encouraged - this is one of the most damaging invasive species in North American forests.",
    edibility_notes:
      "Leaves have a mild garlic flavor. Use raw in salads, pesto, or sautéed. First-year roots taste like horseradish.",
  },
  {
    scientific_name: "Viola sororia",
    common_name: "Common Blue Violet",
    family: "Violaceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "Eastern North America",
    safety_notes: "Safe. Very common in lawns and gardens.",
    edibility_notes:
      "Flowers and young leaves edible raw. Flowers candied as decoration. Leaves high in vitamins A and C.",
  },
  {
    scientific_name: "Mentha arvensis",
    common_name: "Wild Mint",
    family: "Lamiaceae",
    edible: true,
    medicinal: true,
    toxic: false,
    invasive: false,
    native_range: "North America, Europe, Asia",
    safety_notes: "Safe. Strong menthol flavor.",
    edibility_notes:
      "Leaves for tea, cooking, and garnish. Aids digestion. Grows near water sources.",
  },
  {
    scientific_name: "Persicaria perfoliata",
    common_name: "Mile-a-Minute Weed",
    family: "Polygonaceae",
    edible: false,
    medicinal: false,
    toxic: false,
    invasive: true,
    native_range: "Eastern Asia; invasive in Eastern North America",
    safety_notes:
      "Not toxic but extremely invasive. Smothers native vegetation. Report sightings.",
    edibility_notes: "Not edible. No known food use.",
  },
];

async function seed() {
  console.log(`Seeding ${plants.length} plants...`);

  for (const plant of plants) {
    await sql`
      INSERT INTO plants (
        scientific_name, common_name, family,
        edible, medicinal, toxic, invasive,
        native_range, safety_notes, edibility_notes
      ) VALUES (
        ${plant.scientific_name}, ${plant.common_name}, ${plant.family},
        ${plant.edible}, ${plant.medicinal}, ${plant.toxic}, ${plant.invasive},
        ${plant.native_range}, ${plant.safety_notes}, ${plant.edibility_notes}
      )
      ON CONFLICT (scientific_name) DO UPDATE SET
        common_name = EXCLUDED.common_name,
        family = EXCLUDED.family,
        edible = EXCLUDED.edible,
        medicinal = EXCLUDED.medicinal,
        toxic = EXCLUDED.toxic,
        invasive = EXCLUDED.invasive,
        native_range = EXCLUDED.native_range,
        safety_notes = EXCLUDED.safety_notes,
        edibility_notes = EXCLUDED.edibility_notes,
        updated_at = NOW()
    `;
  }

  console.log("Done seeding plants.");
  await sql.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
