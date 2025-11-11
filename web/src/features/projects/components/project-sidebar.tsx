"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import {
  useCreateProject,
  useProjects,
} from "@/features/projects/hooks/use-projects";

const createProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters."),
  description: z.string().max(280, "Description must be 280 characters or fewer.").optional(),
  visibility: z.enum(["team", "personal"]).default("team"),
});

type CreateProjectValues = z.infer<typeof createProjectSchema>;

export function ProjectSidebar() {
  const { data: projects, isLoading } = useProjects();
  const { mutateAsync: handleCreateProject, isPending } = useCreateProject();
  const [showForm, setShowForm] = useState(false);
  const pathname = usePathname();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      visibility: "team",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await handleCreateProject({
      name: values.name,
      description: values.description,
      visibility: values.visibility,
    });
    reset();
    setShowForm(false);
  });

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border/60 bg-background/90">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Projects</p>
          <p className="text-sm text-muted-foreground/70">
            {projects?.length ?? 0} active
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label="Create project"
        >
          +
        </button>
      </div>

      {showForm && (
        <div className="px-4 pb-4">
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-4 shadow">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</label>
              <input
                type="text"
                placeholder="Worldbuilding"
                {...register("name")}
                className="w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                disabled={isPending}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Optional context for your team…"
                {...register("description")}
                className="w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                disabled={isPending}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Visibility
              </label>
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" value="team" {...register("visibility")} defaultChecked />
                  Team
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="personal" {...register("visibility")} />
                  Personal
                </label>
              </div>
              {errors.visibility && <p className="text-xs text-destructive">{errors.visibility.message}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setShowForm(false);
                }}
                className="rounded-lg border border-border px-3 py-2 text-muted-foreground transition hover:bg-muted/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground shadow shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 pb-6 pt-2">
        {isLoading ? (
          <div className="space-y-3 px-2">
            <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
            <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
            <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
          </div>
        ) : projects && projects.length > 0 ? (
          <ul className="space-y-2">
            {projects.map((project) => {
              const isActive = pathname.startsWith(`/projects/${project.id}`);
              return (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className={clsx(
                      "group flex items-center justify-between rounded-2xl border border-transparent px-3 py-3 text-sm transition",
                      isActive
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "hover:border-border/70 hover:bg-muted/50",
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">{project.name}</span>
                      {project.description && (
                        <span className="text-xs text-muted-foreground line-clamp-2">{project.description}</span>
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      {project.visibility === "personal" ? "Private" : "Team"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-2 text-sm text-muted-foreground">
            <p>No projects yet. Create one to get started.</p>
          </div>
        )}
      </nav>

      <footer className="border-t border-border/60 px-4 py-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Profile</span>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-[10px]">
            ⚙
          </span>
        </div>
      </footer>
    </aside>
  );
}

