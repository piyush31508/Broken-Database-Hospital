import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  getSupabaseServerConfig,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

export async function createServerClient() {
  const { url, serverKey } = getSupabaseServerConfig();

  const cookieStore = await cookies();

  return createSupabaseServerClient(
    url,
    serverKey,
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

export async function tryCreateServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createServerClient();
}

export {
  getSupabaseServerConfig,
  isSupabaseConfigured,
};