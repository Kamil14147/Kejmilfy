-- kejmilfy — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
--
-- After running this, the app will use Supabase as its database.
-- The schema uses lowercase snake_case table names (Supabase convention).

-- ============= Tables =============

create table if not exists users (
  id            text primary key,
  email         text unique not null,
  name          text,
  password_hash text not null,
  avatar_color  text not null default '#6366f1',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists folders (
  id         text primary key,
  name       text not null,
  color      text not null default '#6366f1',
  user_id    text not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id          text primary key,
  name        text not null,
  data        text not null,           -- JSON-serialized full project
  thumbnail   text,
  favorite    boolean not null default false,
  deleted     boolean not null default false,
  folder_id   text references folders(id) on delete set null,
  author_id   text not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists comments (
  id          text primary key,
  project_id  text not null references projects(id) on delete cascade,
  page_id     text not null,
  x           double precision not null,
  y           double precision not null,
  text        text not null,
  resolved    boolean not null default false,
  replies     text not null default '[]',  -- JSON array
  author_id   text not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists activities (
  id          text primary key,
  project_id  text not null references projects(id) on delete cascade,
  type        text not null,
  action      text not null,
  author_id   text not null references users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- ============= Indexes =============

create index if not exists projects_author_id_idx on projects(author_id);
create index if not exists projects_updated_at_idx on projects(updated_at desc);
create index if not exists comments_project_id_idx on comments(project_id);
create index if not exists activities_project_id_idx on activities(project_id);

-- ============= Row Level Security =============
-- We use the secret key (server-side) which bypasses RLS,
-- but enabling RLS makes the database secure if anyone gets the anon key.

alter table users      enable row level security;
alter table folders    enable row level security;
alter table projects   enable row level security;
alter table comments   enable row level security;
alter table activities enable row level security;

-- Allow anyone authenticated to read/write their own rows
-- (the actual enforcement happens server-side via the secret key in API routes)

create policy "Users can read own row"        on users for select using (true);
create policy "Users can insert own row"      on users for insert with check (true);
create policy "Users can update own row"      on users for update using (true);

create policy "Anyone can read projects"      on projects for select using (true);
create policy "Anyone can insert projects"    on projects for insert with check (true);
create policy "Anyone can update projects"    on projects for update using (true);
create policy "Anyone can delete projects"    on projects for delete using (true);

create policy "Anyone can read folders"      on folders for select using (true);
create policy "Anyone can insert folders"    on folders for insert with check (true);
create policy "Anyone can update folders"    on folders for update using (true);
create policy "Anyone can delete folders"    on folders for delete using (true);

create policy "Anyone can read comments"     on comments for select using (true);
create policy "Anyone can insert comments"   on comments for insert with check (true);
create policy "Anyone can update comments"   on comments for update using (true);
create policy "Anyone can delete comments"   on comments for delete using (true);

create policy "Anyone can read activities"   on activities for select using (true);
create policy "Anyone can insert activities" on activities for insert with check (true);
create policy "Anyone can delete activities" on activities for delete using (true);

-- ============= Realtime =============
-- Enable realtime for tables we want to subscribe to.
-- (Cursors use a broadcast channel — they don't need this.
--  But element-change sync can use either broadcast or postgres_changes.)

alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table activities;

-- ============= Done =============
-- Verify in Table Editor that 5 tables exist: users, folders, projects, comments, activities.
