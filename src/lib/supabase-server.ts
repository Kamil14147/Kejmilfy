import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _adminClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the secret key.
 * Bypasses Row Level Security — for use in API routes only.
 *
 * NEVER import this from a Client Component ('use client').
 * NEVER expose SUPABASE_SECRET_KEY to the browser.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (_adminClient) return _adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;
  try {
    _adminClient = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return _adminClient;
  } catch (e) {
    console.error("Supabase admin init failed", e);
    return null;
  }
}
