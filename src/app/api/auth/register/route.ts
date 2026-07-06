export const runtime = "edge";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth-edge";

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

const schema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Nieprawidłowe dane", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;
    const lower = email.toLowerCase();

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Baza danych niedostępna" }, { status: 503 });
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", lower)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "Konto z tym emailem już istnieje" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = `u_${Math.random().toString(36).slice(2, 12)}`;
    const avatarColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const displayName = name || lower.split("@")[0];

    const { error } = await supabase.from("users").insert({
      id,
      email: lower,
      name: displayName,
      password_hash: passwordHash,
      avatar_color: avatarColor,
    });
    if (error) {
      console.error("Supabase insert error", error);
      return NextResponse.json({ error: "Nie udało się utworzyć konta" }, { status: 500 });
    }

    // Create session and set cookie
    const token = await createSessionToken({ id, email: lower, name: displayName, avatarColor });
    const res = NextResponse.json({ id, email: lower, name: displayName, avatarColor });
    res.headers.set(
      "Set-Cookie",
      `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax; Secure`
    );
    return res;
  } catch (e) {
    console.error("Register error", e);
    return NextResponse.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 });
  }
}
