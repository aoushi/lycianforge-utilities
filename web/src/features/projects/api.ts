import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BoardColumn,
  BoardColumnWithCards,
  Card,
  CardPriority,
  CardStatus,
  Project,
  ProjectVisibility,
} from "@/features/projects/types";

export type CreateProjectInput = {
  name: string;
  description?: string;
  visibility: ProjectVisibility;
};

export async function fetchProjects(client: SupabaseClient): Promise<Project[]> {
  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createProject(client: SupabaseClient, input: CreateProjectInput): Promise<Project> {
  const { data, error } = await client
    .from("projects")
    .insert({
      name: input.name,
      description: input.description ?? null,
      visibility: input.visibility,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchBoard(
  client: SupabaseClient,
  projectId: string,
): Promise<{ columns: BoardColumnWithCards[] }> {
  const { data: columns, error: columnsError } = await client
    .from("board_columns")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  if (columnsError) {
    throw new Error(columnsError.message);
  }

  const { data: cards, error: cardsError } = await client
    .from("cards")
    .select("*")
    .eq("project_id", projectId)
    .is("parent_card_id", null)
    .eq("archived", false)
    .order("position", { ascending: true });

  if (cardsError) {
    throw new Error(cardsError.message);
  }

  const columnsWithCards: BoardColumnWithCards[] = (columns ?? []).map((column) => ({
    ...column,
    cards:
      cards?.filter((card) => card.column_id === column.id).map((card) => ({ ...card, position: Number(card.position) })) ??
      [],
    position: Number(column.position),
  }));

  return { columns: columnsWithCards };
}

export type CreateColumnInput = {
  projectId: string;
  title: string;
  heroImageUrl?: string;
};

export async function createColumn(client: SupabaseClient, input: CreateColumnInput): Promise<BoardColumn> {
  const { data, error } = await client
    .from("board_columns")
    .insert({
      project_id: input.projectId,
      title: input.title,
      hero_image_url: input.heroImageUrl ?? null,
      position: Date.now(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...data,
    position: Number(data.position),
  };
}

export type CreateCardInput = {
  projectId: string;
  columnId: string;
  title: string;
  description?: string;
  status?: CardStatus;
  effort?: number;
  priority?: CardPriority;
  startDate?: string | null;
  dueDate?: string | null;
};

export async function createCard(client: SupabaseClient, input: CreateCardInput): Promise<Card> {
  const { data, error } = await client
    .from("cards")
    .insert({
      project_id: input.projectId,
      column_id: input.columnId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? "in_progress",
      effort: input.effort ?? null,
      priority: input.priority ?? "medium",
      start_date: input.startDate ?? null,
      due_date: input.dueDate ?? null,
      position: Date.now(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...data,
    position: Number(data.position),
  };
}

