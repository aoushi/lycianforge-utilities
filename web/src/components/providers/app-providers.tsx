"use client";

import { type ThemeMode, ThemeProvider, type ThemePalette } from "@/components/theme/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

type AppProvidersProps = {
  children: React.ReactNode;
  initialThemeMode?: ThemeMode;
  initialPalette?: ThemePalette;
};

export function AppProviders({
  children,
  initialThemeMode = "system",
  initialPalette = "midnight",
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
    </ThemeProvider>
  );
}

