"use client";

import { type ThemeMode, ThemeProvider, type ThemePalette } from "@/components/theme/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { SupabaseProvider } from "@/components/providers/supabase-provider";

type AppProvidersProps = {
  children: React.ReactNode;
  initialThemeMode?: ThemeMode;
  initialPalette?: ThemePalette;
  initialSession?: Session | null;
};

export function AppProviders({
  children,
  initialThemeMode = "system",
  initialPalette = "midnight",
  initialSession = null,
}: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider defaultMode={initialThemeMode} defaultPalette={initialPalette}>
      <SupabaseProvider initialSession={initialSession}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "rounded-xl bg-card/90 text-card-foreground shadow-glow backdrop-blur",
              success: { iconTheme: { primary: "#6366f1", secondary: "#eef2ff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fee2e2" } },
            }}
          />
        </QueryClientProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}

