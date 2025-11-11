"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type SupabaseContextValue = {
  client: SupabaseClient;
  session: Session | null;
  setSession: (session: Session | null) => void;
};

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

type SupabaseProviderProps = {
  initialSession: Session | null;
  children: React.ReactNode;
};

export function SupabaseProvider({ initialSession, children }: SupabaseProviderProps) {
  const [client] = useState(() => createBrowserSupabaseClient());
  const [session, setSession] = useState<Session | null>(initialSession);

  const value = useMemo(
    () => ({
      client,
      session,
      setSession,
    }),
    [client, session],
  );

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return ctx;
}

