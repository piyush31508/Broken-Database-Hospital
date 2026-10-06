import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  getSupabaseServerConfig,
  isSupabaseAuthConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

async function createCookieClient(url: string, key: string) {
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(
                  name,
                  value,
                  options,
                );
              },
            );
          } catch {
            // Server components may not allow cookie writes.
          }
        },
      },
    },
  );
}

export async function createServerClient() {
  const { url, serverKey } = getSupabaseServerConfig();
  return createCookieClient(url, serverKey);
}

export async function createAuthServerClient() {
  const { url, publishableKey } = getSupabaseServerConfig();

  if (!publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) for authentication.",
    );
  }

  return createCookieClient(url, publishableKey);
}

export async function tryCreateServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createServerClient();
}

export async function tryCreateAuthServerClient() {
  if (!isSupabaseAuthConfigured()) {
    return null;
  }

  return createAuthServerClient();
}

export {
  getSupabaseServerConfig,
  isSupabaseAuthConfigured,
  isSupabaseConfigured,
};