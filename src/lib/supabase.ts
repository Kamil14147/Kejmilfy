"use client";

import * as React from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _browserClient: SupabaseClient | null = null;

/**
 * Browser-side Supabase client using the publishable (anon) key.
 * Subject to Row Level Security policies on your tables.
 *
 * Used for:
 *  - Realtime subscriptions (cursors, presence, element changes)
 *  - Client-side queries (when RLS permits)
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (_browserClient) return _browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  try {
    _browserClient = createClient(url, anon, {
      realtime: {
        params: { eventsPerSecond: 30 },
      },
      auth: { persistSession: false },
    });
    return _browserClient;
  } catch (e) {
    console.warn("Supabase browser init failed", e);
    return null;
  }
}

/**
 * Convenience hook: returns the browser client once it's available.
 */
export function useSupabaseBrowser(): SupabaseClient | null {
  const [client, setClient] = React.useState<SupabaseClient | null>(null);
  React.useEffect(() => {
    setClient(getSupabaseBrowser());
  }, []);
  return client;
}

/**
 * True if Supabase Realtime is configured.
 */
export function useSupabaseAvailable(): boolean {
  const c = useSupabaseBrowser();
  return !!c;
}
