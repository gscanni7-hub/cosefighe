import { useEffect, useState, type FormEvent } from 'react'
import { ArrowUpRight, Check, Eye, EyeOff, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { AdminEmpty, AdminLayout, Badge, Button, Card, Input, Notice, PageHeader, Select, Textarea } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { deleteEvent, fetchEvents, saveEvent, type DbEvent } from '../../lib/db'
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABELS } from '../../data/events'
import type { EventCategory } from '../../types'

type Tab = 'bozza' | 'approvato' | 'passati'

const TABS: { key: Tab; label: string }[] = [
  { key: 'bozza', label: 'Da approvare' },
  { key: 'approvato', label: 'In programma' },
  { key: 'passati', label: 'Passati' },
]

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const fmt = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })

const empty: DbEvent = { slug: '', title: '', category: 'citta', start_date: '', end_date: null, time: '', place: '', area: '', price: '', blurb: '', url: '', featured: false, status: 'approvato', published: true, source: 'manuale' }

export default function AdminEvents() {
  const [tab, setTab] = useState<Tab>('bozza')
  const [items, setItems] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<DbEvent | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchEvents().then((rows) => {
      setItems(rows)
      setLoading(false)
    })
  }

  useEffect(() => {
    document.title = 'Eventi · Pannello Cose Fighe'
    load()
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const visible = items.filter((e) => {
    const end = e.end_date ?? e.start_date
    if (tab === 'passati') return end < today
    if (end < today) return false
    return e.status === tab
  })

  const set = async (e: DbEvent, patch: Partial<DbEvent>) => {
    const ok = await saveEvent({ ...e, ...patch })
    if (ok) load()
  }

  const remove = async (e: DbEvent) => {
    if (!window.confirm(`Eliminare "${e.title}"?`)) return
    if (await deleteEvent(e.id!)) load()
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!form) return
    setSaving(true)
    const ok = await saveEvent({ ...form, slug: form.slug || slugify(form.title), end_date: form.end_date || null })
    setSaving(false)
    if (ok) {
      setForm(null)
      load()
    }
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Eventi"
        subtitle="Cosa succede a Napoli: le proposte dello scout eventi e quelli che inserisci tu. Vanno online alla pubblicazione notturna."
        action={
          <>
            <div role="group" aria-label="Stato" className="flex gap-1 rounded-full border border-line bg-white p-1">
              {TABS.map((t) => (
                <button key={t.key} type="button" aria-pressed={tab === t.key} onClick={() => setTab(t.key)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-ink text-white' : 'text-ink/65 hover:text-ink'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <Button variant="secondary" onClick={load} title="Aggiorna">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
            <Button onClick={() => setForm({ ...empty, start_date: today })}>
              <Plus size={14} /> Nuovo
            </Button>
          </>
        }
      />

      {!isSupabaseConfigured && <Notice title="Database non collegato">Gli eventi si salvano nel database.</Notice>}

      {form && (
        <Card className="mb-6">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input label="Titolo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <Select label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })}>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {EVENT_CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
            <Input label="Orario (es. 19:00 – 23:00)" value={form.time ?? ''} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <Input label="Data di inizio" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
            <Input label="Data di fine (se dura più giorni)" type="date" value={form.end_date ?? ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            <Input label="Luogo" value={form.place ?? ''} onChange={(e) => setForm({ ...form, place: e.target.value })} />
            <Input label="Zona" value={form.area ?? ''} onChange={(e) => setForm({ ...form, area: e.target.value })} />
            <Input label="Prezzo (es. Gratis, €12)" value={form.price ?? ''} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input label="Link per info o biglietti" value={form.url ?? ''} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            <div className="md:col-span-2">
              <Textarea label="Descrizione (2-3 frasi)" rows={3} value={form.blurb ?? ''} onChange={(e) => setForm({ ...form, blurb: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <Button type="submit" disabled={saving}>
                Salva
              </Button>
              <Button variant="ghost" onClick={() => setForm(null)}>
                Annulla
              </Button>
              <label className="ml-auto flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Da non perdere
              </label>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-ink/45">Caricamento...</p>
      ) : visible.length === 0 ? (
        <AdminEmpty title={tab === 'bozza' ? 'Nessun evento da approvare' : tab === 'approvato' ? 'Nessun evento in programma' : 'Nessun evento passato'} text={tab === 'bozza' ? 'Le proposte dello scout eventi compaiono qui.' : undefined} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((e) => (
            <Card key={e.id} className="p-0">
              <div className="flex gap-4 p-5">
                <div className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-paper py-2 text-center">
                  <span className="text-2xl font-bold leading-none">{new Date(e.start_date + 'T00:00:00').getDate()}</span>
                  <span className="text-[11px] uppercase text-ink/50">{fmt(e.start_date).split(' ')[1]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge>{EVENT_CATEGORY_LABELS[e.category]}</Badge>
                    {e.featured && <Badge tone="orange">da non perdere</Badge>}
                    {e.source && e.source !== 'manuale' && <Badge tone="blue">{e.source}</Badge>}
                    {e.published ? <Badge tone="success"><Eye size={11} /> online</Badge> : <Badge><EyeOff size={11} /> nascosto</Badge>}
                  </div>
                  <h3 className="mt-2 font-semibold leading-snug">{e.title}</h3>
                  <p className="mt-1 text-sm text-ink/60">
                    {[fmt(e.start_date) + (e.end_date ? ` – ${fmt(e.end_date)}` : ''), e.time, e.place, e.price].filter(Boolean).join(' · ')}
                  </p>
                  {e.blurb && <p className="mt-2 text-sm text-ink/70">{e.blurb}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
                {e.url && (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="mr-auto inline-flex items-center gap-1 text-sm font-medium text-ink/70 hover:text-ink">
                    Fonte <ArrowUpRight size={14} />
                  </a>
                )}
                <Button variant="ghost" onClick={() => setForm(e)}>
                  Modifica
                </Button>
                {e.status === 'bozza' ? (
                  <>
                    <Button variant="secondary" onClick={() => set(e, { status: 'scartato', published: false })}>
                      <X size={14} /> Scarta
                    </Button>
                    <Button onClick={() => set(e, { status: 'approvato', published: true })}>
                      <Check size={14} /> Approva
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" onClick={() => set(e, { published: !e.published })}>
                      {e.published ? 'Nascondi' : 'Mostra'}
                    </Button>
                    <Button variant="danger" className="h-9 w-9 px-0" title="Elimina" onClick={() => remove(e)}>
                      <Trash2 size={14} />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
