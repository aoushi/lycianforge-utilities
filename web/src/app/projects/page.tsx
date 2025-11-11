import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateFirstProject } from "@/features/projects/components/create-first-project";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("archived", false)
    .order("created_at", { ascending: true });

  if (projects && projects.length > 0) {
    redirect(`/projects/${projects[0].id}`);
  }

  return <CreateFirstProject />;
}


