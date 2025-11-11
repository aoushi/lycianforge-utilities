import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { ThemeScript } from "@/components/theme/theme-script";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const displaySans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const codeMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lycian Forge Utilities",
  description: "Collaborative project management for the Lycian Forge team.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${displaySans.variable} ${codeMono.variable} bg-background text-foreground antialiased`}>
        <AppProviders initialSession={session}>{children}</AppProviders>
      </body>
    </html>
  );
}
