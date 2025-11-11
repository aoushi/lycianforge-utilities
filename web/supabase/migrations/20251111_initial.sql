-- Initial schema for Lycian Forge project management app
-- Generated on 2025-11-11

-- Enable required extensions --------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Utility helpers -------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Core tables -----------------------------------------------------------------

create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text not null unique,
    nickname text not null unique,
    avatar_url text,
    full_name text,
    theme_mode text not null default 'system', -- system | light | dark
    palette_key text not null default 'midnight',
    mail_alerts_enabled boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index profiles_nickname_idx on public.profiles (nickname);

create type public.project_visibility as enum ('team', 'personal');

create table public.projects (
    id uuid primary key default uuid_generate_v4(),
    owner_id uuid not null references public.profiles (id) on delete cascade,
    name text not null,
    description text,
    visibility public.project_visibility not null default 'team',
    archived boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index projects_owner_idx on public.projects (owner_id);

create type public.project_role as enum ('owner', 'editor', 'viewer');

create table public.project_members (
    project_id uuid not null references public.projects (id) on delete cascade,
    profile_id uuid not null references public.profiles (id) on delete cascade,
    role public.project_role not null default 'editor',
    created_at timestamptz not null default now(),
    primary key (project_id, profile_id)
);

create index project_members_profile_idx on public.project_members (profile_id);

create table public.board_columns (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid not null references public.projects (id) on delete cascade,
    title text not null,
    position decimal not null,
    hero_image_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index board_columns_project_idx on public.board_columns (project_id);

create type public.card_status as enum ('in_progress', 'blocked', 'needs_review', 'complete');
create type public.card_priority as enum ('very_low', 'low', 'medium', 'high', 'extreme');

create table public.cards (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid not null references public.projects (id) on delete cascade,
    column_id uuid references public.board_columns (id) on delete set null,
    parent_card_id uuid references public.cards (id) on delete cascade,
    title text not null,
    description text,
    status public.card_status not null default 'in_progress',
    effort smallint check (effort between 1 and 10),
    priority public.card_priority not null default 'medium',
    start_date date,
    due_date date,
    archived boolean not null default false,
    position decimal not null,
    created_by uuid not null references public.profiles (id),
    updated_by uuid references public.profiles (id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index cards_project_idx on public.cards (project_id);
create index cards_column_idx on public.cards (column_id);
create index cards_parent_idx on public.cards (parent_card_id);
create index cards_due_date_idx on public.cards (due_date);

create table public.card_assignees (
    card_id uuid not null references public.cards (id) on delete cascade,
    profile_id uuid not null references public.profiles (id) on delete cascade,
    assigned_at timestamptz not null default now(),
    assigned_by uuid references public.profiles (id),
    primary key (card_id, profile_id)
);

create table public.card_attachments (
    id uuid primary key default uuid_generate_v4(),
    card_id uuid not null references public.cards (id) on delete cascade,
    storage_bucket text not null default 'cards',
    storage_path text not null,
    name text not null,
    size_bytes bigint not null,
    mime_type text,
    uploaded_by uuid not null references public.profiles (id),
    created_at timestamptz not null default now()
);

create type public.activity_entity as enum ('column', 'card');
create type public.activity_action as enum (
    'create',
    'update',
    'move',
    'delete',
    'archive',
    'restore',
    'attach',
    'detach'
);

create table public.activity_log (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid not null references public.projects (id) on delete cascade,
    entity_type public.activity_entity not null,
    entity_id uuid not null,
    action public.activity_action not null,
    payload jsonb not null,
    previous_state jsonb,
    next_state jsonb,
    triggered_by uuid not null references public.profiles (id),
    created_at timestamptz not null default now()
);

create index activity_log_project_idx on public.activity_log (project_id, created_at desc);

create table public.card_reminders (
    id uuid primary key default uuid_generate_v4(),
    card_id uuid not null references public.cards (id) on delete cascade,
    profile_id uuid not null references public.profiles (id) on delete cascade,
    reminder_type text not null,
    scheduled_for timestamptz not null,
    sent_at timestamptz,
    created_at timestamptz not null default now()
);

create index card_reminders_schedule_idx on public.card_reminders (scheduled_for, sent_at);

-- Functions and triggers -------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_nickname text;
begin
    v_nickname := coalesce(
        new.raw_user_meta_data ->> 'nickname',
        split_part(new.email, '@', 1) || '_' || substr(md5(new.id::text), 1, 6)
    );

    insert into public.profiles (id, email, nickname)
    values (new.id, new.email, v_nickname)
    on conflict (id) do nothing;

    return new;
end;
$$;

create or replace function public.is_project_member(p_project_id uuid, p_profile_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public as $$
    select exists (
        select 1
        from public.project_members pm
        where pm.project_id = p_project_id
          and pm.profile_id = coalesce(p_profile_id, auth.uid())
    )
    or exists (
        select 1
        from public.projects p
        where p.id = p_project_id
          and p.owner_id = coalesce(p_profile_id, auth.uid())
    );
$$;

create or replace function public.add_owner_membership()
returns trigger as $$
begin
    insert into public.project_members (project_id, profile_id, role)
    values (new.id, new.owner_id, 'owner')
    on conflict do nothing;
    return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger projects_updated_at
before update on public.projects
for each row execute procedure public.set_updated_at();

create trigger project_owner_membership
after insert on public.projects
for each row execute procedure public.add_owner_membership();

create trigger board_columns_updated_at
before update on public.board_columns
for each row execute procedure public.set_updated_at();

create trigger cards_updated_at
before update on public.cards
for each row execute procedure public.set_updated_at();

-- Row Level Security -----------------------------------------------------

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.board_columns enable row level security;
alter table public.cards enable row level security;
alter table public.card_assignees enable row level security;
alter table public.card_attachments enable row level security;
alter table public.activity_log enable row level security;
alter table public.card_reminders enable row level security;

create policy "Profiles are readable by authenticated users"
on public.profiles
for select
using (auth.role() = 'authenticated');

create policy "Profiles owners can update their profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Project visibility"
on public.projects
for select
using (
    visibility = 'team'
    or owner_id = auth.uid()
    or public.is_project_member(id)
);

create policy "Project owners manage projects"
on public.projects
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Members can read memberships"
on public.project_members
for select
using (public.is_project_member(project_id));

create policy "Owners manage memberships"
on public.project_members
for insert
with check (
    exists (
        select 1 from public.projects p
        where p.id = project_id and p.owner_id = auth.uid()
    )
);

create policy "Owners update memberships"
on public.project_members
for update
using (
    exists (
        select 1 from public.projects p
        where p.id = project_id and p.owner_id = auth.uid()
    )
)
with check (
    exists (
        select 1 from public.projects p
        where p.id = project_id and p.owner_id = auth.uid()
    )
);

create policy "Owners remove memberships"
on public.project_members
for delete
using (
    exists (
        select 1 from public.projects p
        where p.id = project_id and p.owner_id = auth.uid()
    )
);

create policy "Members can read columns"
on public.board_columns
for select
using (public.is_project_member(project_id));

create policy "Members manage columns"
on public.board_columns
for all
using (public.is_project_member(project_id))
with check (public.is_project_member(project_id));

create policy "Members can read cards"
on public.cards
for select
using (public.is_project_member(project_id));

create policy "Members manage cards"
on public.cards
for all
using (public.is_project_member(project_id))
with check (public.is_project_member(project_id));

create policy "Members read card assignees"
on public.card_assignees
for select
using (
    public.is_project_member(
        (select c.project_id from public.cards c where c.id = card_id)
    )
);

create policy "Members manage card assignees"
on public.card_assignees
for all
using (
    public.is_project_member(
        (select c.project_id from public.cards c where c.id = card_id)
    )
)
with check (
    public.is_project_member(
        (select c.project_id from public.cards c where c.id = card_id)
    )
);

create policy "Members read attachments"
on public.card_attachments
for select
using (
    public.is_project_member(
        (select c.project_id from public.cards c where c.id = card_id)
    )
);

create policy "Members manage attachments"
on public.card_attachments
for all
using (
    public.is_project_member(
        (select c.project_id from public.cards c where c.id = card_id)
    )
)
with check (
    public.is_project_member(
        (select c.project_id from public.cards c where c.id = card_id)
    )
);

create policy "Members read activity log"
on public.activity_log
for select
using (public.is_project_member(project_id));

create policy "Members append activity log"
on public.activity_log
for insert
with check (public.is_project_member(project_id));

create policy "Members read reminders they own"
on public.card_reminders
for select
using (profile_id = auth.uid());

create policy "Members manage their reminders"
on public.card_reminders
for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

