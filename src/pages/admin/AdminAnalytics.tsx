import { useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { AdminLayout, Button, Card, Notice, PageHeader, Stat } from './ui'
import { loadAnalytics, summarize, type Ranked, type Summary } from '../../lib/analytics'

const RANGES = [
  { days: 7, label: '7 giorni' },
  { days: 30, label: '30 giorni' },
  { days: 90, label: '90 giorni' },
]

const fmt = (n: number) => n.toLocaleString('it-IT')
const secs = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`)
const dayLabel = (iso: string) => {
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} ${['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'][d.getMonth()]}`
}

/** Grafico a barre: sessioni per giorno. Una serie, un colore, etichette dirette su massimo e ultimo. */
function DayChart({ data }: { data: Summary['byDay'] }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 720
  const H = 200
  const padL = 32
  const padB = 24
  const padT = 18
  const max = Math.max(1, ...data.map((d) => d.sessions))
  const step = (W - padL) / data.length
  const barW = Math.max(3, Math.min(22, step * 0.6))
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max)
  const maxIdx = data.reduce((m, d, i) => (d.sessions > data[m].sessions ? i : m), 0)
  const ticks = [0, Math.round(max / 2), max]
  const every = data.length > 40 ? 14 : data.length > 14 ? 7 : 1

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Sessioni per giorno">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="rgba(17,17,17,0.08)" strokeWidth={1} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="rgba(17,17,17,0.45)">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padL + i * step + (step - barW) / 2
          const top = y(d.sessions)
          const h = Math.max(0, H - padB - top)
          const active = hover === i
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={padL + i * step} y={padT} width={step} height={H - padT - padB} fill="transparent" />
              <rect x={x} y={top} width={barW} height={h} rx={Math.min(4, barW / 2)} fill={active ? '#111111' : '#ff5500'} />
              {(i === maxIdx || i === data.length - 1) && d.sessions > 0 && (
                <text x={x + barW / 2} y={top - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="#111111">
                  {d.sessions}
                </text>
              )}
              {i % every === 0 && (
                <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="rgba(17,17,17,0.45)">
                  {dayLabel(d.day)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -top-2 rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-soft"
          style={{ left: `${((padL + hover * step + step / 2) / W) * 100}%`, transform: 'translate(-50%, -100%)' }}
        >
          <p className="font-semibold">{dayLabel(data[hover].day)}</p>
          <p className="text-white/80">
            {data[hover].sessions} sessioni · {data[hover].pageviews} pagine
          </p>
        </div>
      )}
    </div>
  )
}

/** Elenco con barre orizzontali: un colore, valore a destra. */
function Bars({ items, unit = '', empty = 'Ancora niente' }: { items: Ranked[]; unit?: string; empty?: string }) {
  if (!items.length) return <p className="text-sm text-ink/45">{empty}</p>
  const max = Math.max(...items.map((i) => i.value))
  return (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate" title={it.name}>
                {it.name}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-paper">
              <div className="h-full rounded-full bg-orange" style={{ width: `${Math.max(3, (it.value / max) * 100)}%` }} />
            </div>
          </div>
          <span className="w-16 text-right font-semibold tabular-nums">
            {fmt(it.value)}
            {unit}
          </span>
        </li>
      ))}
    </ul>
  )
}

const DEVICE_LABEL: Record<string, string> = { mobile: 'Telefono', desktop: 'Computer', tablet: 'Tablet' }
const DEVICE_COLOR: Record<string, string> = { mobile: '#ff5500', desktop: '#0055ff', tablet: '#111111' }

function Devices({ items }: { items: Ranked[] }) {
  const total = items.reduce((n, i) => n + i.value, 0) || 1
  const order = ['mobile', 'desktop', 'tablet'].map((k) => items.find((i) => i.name === k) ?? { name: k, value: 0 })
  return (
    <div>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
        {order.map((d) => (
          <div key={d.name} style={{ width: `${(d.value / total) * 100}%`, background: DEVICE_COLOR[d.name] }} title={`${DEVICE_LABEL[d.name]}: ${Math.round((d.value / total) * 100)}%`} />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-3 gap-3 text-sm">
        {order.map((d) => (
          <li key={d.name}>
            <span className="flex items-center gap-2 text-ink/60">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: DEVICE_COLOR[d.name] }} />
              {DEVICE_LABEL[d.name]}
            </span>
            <span className="mt-0.5 block text-lg font-semibold tabular-nums">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function AdminAnalytics() {
  const [days, setDays] = useState(30)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  const load = (d: number) => {
    setLoading(true)
    loadAnalytics(d).then(({ rows, demo }) => {
      setSummary(summarize(rows, d, demo))
      setLoading(false)
    })
  }

  useEffect(() => {
    document.title = 'Dati · Pannello Cose Fighe'
    load(days)
  }, [days])

  const s = summary
  const pageShare = useMemo(() => (s ? s.topPages.map((p) => ({ ...p, extra: Math.round((p.value / Math.max(1, s.pageviews)) * 100) })) : []), [s])

  return (
    <AdminLayout>
      <PageHeader
        title="Dati"
        subtitle="Chi arriva, cosa guarda, dove clicca, dove si ferma. Senza cookie e senza dati personali."
        action={
          <>
            <div role="group" aria-label="Periodo" className="flex gap-1 rounded-full border border-line bg-white p-1">
              {RANGES.map((r) => (
                <button
                  key={r.days}
                  type="button"
                  aria-pressed={days === r.days}
                  onClick={() => setDays(r.days)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${days === r.days ? 'bg-ink text-white' : 'text-ink/65 hover:text-ink'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Button variant="secondary" onClick={() => load(days)} title="Aggiorna">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </>
        }
      />

      {s?.demo && (
        <Notice title="Nessun dato ancora">
          Il database non è collegato, quindi la misurazione non salva niente e i numeri restano a zero. Appena Supabase è attivo, i visitatori iniziano a comparire qui da soli.
        </Notice>
      )}

      {!s ? (
        <p className="text-sm text-ink/45">Caricamento...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Visite" value={fmt(s.sessions)} hint={`negli ultimi ${days} giorni`} />
            <Stat label="Pagine viste" value={fmt(s.pageviews)} hint={`${s.pagesPerSession} a visita`} />
            <Stat label="Tempo medio per pagina" value={secs(s.avgSeconds)} />
            <Stat label="Scorrimento medio" value={`${s.avgScroll}%`} hint="della pagina, in media" />
          </div>

          <Card>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-semibold">Visite al giorno</h2>
              <span className="text-xs text-ink/45">una visita = una sessione del browser</span>
            </div>
            <DayChart data={s.byDay} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 font-semibold">Pagine più viste</h2>
              <Bars items={pageShare} empty="Nessuna visita registrata" />
            </Card>
            <Card>
              <h2 className="mb-1 font-semibold">Dove cliccano</h2>
              <p className="mb-4 text-xs text-ink/45">pulsanti e link, per numero di click · ↗ = link esterno</p>
              <Bars items={s.topClicks} empty="Nessun click registrato" />
            </Card>
            <Card>
              <h2 className="mb-1 font-semibold">Dove si fermano</h2>
              <p className="mb-4 text-xs text-ink/45">sezioni del sito, secondi medi con la sezione in vista</p>
              <Bars items={s.dwell} unit=" s" empty="Nessuna sezione misurata" />
            </Card>
            <Card>
              <h2 className="mb-1 font-semibold">Quanto scorrono</h2>
              <p className="mb-4 text-xs text-ink/45">profondità media raggiunta, per pagina</p>
              <Bars items={s.scrollByPage} unit="%" empty="Nessuna pagina misurata" />
            </Card>
            <Card>
              <h2 className="mb-4 font-semibold">Da dove arrivano</h2>
              <Bars items={s.referrers} empty="Nessuna provenienza registrata" />
            </Card>
            <Card>
              <h2 className="mb-4 font-semibold">Dispositivi</h2>
              <Devices items={s.devices} />
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
