"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/env";

export function createBrowserSupabaseClient() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookieOptions: {
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  });
}

