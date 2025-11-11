import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Access | Lycian Forge Utilities",
  description: "Sign in or create your Lycian Forge Utilities account.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="relative hidden w-0 flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/70 via-secondary/70 to-background lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent)]" />
        <div className="relative mx-auto max-w-md px-12 text-background/90 drop-shadow-lg">
          <h2 className="text-3xl font-semibold">Forge clarity from chaos.</h2>
          <p className="mt-4 text-sm text-background/80">
            Visualise your releases, sync Kanban boards with your team, and surface the insights you need to ship
            together. Keep the workflow flowing, from first idea to final milestone.
          </p>
        </div>
      </aside>
      <main className="flex w-full flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md space-y-10">{children}</div>
      </main>
    </div>
  );
}


