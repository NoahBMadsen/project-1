import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  real,
  customType,
} from "drizzle-orm/pg-core";

// PostGIS geometry point type (longitude, latitude) stored as GEOGRAPHY(POINT,4326)
const geography = customType<{ data: string }>({
  dataType() {
    return "geography(point,4326)";
  },
});

// ---------------------------------------------------------------------------
// plants
// Seeded from USDA PLANTS database. One row per species.
// ---------------------------------------------------------------------------
export const plants = pgTable("plants", {
  id: uuid("id").primaryKey().defaultRandom(),
  scientificName: varchar("scientific_name", { length: 255 }).notNull().unique(),
  commonName: varchar("common_name", { length: 255 }),
  family: varchar("family", { length: 100 }),
  // Category flags (a plant can be multiple)
  edible: boolean("edible").notNull().default(false),
  medicinal: boolean("medicinal").notNull().default(false),
  toxic: boolean("toxic").notNull().default(false),
  invasive: boolean("invasive").notNull().default(false),
  // USDA native range description
  nativeRange: text("native_range"),
  // Safety / foraging notes
  safetyNotes: text("safety_notes"),
  edibilityNotes: text("edibility_notes"),
  // Stock species image stored in Supabase Storage (species-images bucket)
  imageUrl: text("image_url"),
  // Pl@ntNet species ID for matching API results back to this record
  plantnetId: varchar("plantnet_id", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// users
// Mirrors Supabase Auth users. Extended profile data lives here.
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  // Matches auth.users.id — set manually on first sign-in
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// journal_entries
// Auto-created after each successful plant scan. Private to the user.
// ---------------------------------------------------------------------------
export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plantId: uuid("plant_id").references(() => plants.id, { onDelete: "set null" }),
  // Fallback species name if Pl@ntNet match exists but no DB record yet
  speciesName: varchar("species_name", { length: 255 }),
  confidenceScore: real("confidence_score"),
  // Where the scan happened
  location: geography("location"),
  // User's private notes
  notes: text("notes"),
  // User-uploaded photo stored in Supabase Storage (user-photos bucket)
  photoUrl: text("photo_url"),
  scannedAt: timestamp("scanned_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// community_pins
// One pin per journal entry the user chooses to share publicly.
// Location is stored as PostGIS point for radius queries.
// ---------------------------------------------------------------------------
export const communityPins = pgTable("community_pins", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  journalEntryId: uuid("journal_entry_id")
    .notNull()
    .references(() => journalEntries.id, { onDelete: "cascade" }),
  plantId: uuid("plant_id").references(() => plants.id, { onDelete: "set null" }),
  speciesName: varchar("species_name", { length: 255 }),
  // PostGIS point — used for ST_DWithin radius queries on the community map
  location: geography("location").notNull(),
  pinnedAt: timestamp("pinned_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// field_guide_entries
// Community contributions for species with no match in the plants table.
// ---------------------------------------------------------------------------
export const fieldGuideEntries = pgTable("field_guide_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Species name as returned by Pl@ntNet (no DB match)
  speciesName: varchar("species_name", { length: 255 }).notNull(),
  location: geography("location"),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  contributedAt: timestamp("contributed_at", { withTimezone: true }).notNull().defaultNow(),
});
