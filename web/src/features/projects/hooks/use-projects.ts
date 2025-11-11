import { useSupabase } from "@/components/providers/supabase-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import type {
  CreateCardInput,
  CreateColumnInput,
  CreateProjectInput,
} from "@/features/projects/api";
import {
  createCard,
  createColumn,
  createProject,
  fetchBoard,
  fetchProjects,
} from "@/features/projects/api";

export const projectKeys = {
  all: ["projects"] as const,
  board: (projectId: string) => ["projects", projectId, "board"] as const,
};

export function useProjects() {
  const { client } = useSupabase();

  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => fetchProjects(client),
  });
}

export function useCreateProject() {
  const { client } = useSupabase();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(client, input),
    onSuccess: (project) => {
      toast.success("Project created");
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      router.push(`/projects/${project.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useBoard(projectId: string) {
  const { client } = useSupabase();

  return useQuery({
    queryKey: projectKeys.board(projectId),
    queryFn: () => fetchBoard(client, projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateColumn(projectId: string) {
  const { client } = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateColumnInput, "projectId">) =>
      createColumn(client, { ...input, projectId }),
    onSuccess: () => {
      toast.success("Column created");
      queryClient.invalidateQueries({ queryKey: projectKeys.board(projectId) });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useCreateCard(projectId: string) {
  const { client } = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateCardInput, "projectId">) =>
      createCard(client, { ...input, projectId }),
    onSuccess: () => {
      toast.success("Task created");
      queryClient.invalidateQueries({ queryKey: projectKeys.board(projectId) });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

