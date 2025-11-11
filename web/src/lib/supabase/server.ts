import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/env";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function createServerSupabaseClient() {
  const cookieStore = await Promise.resolve(cookies()) as CookieStore;

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookieEntries) {
        const maybeSet = (cookieStore as unknown as { set?: (options: Record<string, unknown>) => void }).set;
        if (typeof maybeSet !== "function") {
          return;
        }

        cookieEntries.forEach(({ name, value, options }) => {
          maybeSet({ name, value, ...options });
        });
      },
    },
  });
}

