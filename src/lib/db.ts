import { getSupabase } from './supabase'
import type { AgentRun, DbArticle, DbExperience, DraftStatus, Experience, ExperienceDraft, Lead } from '../types'

export function mapDbExperience(e: DbExperience): Experience {
  return {
    title: e.title,
    duration: e.duration ?? '',
    group: e.group_size ?? '',
    rating: e.rating ?? 4.5,
    reviews: e.reviews ?? 0,
    price: e.price ?? '',
    tag: e.tag ?? '',
    color: e.color ?? 'white',
    image: e.image ?? '',
    location: e.location ?? '',
    included: e.included ?? '',
    provider: e.provider,
    providerId: e.provider_id,
    affiliateUrl: e.affiliate_url,
    languages: e.languages,
    cancellation: e.cancellation,
  }
}

/* ---- Esperienze ---- */

export async function fetchExperiencesByCategory(slug: string): Promise<DbExperience[] | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('category_slug', slug)
    .eq('published', true)
    .order('created_at', { ascending: true })
  if (error) {
    console.error(error)
    return null
  }
  return data as DbExperience[]
}

export async function fetchAllExperiences(): Promise<DbExperience[]> {
  const supabase = await getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase.from('experiences').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error(error)
    return []
  }
  return data as DbExperience[]
}

export async function saveExperience(exp: DbExperience): Promise<DbExperience | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  const payload = { ...exp, updated_at: new Date().toISOString() }
  const query = exp.id
    ? supabase.from('experiences').update(payload).eq('id', exp.id).select().single()
    : supabase.from('experiences').insert(payload).select().single()
  const { data, error } = await query
  if (error) {
    console.error(error)
    return null
  }
  return data as DbExperience
}

export async function deleteExperience(id: string): Promise<boolean> {
  const supabase = await getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from('experiences').delete().eq('id', id)
  if (error) {
    console.error(error)
    return false
  }
  return true
}

/* ---- Articoli ---- */

export async function fetchAllArticles(): Promise<DbArticle[]> {
  const supabase = await getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error(error)
    return []
  }
  return data as DbArticle[]
}

export async function saveArticle(article: DbArticle): Promise<DbArticle | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  const payload = { ...article, updated_at: new Date().toISOString() }
  const query = article.id
    ? supabase.from('articles').update(payload).eq('id', article.id).select().single()
    : supabase.from('articles').insert(payload).select().single()
  const { data, error } = await query
  if (error) {
    console.error(error)
    return null
  }
  return data as DbArticle
}

export async function deleteArticle(id: string): Promise<boolean> {
  const supabase = await getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from('articles').delete().eq('id', id)
  if (error) {
    console.error(error)
    return false
  }
  return true
}

/* ---- Lead ---- */

export interface NewLead {
  name: string
  email: string
  topic: string
  message: string
  source?: string
}

export async function createLead(lead: NewLead): Promise<boolean> {
  const supabase = await getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from('leads').insert({ ...lead, source: lead.source ?? 'contatti' })
  if (error) {
    console.error(error)
    return false
  }
  return true
}

export async function fetchLeads(): Promise<Lead[]> {
  const supabase = await getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error(error)
    return []
  }
  return data as Lead[]
}

export async function markLeadRead(id: string): Promise<void> {
  const supabase = await getSupabase()
  if (!supabase) return
  await supabase.from('leads').update({ read: true }).eq('id', id)
}

export async function deleteLead(id: string): Promise<boolean> {
  const supabase = await getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) {
    console.error(error)
    return false
  }
  return true
}

/* ---- Statistiche ---- */

export interface Stats {
  experiences: number
  articles: number
  leads: number
  unread: number
}

export async function fetchStats(): Promise<Stats> {
  const supabase = await getSupabase()
  if (!supabase) return { experiences: 0, articles: 0, leads: 0, unread: 0 }
  const [exp, art, leads, unread] = await Promise.all([
    supabase.from('experiences').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('read', false),
  ])
  return {
    experiences: exp.count ?? 0,
    articles: art.count ?? 0,
    leads: leads.count ?? 0,
    unread: unread.count ?? 0,
  }
}

/* ---- Bozze proposte dagli agenti ---- */

export async function fetchDrafts(status?: DraftStatus): Promise<ExperienceDraft[]> {
  const supabase = await getSupabase()
  if (!supabase) return []
  let q = supabase.from('experience_drafts').select('*').order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) {
    console.error(error)
    return []
  }
  return data as ExperienceDraft[]
}

export async function setDraftStatus(id: string, status: DraftStatus, notes?: string): Promise<boolean> {
  const supabase = await getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from('experience_drafts').update({ status, notes: notes ?? null }).eq('id', id)
  if (error) console.error(error)
  return !error
}

/** Approva una bozza: la copia tra le esperienze (non ancora pubblicata) e la segna come approvata. */
export async function approveDraft(d: ExperienceDraft): Promise<boolean> {
  const saved = await saveExperience({
    title: d.title,
    category_slug: d.category_slug,
    duration: d.duration ?? '',
    group_size: d.group_size ?? '',
    rating: d.rating ?? 4.8,
    reviews: d.reviews ?? 0,
    price: d.price ?? '',
    tag: '',
    color: 'white',
    image: d.image ?? '',
    location: d.location ?? '',
    included: d.included ?? '',
    published: false,
    provider: d.provider,
    provider_id: d.provider_id,
    affiliate_url: d.affiliate_url,
    languages: d.languages ?? undefined,
    cancellation: d.cancellation ?? undefined,
  })
  if (!saved) return false
  return setDraftStatus(d.id, 'approvata')
}

export async function fetchAgentRuns(limit = 20): Promise<AgentRun[]> {
  const supabase = await getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase.from('agent_runs').select('*').order('started_at', { ascending: false }).limit(limit)
  if (error) {
    console.error(error)
    return []
  }
  return data as AgentRun[]
}

/* ---- Impostazioni degli agenti (sezione "Agenti" del pannello) ---- */

import type { AgentSettings } from '../data/agents'

export async function fetchAgentSettings(): Promise<{ rows: AgentSettings[]; available: boolean }> {
  const supabase = await getSupabase()
  if (!supabase) return { rows: [], available: false }
  const { data, error } = await supabase.from('agent_settings').select('*')
  if (error) {
    console.error(error)
    return { rows: [], available: false }
  }
  return { rows: (data ?? []) as AgentSettings[], available: true }
}

export async function saveAgentSettings(s: AgentSettings): Promise<boolean> {
  const supabase = await getSupabase()
  if (!supabase) return false
  const { error } = await supabase.from('agent_settings').upsert({ ...s, updated_at: new Date().toISOString() }, { onConflict: 'agent' })
  if (error) console.error(error)
  return !error
}
