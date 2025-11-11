"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateProject,
} from "@/features/projects/hooks/use-projects";

const schema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters."),
  description: z.string().max(280, "Description must be 280 characters or fewer.").optional(),
  visibility: z.enum(["team", "personal"]).default("team"),
});

type FormValues = z.infer<typeof schema>;

export function CreateFirstProject() {
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      visibility: "team",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createProject.mutateAsync({
      name: values.name,
      description: values.description,
      visibility: values.visibility,
    });
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-xl space-y-6 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-xl shadow-primary/10 backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">First project</p>
          <h1 className="text-3xl font-semibold">Let&apos;s get your workspace started</h1>
          <p className="text-sm text-muted-foreground">
            Create your first project. You can add team members, columns and tasks afterwards.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Project name
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Campaign launch"
              className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              disabled={createProject.isPending}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </label>
            <textarea
              rows={4}
              {...register("description")}
              placeholder="Optional short description"
              className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              disabled={createProject.isPending}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visibility</label>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" value="team" {...register("visibility")} defaultChecked />
                Team
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="personal" {...register("visibility")} />
                Personal
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={createProject.isPending}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createProject.isPending ? "Creating…" : "Create project"}
          </button>
        </form>
      </div>
    </main>
  );
}

