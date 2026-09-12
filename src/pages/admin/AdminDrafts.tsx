import { useEffect, useState } from 'react'
import { ArrowUpRight, Check, RefreshCw, X } from 'lucide-react'
import { AdminEmpty, AdminLayout, Badge, Button, Card, Notice, PageHeader } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { approveDraft, fetchAgentRuns, fetchDrafts, setDraftStatus } from '../../lib/db'
import { CATEGORIES } from '../../data/categories'
import { PROVIDER_LABEL, type AgentRun, type DraftStatus, type ExperienceDraft } from '../../types'

const TABS: { key: DraftStatus; label: string }[] = [
  { key: 'bozza', label: 'Da approvare' },
  { key: 'approvata', label: 'Approvate' },
  { key: 'scartata', label: 'Scartate' },
]

const when = (iso: string) => new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function AdminDrafts() {
  const [tab, setTab] = useState<DraftStatus>('bozza')
  const [items, setItems] = useState<ExperienceDraft[]>([])
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = (status: DraftStatus) => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([fetchDrafts(status), fetchAgentRuns(5)]).then(([d, r]) => {
      setItems(d)
      setRuns(r)
      setLoading(false)
    })
  }

  useEffect(() => {
    document.title = 'Bozze · Pannello Cose Fighe'
    load(tab)
  }, [tab])

  const approve = async (d: ExperienceDraft) => {
    setBusy(d.id)
    const ok = await approveDraft(d)
    setBusy(null)
    if (ok) setItems((prev) => prev.filter((x) => x.id !== d.id))
    else window.alert('Non sono riuscito ad approvare la bozza. Controlla la console.')
  }

  const reject = async (d: ExperienceDraft) => {
    const notes = window.prompt('Perché la scarti? (facoltativo, aiuta a migliorare le regole)', '') ?? undefined
    setBusy(d.id)
    const ok = await setDraftStatus(d.id, 'scartata', notes)
    setBusy(null)
    if (ok) setItems((prev) => prev.filter((x) => x.id !== d.id))
  }

  const restore = async (d: ExperienceDraft) => {
    setBusy(d.id)
    const ok = await setDraftStatus(d.id, 'bozza')
    setBusy(null)
    if (ok) setItems((prev) => prev.filter((x) => x.id !== d.id))
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Bozze"
        subtitle="Le esperienze proposte dallo scout. Niente va online senza il tuo sì."
        action={
          <>
            <div role="group" aria-label="Stato" className="flex gap-1 rounded-full border border-line bg-white p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.key ? 'bg-ink text-white' : 'text-ink/65 hover:text-ink'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Button variant="secondary" onClick={() => load(tab)} title="Aggiorna">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </>
        }
      />

      {!isSupabaseConfigured && (
        <Notice title="Database non collegato">
          Le bozze degli agenti arrivano qui quando Supabase è attivo. Finché non lo è, lo scout può comunque lavorare: salva le proposte nel repository e apre una pull request su GitHub.
        </Notice>
      )}

      {runs.length > 0 && (
        <Card className="mb-6 p-0">
          <p className="px-6 pt-5 text-sm font-semibold">Ultime esecuzioni degli agenti</p>
          <ul className="mt-2 divide-y divide-line">
            {runs.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-6 py-3 text-sm">
                <span className="font-medium">{r.agent}</span>
                <span className="text-ink/45">{when(r.started_at)}</span>
                <Badge tone={r.status === 'ok' ? 'success' : r.status === 'errore' ? 'warning' : 'neutral'}>{r.status}</Badge>
                {r.items != null && <span className="text-ink/60">{r.items} proposte</span>}
                {r.summary && <span className="min-w-0 flex-1 truncate text-ink/60">{r.summary}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-ink/45">Caricamento...</p>
      ) : items.length === 0 ? (
        <AdminEmpty
          title={tab === 'bozza' ? 'Nessuna bozza da approvare' : tab === 'approvata' ? 'Nessuna bozza approvata' : 'Nessuna bozza scartata'}
          text={tab === 'bozza' ? 'Quando lo scout troverà esperienze in linea con le regole, compariranno qui.' : undefined}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((d) => (
            <Card key={d.id} className="p-0">
              <div className="grid grid-cols-[7rem_1fr] gap-4 p-4 md:grid-cols-[9rem_1fr] md:p-5">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-cream">
                  {d.image && <img src={d.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={d.provider === 'viator' ? 'blue' : 'orange'}>{PROVIDER_LABEL[d.provider]}</Badge>
                    <Badge>{CATEGORIES[d.category_slug]?.label ?? d.category_slug}</Badge>
                    {d.score != null && <Badge tone={d.score >= 70 ? 'success' : 'neutral'}>punteggio {d.score}</Badge>}
                  </div>
                  <h3 className="mt-2 font-semibold leading-snug">{d.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-ink/45">originale: {d.original_title}</p>
                  <p className="mt-2 text-sm text-ink/60">
                    {[d.price && `da ${d.price}`, d.duration, d.group_size && `fino a ${d.group_size} persone`, d.languages?.join('/')].filter(Boolean).join(' · ')}
                  </p>
                  {d.rating != null && (
                    <p className="mt-1 text-xs text-ink/45">
                      {d.rating.toLocaleString('it-IT')} su {d.reviews?.toLocaleString('it-IT') ?? 0} recensioni sulla piattaforma
                    </p>
                  )}
                </div>
              </div>
              <div className="border-t border-line px-5 py-4">
                <p className="text-sm leading-relaxed text-ink/75">{d.description}</p>
                {d.reason && (
                  <p className="mt-3 text-xs text-ink/55">
                    <span className="font-semibold text-ink/70">Perché la propongo:</span> {d.reason}
                    {d.rule_matched && <span className="text-ink/40"> · regola: {d.rule_matched}</span>}
                  </p>
                )}
                {d.notes && tab === 'scartata' && (
                  <p className="mt-2 text-xs text-ink/55">
                    <span className="font-semibold text-ink/70">Nota:</span> {d.notes}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
                <a href={d.source_url} target="_blank" rel="noopener noreferrer" className="mr-auto inline-flex items-center gap-1 text-sm font-medium text-ink/70 hover:text-ink">
                  Vedi sulla piattaforma <ArrowUpRight size={14} />
                </a>
                {tab === 'bozza' ? (
                  <>
                    <Button variant="secondary" disabled={busy === d.id} onClick={() => reject(d)}>
                      <X size={14} /> Scarta
                    </Button>
                    <Button disabled={busy === d.id} onClick={() => approve(d)}>
                      <Check size={14} /> Approva
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" disabled={busy === d.id} onClick={() => restore(d)}>
                    Rimetti tra le bozze
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
