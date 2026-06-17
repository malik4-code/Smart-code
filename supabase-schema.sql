-- ============================================================
-- Influence CRM — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==================== PROFILES ====================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'employee' check (role in ('admin', 'manager', 'employee')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ==================== CLIENTS ====================
create table if not exists public.clients (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  industry text,
  email text,
  phone text,
  address text,
  website text,
  contact_person text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==================== INFLUENCERS ====================
create table if not exists public.influencers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  platform text not null,
  category text,
  city text,
  followers integer,
  engagement_rate decimal(5,2),
  estimated_price decimal(12,2),
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==================== PROJECTS ====================
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  client_id uuid references public.clients(id) on delete set null,
  description text,
  budget decimal(12,2),
  status text not null default 'planning' check (status in ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==================== PROJECT INFLUENCERS (Junction) ====================
create table if not exists public.project_influencers (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  influencer_id uuid references public.influencers(id) on delete cascade not null,
  unique(project_id, influencer_id)
);

-- ==================== TASKS ====================
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  project_id uuid references public.projects(id) on delete set null,
  assignee_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==================== AUTO UPDATE TRIGGER ====================
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger clients_updated_at before update on public.clients for each row execute function public.update_updated_at();
create trigger influencers_updated_at before update on public.influencers for each row execute function public.update_updated_at();
create trigger projects_updated_at before update on public.projects for each row execute function public.update_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function public.update_updated_at();

-- ==================== AUTO CREATE PROFILE ON SIGNUP ====================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==================== ROW LEVEL SECURITY ====================
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.influencers enable row level security;
alter table public.projects enable row level security;
alter table public.project_influencers enable row level security;
alter table public.tasks enable row level security;

-- Profiles
create policy "Profiles: authenticated can view all" on public.profiles for select using (auth.role() = 'authenticated');
create policy "Profiles: users update own" on public.profiles for update using (auth.uid() = id);

-- Clients
create policy "Clients: authenticated CRUD" on public.clients for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Influencers
create policy "Influencers: authenticated CRUD" on public.influencers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Projects
create policy "Projects: authenticated CRUD" on public.projects for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Project Influencers
create policy "ProjectInfluencers: authenticated CRUD" on public.project_influencers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Tasks
create policy "Tasks: authenticated CRUD" on public.tasks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- DONE! Now go to Authentication > Settings and:
-- 1. Enable email/password auth
-- 2. Add your app URL to the allowed redirect URLs
-- 3. Create your first user via Authentication > Users > Add user
-- ============================================================
