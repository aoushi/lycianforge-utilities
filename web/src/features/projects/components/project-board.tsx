"use client";

import { useState } from "react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import clsx from "clsx";
import {
  useBoard,
  useCreateCard,
  useCreateColumn,
} from "@/features/projects/hooks/use-projects";
import type { CardPriority, CardStatus } from "@/features/projects/types";

type ProjectBoardProps = {
  projectId: string;
};

const statusOptions: CardStatus[] = ["in_progress", "blocked", "needs_review", "complete"];
const priorityOptions: CardPriority[] = ["very_low", "low", "medium", "high", "extreme"];

export function ProjectBoard({ projectId }: ProjectBoardProps) {
  const { data, isLoading } = useBoard(projectId);
  const createColumn = useCreateColumn(projectId);
  const createCard = useCreateCard(projectId);
  const [columnName, setColumnName] = useState("");
  const [newCardColumn, setNewCardColumn] = useState<string | null>(null);

  const handleCreateColumn = async () => {
    if (!columnName.trim()) return;
    await createColumn.mutateAsync({ title: columnName.trim() });
    setColumnName("");
  };

  return (
    <div className="flex min-h-[70vh] flex-col gap-4 px-4 pb-8">
      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-4">
        <input
          type="text"
          value={columnName}
          onChange={(event) => setColumnName(event.target.value)}
          placeholder="New column name"
          className="flex-1 rounded-lg border border-border bg-background/80 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          disabled={createColumn.isPending}
        />
        <button
          type="button"
          onClick={handleCreateColumn}
          disabled={createColumn.isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createColumn.isPending ? "Adding…" : "Add column"}
        </button>
      </section>

      {isLoading ? (
        <div className="flex gap-4">
          <div className="h-64 w-64 flex-shrink-0 animate-pulse rounded-3xl bg-muted/40" />
          <div className="h-64 w-64 flex-shrink-0 animate-pulse rounded-3xl bg-muted/40" />
          <div className="h-64 w-64 flex-shrink-0 animate-pulse rounded-3xl bg-muted/40" />
        </div>
      ) : data && data.columns.length > 0 ? (
        <section className="flex w-full gap-5 overflow-x-auto pb-6">
          {data.columns.map((column) => (
            <article
              key={column.id}
              className="flex w-80 flex-shrink-0 flex-col gap-4 rounded-3xl border border-border/60 bg-card/80 p-5 shadow-lg shadow-primary/10"
            >
              <header className="space-y-2">
                <h2 className="text-xl font-semibold">{column.title}</h2>
                {column.hero_image_url && (
                  <div className="relative h-32 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={column.hero_image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setNewCardColumn(column.id)}
                  className="w-full rounded-xl border border-dashed border-primary/50 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  Add task
                </button>
              </header>

              <div className="space-y-3">
                {column.cards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm transition hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                      <span>{card.status.replace("_", " ")}</span>
                      <span>{card.priority}</span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{card.title}</h3>
                    {card.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{card.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Effort:{" "}
                        <span className="font-semibold">{card.effort ? card.effort : "–"}</span>
                      </span>
                      <span>
                        Due:{" "}
                        <span className="font-semibold">
                          {card.due_date ? format(parseISO(card.due_date), "dd MMM") : "TBD"}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {newCardColumn === column.id && (
                <CreateCardForm
                  columnId={column.id}
                  onClose={() => setNewCardColumn(null)}
                  onCreate={async (values) => {
                    await createCard.mutateAsync({
                      columnId: column.id,
                      title: values.title,
                      description: values.description,
                      status: values.status,
                      priority: values.priority,
                      effort: values.effort ? Number(values.effort) : undefined,
                      startDate: values.startDate || null,
                      dueDate: values.dueDate || null,
                    });
                  }}
                  isSubmitting={createCard.isPending}
                />
              )}
            </article>
          ))}
        </section>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/30">
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-semibold">No columns yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first column to start building the board.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

type CreateCardFormProps = {
  columnId: string;
  onCreate: (values: CreateCardFormValues) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
};

type CreateCardFormValues = {
  title: string;
  description: string;
  status: CardStatus;
  priority: CardPriority;
  effort: string;
  startDate: string;
  dueDate: string;
};

function CreateCardForm({ onCreate, onClose, isSubmitting }: CreateCardFormProps) {
  const [values, setValues] = useState<CreateCardFormValues>({
    title: "",
    description: "",
    status: "in_progress",
    priority: "medium",
    effort: "",
    startDate: "",
    dueDate: "",
  });

  const updateValue = (key: keyof CreateCardFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await onCreate(values);
        onClose();
      }}
      className="space-y-3 rounded-2xl border border-border/70 bg-background/90 p-4 shadow-lg"
    >
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Task title
        </label>
        <input
          required
          value={values.title}
          onChange={(event) => updateValue("title", event.target.value)}
          placeholder="Design hero section"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Description
        </label>
        <textarea
          value={values.description}
          onChange={(event) => updateValue("description", event.target.value)}
          rows={3}
          placeholder="Optional context or acceptance criteria…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</label>
          <select
            value={values.status}
            onChange={(event) => updateValue("status", event.target.value as CardStatus)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Priority</label>
          <select
            value={values.priority}
            onChange={(event) => updateValue("priority", event.target.value as CardPriority)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Effort (1-10)</label>
          <input
            type="number"
            min={1}
            max={10}
            value={values.effort}
            onChange={(event) => updateValue("effort", event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start date</label>
          <input
            type="date"
            value={values.startDate}
            onChange={(event) => updateValue("startDate", event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Due date</label>
          <input
            type="date"
            value={values.dueDate}
            onChange={(event) => updateValue("dueDate", event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 text-sm">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-3 py-2 text-muted-foreground transition hover:bg-muted/40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            "rounded-lg bg-secondary px-4 py-2 font-semibold text-secondary-foreground shadow shadow-secondary/30 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isSubmitting ? "Creating…" : "Create task"}
        </button>
      </div>
    </form>
  );
}

