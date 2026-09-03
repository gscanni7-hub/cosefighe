-- Schema per il pannello admin di Cose Fighe.
-- Esegui questo file nel SQL Editor del tuo progetto Supabase.
-- Poi crea un utente in Authentication > Users: sarà l'accesso al pannello.

create extension if not exists "pgcrypto";

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_slug text not null default 'food',
  duration text,
  group_size text,
  rating numeric default 4.8,
  reviews integer default 0,
  price text,
  tag text,
  color text default 'white' check (color in ('orange', 'blue', 'white')),
  image text,
  location text,
  included text,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  category text,
  category_slug text,
  author text,
  author_role text,
  author_image text,
  date date default current_date,
  reading_time integer default 5,
  cover_image text,
  tags text[] default '{}',
  body jsonb default '[]'::jsonb,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  topic text,
  message text,
  source text default 'contatti',
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.experiences enable row level security;
alter table public.articles enable row level security;
alter table public.leads enable row level security;

-- Visitatori: leggono solo i contenuti pubblicati e possono inviare lead.
create policy "public read published experiences" on public.experiences for select to anon using (published = true);
create policy "public read published articles" on public.articles for select to anon using (published = true);
create policy "public insert leads" on public.leads for insert to anon with check (true);

-- Utenti autenticati (il team, via Supabase Auth): accesso completo.
create policy "team all experiences" on public.experiences for all to authenticated using (true) with check (true);
create policy "team all articles" on public.articles for all to authenticated using (true) with check (true);
create policy "team all leads" on public.leads for all to authenticated using (true) with check (true);
