export const runtime = "edge";

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Cache the result for 60 seconds to avoid hammering Supabase on every page load
let cached: { ready: boolean; missing: string[]; ts: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

export async function GET() {
  // Return cached result if fresh
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({
      ready: cached.ready,
      missing: cached.missing,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      cached: true,
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ready: false, error: "Supabase not configured" }, { status: 503 });
  }

  // Query ONE table only — if `users` exists, the schema was set up.
  // (All 5 tables are created by the same SQL script, so checking one is enough.)
  const { error } = await supabase.from("users").select("id").limit(1);

  if (error && (error.code === "PGRST205" || error.message.includes("schema cache"))) {
    cached = { ready: false, missing: ["users"], ts: Date.now() };
    return NextResponse.json({
      ready: false,
      missing: ["users"],
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
  }

  cached = { ready: true, missing: [], ts: Date.now() };
  return NextResponse.json({
    ready: true,
    missing: [],
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}
