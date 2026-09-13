-- Contenuti dal database: esperienze con giorni e ordine, eventi in città,
-- commissioni di affiliazione, impostazioni del sito. Eseguire una volta nel SQL Editor.

alter table public.experiences add column if not exists days integer[];
alter table public.experiences add column if not exists sort_order integer default 0;
alter table public.experiences add column if not exists source_url text;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default 'citta' check (category in ('food', 'outdoor', 'sport', 'arte', 'laboratori', 'spettacoli', 'citta')),
  start_date date not null,
  end_date date,
  time text,
  place text,
  area text,
  price text,
  blurb text,
  url text,
  featured boolean default false,
  source text,
  status text not null default 'bozza' check (status in ('bozza', 'approvato', 'scartato')),
  published boolean default false,
  agent_run_id uuid references public.agent_runs (id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists events_dates on public.events (start_date, end_date);
alter table public.events enable row level security;
create policy "public read published events" on public.events for select to anon using (published = true);
create policy "team all events" on public.events for all to authenticated using (true) with check (true);

-- Commissioni reali, inserite a mano ogni mese dai portali partner.
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  month date not null,
  provider text not null check (provider in ('getyourguide', 'viator')),
  bookings integer default 0,
  amount numeric default 0,
  notes text,
  created_at timestamptz default now(),
  unique (month, provider)
);
alter table public.commissions enable row level security;
create policy "team all commissions" on public.commissions for all to authenticated using (true) with check (true);

-- Impostazioni del sito (es. indirizzo del deploy hook di Vercel, tasso di conversione stimato).
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);
alter table public.site_settings enable row level security;
create policy "team all site_settings" on public.site_settings for all to authenticated using (true) with check (true);
