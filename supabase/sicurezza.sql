-- Sicurezza del database di Cose Fighe.
-- Da eseguire UNA VOLTA nel SQL Editor di Supabase (Dashboard → SQL Editor → New query → incolla → Run).
--
-- Cosa fa: oggi ogni utente "autenticato" può leggere e scrivere tutto. Con la registrazione
-- aperta, chiunque potrebbe crearsi un account e diventare amministratore. Da adesso i permessi
-- di scrittura e di lettura delle tabelle riservate valgono SOLO per gli indirizzi email elencati
-- in admin_emails(). La chiave pubblica del sito continua a leggere solo i contenuti pubblicati
-- e a inserire lead e dati di navigazione, come prima.
--
-- Per aggiungere un collaboratore: aggiungi la sua email nell'elenco qui sotto e riesegui.

create or replace function public.admin_emails()
returns text[]
language sql
immutable
as $$
  select array['g.scanni7@gmail.com'];
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') = any (select lower(unnest(public.admin_emails())));
$$;

-- Le policy "team" (per authenticated) diventano "solo amministratori".
drop policy if exists "team all experiences" on public.experiences;
create policy "admin all experiences" on public.experiences for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team all articles" on public.articles;
create policy "admin all articles" on public.articles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team all leads" on public.leads;
create policy "admin all leads" on public.leads for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team read analytics" on public.analytics_events;
create policy "admin read analytics" on public.analytics_events for select to authenticated using (public.is_admin());
drop policy if exists "team delete analytics" on public.analytics_events;
create policy "admin delete analytics" on public.analytics_events for delete to authenticated using (public.is_admin());

drop policy if exists "team all agent_runs" on public.agent_runs;
create policy "admin all agent_runs" on public.agent_runs for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team all drafts" on public.experience_drafts;
create policy "admin all drafts" on public.experience_drafts for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team all agent_settings" on public.agent_settings;
create policy "admin all agent_settings" on public.agent_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team all events" on public.events;
create policy "admin all events" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team all commissions" on public.commissions;
create policy "admin all commissions" on public.commissions for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team all site_settings" on public.site_settings;
create policy "admin all site_settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Controllo: deve restituire una riga per tabella con la nuova policy "admin …".
select tablename, policyname from pg_policies where schemaname = 'public' and policyname like 'admin %' order by tablename;
