export const runtime = "edge";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth-edge";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
    }
    const { email, password } = parsed.data;
    const lower = email.toLowerCase();

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Baza danych niedostępna" }, { status: 503 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, password_hash, avatar_color")
      .eq("email", lower)
      .maybeSingle();
    if (error || !user) {
      return NextResponse.json({ error: "Nieprawidłowy email lub hasło" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Nieprawidłowy email lub hasło" }, { status: 401 });
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name || user.email.split("@")[0],
      avatarColor: user.avatar_color,
    });
    const res = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarColor: user.avatar_color,
    });
    res.headers.set(
      "Set-Cookie",
      `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax; Secure`
    );
    return res;
  } catch (e) {
    console.error("Login error", e);
    return NextResponse.json({ error: "Wewnętrzny błąd serwera" }, { status: 500 });
  }
}
