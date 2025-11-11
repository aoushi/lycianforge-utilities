import Link from "next/link";

const featureHighlights = [
  "Drag-and-drop kanban with undo history",
  "Timeline views built from real task data",
  "Personal and team projects in one space",
  "Custom colour palettes and themes",
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-24 text-foreground">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 via-transparent to-secondary/20 blur-3xl" />
      <div className="absolute top-10 right-[-10%] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-[-15%] h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-3xl border border-border/60 bg-card/80 p-10 shadow-2xl shadow-primary/10 backdrop-blur">
        <div className="flex flex-col gap-4 text-center sm:text-left">
          <span className="mx-auto inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground sm:mx-0">
            LYCIAN FORGE UTILITIES
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Your team&apos;s project command center.
          </h1>
          <p className="text-base text-muted-foreground sm:max-w-2xl">
            Coordinate sprints, visualise timelines, and keep everyone accountable with a workspace designed for
            creative and technical teams.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {featureHighlights.map((feature) => (
            <div
              key={feature}
              className="group flex items-start gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 transition hover:border-primary/60 hover:bg-primary/5"
            >
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
                *
              </span>
              <p className="text-sm text-foreground/90">{feature}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full border border-background bg-gradient-to-br from-primary to-primary/60 shadow-glow" />
              <div className="h-8 w-8 rounded-full border border-background bg-gradient-to-br from-secondary to-secondary/60 shadow-glow" />
              <div className="h-8 w-8 rounded-full border border-background bg-gradient-to-br from-accent to-accent/60 shadow-glow" />
            </div>
            <span>Invite your squad and start crafting better workflows.</span>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-xl border border-primary/40 px-6 py-3 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
