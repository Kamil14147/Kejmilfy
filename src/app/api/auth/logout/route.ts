export const runtime = "edge";

import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-edge";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`
  );
  return res;
}
