import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <main className="flex min-h-[60vh] flex-col gap-4 px-8 py-16">
      <header>
        <h1 className="text-4xl font-semibold text-foreground">Projects</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {session
            ? "We are setting up your workspace. Soon you will see shared and personal projects here."
            : "You need to be signed in to manage projects."}
        </p>
      </header>
    </main>
  );
}


