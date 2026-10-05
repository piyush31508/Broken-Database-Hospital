import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseServerConfig,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/**
 * Server-only Supabase client.
 *
 * The RPC lives in the public schema, so the client uses
 * public as its default schema.
 *
 * The RPC itself queries the hospital schema.
 */
export function createServerClient(): SupabaseClient {
  const { url, serverKey } = getSupabaseServerConfig();

  return createClient(url, serverKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
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