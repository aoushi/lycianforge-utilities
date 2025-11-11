"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

export type ThemeMode = "system" | "light" | "dark";
export type ThemePalette = "midnight" | "sunrise" | "forest";

type ThemeContextValue = {
  mode: ThemeMode;
  palette: ThemePalette;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const MODE_STORAGE_KEY = "lf-theme-mode";
const PALETTE_STORAGE_KEY = "lf-theme-palette";

type ThemeProviderProps = {
  defaultMode?: ThemeMode;
  defaultPalette?: ThemePalette;
  children: React.ReactNode;
};

export function ThemeProvider({
  defaultMode = "system",
  defaultPalette = "midnight",
  children,
}: ThemeProviderProps) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof document === "undefined") return defaultMode;
    return (document.documentElement.getAttribute("data-initial-mode") as ThemeMode | null) ?? defaultMode;
  });
  const [palette, setPaletteState] = useState<ThemePalette>(() => {
    if (typeof document === "undefined") return defaultPalette;
    return (document.documentElement.getAttribute("data-palette") as ThemePalette | null) ?? defaultPalette;
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const shouldUseDark = mode === "dark" || (mode === "system" && prefersDark);
    root.classList.toggle("dark", shouldUseDark);
    root.setAttribute("data-initial-mode", mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    }
  }, [mode, prefersDark]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-palette", palette);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PALETTE_STORAGE_KEY, palette);
    }
  }, [palette]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
  }, []);

  const setPalette = useCallback((nextPalette: ThemePalette) => {
    setPaletteState(nextPalette);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = mode === "dark" || (mode === "system" && prefersDark);
    return {
      mode,
      palette,
      setMode,
      setPalette,
      isDark,
    };
  }, [mode, palette, prefersDark, setMode, setPalette]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

