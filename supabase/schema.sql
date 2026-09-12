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

-- ---------------------------------------------------------------------------
-- Misurazione senza cookie (cruscotto "Dati" del pannello).
-- I visitatori possono solo inserire eventi; il team li legge.
-- ---------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  session text not null,
  type text not null check (type in ('pageview', 'click', 'scroll', 'dwell', 'leave', 'event')),
  path text not null,
  name text,
  value numeric,
  meta jsonb
);
create index if not exists analytics_events_ts on public.analytics_events (ts desc);
create index if not exists analytics_events_type on public.analytics_events (type, ts desc);

alter table public.analytics_events enable row level security;
create policy "public insert analytics" on public.analytics_events for insert to anon with check (true);
create policy "team read analytics" on public.analytics_events for select to authenticated using (true);
create policy "team delete analytics" on public.analytics_events for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Affiliazione e agenti.
-- ---------------------------------------------------------------------------
alter table public.experiences add column if not exists provider text default 'cosefighe' check (provider in ('getyourguide', 'viator', 'cosefighe'));
alter table public.experiences add column if not exists provider_id text;
alter table public.experiences add column if not exists affiliate_url text;
alter table public.experiences add column if not exists languages text[];
alter table public.experiences add column if not exists cancellation text;

-- Registro delle esecuzioni degli agenti (scout, redattore, controllore).
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  started_at timestamptz default now(),
  finished_at timestamptz,
  status text default 'in corso' check (status in ('in corso', 'ok', 'errore')),
  summary text,
  items integer default 0
);

-- Esperienze proposte dallo scout, in attesa di revisione nel pannello (sezione "Bozze").
create table if not exists public.experience_drafts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  agent_run_id uuid references public.agent_runs (id) on delete set null,
  provider text not null check (provider in ('getyourguide', 'viator', 'cosefighe')),
  provider_id text not null,
  source_url text not null,
  affiliate_url text not null,
  original_title text not null,
  title text not null,
  description text not null,
  category_slug text not null,
  price text,
  duration text,
  group_size text,
  languages text[],
  cancellation text,
  image text,
  location text,
  included text,
  rating numeric,
  reviews integer,
  score integer,
  reason text,
  rule_matched text,
  status text not null default 'bozza' check (status in ('bozza', 'approvata', 'scartata', 'pubblicata')),
  notes text,
  unique (provider, provider_id)
);

alter table public.agent_runs enable row level security;
alter table public.experience_drafts enable row level security;
create policy "team all agent_runs" on public.agent_runs for all to authenticated using (true) with check (true);
create policy "team all drafts" on public.experience_drafts for all to authenticated using (true) with check (true);
-- Gli agenti scrivono con la chiave "service role" (salta le policy): mai nel sito, solo negli script.

-- Impostazioni degli agenti, modificabili dal pannello (sezione "Agenti").
-- Gli agenti le leggono prima di lavorare: se `enabled` è falso non partono.
create table if not exists public.agent_settings (
  agent text primary key,
  enabled boolean not null default true,
  cadence text not null default 'settimanale' check (cadence in ('manuale', 'giornaliera', 'settimanale', 'mensile')),
  rules text,
  updated_at timestamptz default now()
);
alter table public.agent_settings enable row level security;
create policy "team all agent_settings" on public.agent_settings for all to authenticated using (true) with check (true);
