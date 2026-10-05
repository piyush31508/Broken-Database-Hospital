import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseServerConfig,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/**
 * Server-only Supabase client.
 * Prefer calling from Server Components, Route Handlers, or server actions.
 * SQL execution for the game is not wired yet.
 */
export function createServerClient(): SupabaseClient {
  const { url, serverKey, schema } = getSupabaseServerConfig();

  return createClient(url, serverKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema,
    },
  });
}

export function tryCreateServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createServerClient();
}

export { getSupabaseServerConfig, isSupabaseConfigured };
