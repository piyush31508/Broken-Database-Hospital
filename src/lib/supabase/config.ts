/**
 * Server-side Supabase configuration.
 * Uses environment variables only — never expose the service role key to the client.
 *
 * Required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (preferred for server) OR NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

export type SupabaseServerConfig = {
  url: string;
  serviceRoleKey: string | null;
  anonKey: string | null;
  /** Key used for server operations (service role if set, otherwise anon). */
  serverKey: string;
  schema: "hospital";
};

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function getSupabaseServerConfig(): SupabaseServerConfig {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL") ?? readEnv("SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey =
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ?? readEnv("SUPABASE_ANON_KEY");

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) for server database config.",
    );
  }

  const serverKey = serviceRoleKey ?? anonKey;
  if (!serverKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY for server database config.",
    );
  }

  return {
    url,
    serviceRoleKey,
    anonKey,
    serverKey,
    schema: "hospital",
  };
}

export function isSupabaseConfigured(): boolean {
  try {
    getSupabaseServerConfig();
    return true;
  } catch {
    return false;
  }
}
