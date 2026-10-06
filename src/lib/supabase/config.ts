export type SupabaseServerConfig = {
  url: string;
  serviceRoleKey: string | null;
  publishableKey: string | null;
  serverKey: string;
  schema: "hospital";
};

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function getSupabaseServerConfig(): SupabaseServerConfig {
  const url =
    readEnv("NEXT_PUBLIC_SUPABASE_URL") ??
    readEnv("SUPABASE_URL");

  const serviceRoleKey = readEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  const publishableKey =
    readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ??
    readEnv("SUPABASE_PUBLISHABLE_KEY") ??
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
    readEnv("SUPABASE_ANON_KEY");

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) for server database config.",
    );
  }

  const serverKey =
    serviceRoleKey ??
    publishableKey;

  if (!serverKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return {
    url,
    serviceRoleKey,
    publishableKey,
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

export function isSupabaseAuthConfigured(): boolean {
  try {
    const { url, publishableKey } = getSupabaseServerConfig();
    return Boolean(url && publishableKey);
  } catch {
    return false;
  }
}