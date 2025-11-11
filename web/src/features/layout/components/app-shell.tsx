"use client";

import { useState } from "react";
import clsx from "clsx";
import { ProjectSidebar } from "@/features/projects/components/project-sidebar";

type AppShellProps = {
  title?: string;
  children: React.ReactNode;
};

export function AppShell({ children, title }: AppShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className={clsx("transition-transform duration-300 ease-in-out", isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <ProjectSidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/70 text-sm font-semibold shadow-sm transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 lg:hidden"
              aria-label="Toggle project menu"
            >
              ☰
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Lycian Forge Utilities
              </p>
              <h1 className="text-2xl font-semibold leading-tight">{title ?? "Workspace"}</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background/95">{children}</main>
      </div>
    </div>
  );
}

