import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppShell } from "@/features/layout/components/app-shell";
import { ProjectBoard } from "@/features/projects/components/project-board";

type ProjectBoardPageProps = {
  params: { projectId: string };
};

export const dynamic = "force-dynamic";

export default async function ProjectBoardPage({ params }: ProjectBoardPageProps) {
  const { projectId } = params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, archived")
    .eq("id", projectId)
    .maybeSingle();

  if (error || !project || project.archived) {
    notFound();
  }

  return (
    <AppShell title={project.name}>
      <ProjectBoard projectId={project.id} />
    </AppShell>
  );
}


