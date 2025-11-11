# Database Schema Overview

This project uses [Supabase](https://supabase.com) (Postgres + Auth + Storage) as the primary backend.  
Migrations live under `supabase/migrations`. Run them via the Supabase CLI (`supabase db push`) or the SQL editor in the Supabase dashboard.

## Extensions

- `uuid-ossp` and `pgcrypto` enable UUID generation.

## Tables & Relationships

### `profiles`
- Mirrors `auth.users` and stores app-specific metadata.
- Enforces unique emails and nicknames.
- Tracks UI preferences (`theme_mode`, `palette_key`, `mail_alerts_enabled`).
- Automatic row provisioning via an auth trigger on signup (`handle_new_user`).

### `projects`
- Project metadata with visibility control (`team` or `personal`).
- Owner is always added to `project_members` through the `add_owner_membership` trigger.

### `project_members`
- Links people to projects with a lightweight role system (`owner`, `editor`, `viewer`).
- Supports private (personal) projects by limiting membership rows.

### `board_columns`
- Kanban columns (order preserved via `position` decimal).
- Optional hero imagery per column (`hero_image_url`).

### `cards`
- Core task entity.
- Belongs to a project and column, supports parent/child hierarchy for subcards.
- Tracks status (`in_progress`, `blocked`, `needs_review`, `complete`), effort (1-10), priority, scheduling, and audit info (`created_by`, `updated_by`).
- Ordered within columns using a float `position`.

### `card_assignees`
- Many-to-many join table for task assignments.

### `card_attachments`
- Metadata for files stored in Supabase Storage (`cards` bucket).

### `activity_log`
- General-purpose history table for undo/redo and auditing.
- Stores previous and next JSON snapshots plus action metadata.

### `card_reminders`
- Scheduling table for outgoing reminders (email via Resend).
- Each row represents a pending or sent reminder.

## Functions & Triggers

- `set_updated_at` keeps `updated_at` columns in sync.
- `handle_new_user` inserts profile rows after signups.
- `is_project_member` centralises membership checks for RLS.
- `add_owner_membership` ensures project owners are tracked as members.
- `on_auth_user_created`, `profiles_updated_at`, `projects_updated_at`, `board_columns_updated_at`, `cards_updated_at`, `project_owner_membership` maintain data integrity.

## Row Level Security (RLS)

RLS is enabled on all user-facing tables. Key policy rules:

- `profiles`: everyone can read; users can only update themselves.
- `projects`: visible when `team`, owned by the user, or the user is a member.
- `project_members`: only project members can read; only owners can mutate membership.
- `board_columns`, `cards`, `card_assignees`, `card_attachments`, `activity_log`: accessible to project members.
- `card_reminders`: per-user access to their reminders.

## Applying the Migration

1. Install Supabase CLI (`npm install -g supabase`).
2. Log in and link to your Supabase project.
3. `supabase db push` from the repo root (or run the SQL in the dashboard).

## Storage Buckets

- `cards` bucket (public read, authenticated write) for attachments and column hero images.
- Configure storage policies via the Supabase dashboard to mirror `card_attachments` access rules.

## Future Considerations

- Additional activity rollups (e.g. per-project changelog views).
- Index tuning once real usage data is available.
- Background job (Edge Function/Cron) to populate `card_reminders.sent_at` and trigger Resend emails.


