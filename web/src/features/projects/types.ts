export type ProjectVisibility = "team" | "personal";

export type ProjectRole = "owner" | "editor" | "viewer";

export type Project = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  visibility: ProjectVisibility;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type BoardColumn = {
  id: string;
  project_id: string;
  title: string;
  position: number;
  hero_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CardStatus = "in_progress" | "blocked" | "needs_review" | "complete";
export type CardPriority = "very_low" | "low" | "medium" | "high" | "extreme";

export type Card = {
  id: string;
  project_id: string;
  column_id: string | null;
  parent_card_id: string | null;
  title: string;
  description: string | null;
  status: CardStatus;
  effort: number | null;
  priority: CardPriority;
  start_date: string | null;
  due_date: string | null;
  archived: boolean;
  position: number;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type BoardColumnWithCards = BoardColumn & {
  cards: Card[];
};

