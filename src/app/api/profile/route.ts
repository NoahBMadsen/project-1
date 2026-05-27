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
    SELECT id, email, display_name, username, display_preference, avatar_url
    FROM users WHERE id = ${user.id}
  `;

  if (rows.length === 0) {
    return NextResponse.json({
      profile: {
        display_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        username: null,
        display_preference: "anonymous",
      },
    });
  }

  return NextResponse.json({ profile: rows[0] });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { username, display_preference } = body;

  const validPrefs = ["anonymous", "username", "real_name"];
  if (display_preference && !validPrefs.includes(display_preference)) {
    return NextResponse.json({ error: "Invalid display_preference" }, { status: 400 });
  }

  if (display_preference === "username" && !username?.trim()) {
    return NextResponse.json({ error: "Username required for username display" }, { status: 400 });
  }

  const rows = await sql`
    UPDATE users SET
      username = COALESCE(${username?.trim() ?? null}, username),
      display_preference = COALESCE(${display_preference ?? null}, display_preference),
      updated_at = NOW()
    WHERE id = ${user.id}
    RETURNING id, email, display_name, username, display_preference, avatar_url
  `;

  if (rows.length === 0) {
    await sql`
      INSERT INTO users (id, email, display_name, username, display_preference, avatar_url)
      VALUES (
        ${user.id},
        ${user.email ?? ""},
        ${user.user_metadata?.full_name ?? user.user_metadata?.name ?? null},
        ${username?.trim() ?? null},
        ${display_preference ?? "anonymous"},
        ${user.user_metadata?.avatar_url ?? null}
      )
    `;
    return NextResponse.json({ profile: { username, display_preference } });
  }

  return NextResponse.json({ profile: rows[0] });
}
