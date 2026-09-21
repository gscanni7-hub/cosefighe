import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowUpRight, Plus } from 'lucide-react'
import { AdminEmpty, AdminLayout, Badge, Button, Card, Input, Notice, PageHeader, Select, Stat, td, th } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { loadAnalytics, type AnalyticsRow } from '../../lib/analytics'
import { fetchCommissions, fetchSiteSettings, saveCommission, saveSiteSetting, type Commission } from '../../lib/db'
import { CATEGORY_LIST } from '../../data/categories'
import { PROVIDER_LABEL, type Provider } from '../../types'

const eur = (n: number) => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const priceOf = (p: string) => Number(p.replace(/[^\d,.]/g, '').replace(',', '.')) || 0

interface ClickRow {
  title: string
  provider: Provider | 'sconosciuto'
  clicks: number
  price: number
}

/**
 * Click verso GetYourGuide e Viator: si riconoscono dal link in uscita registrato per ogni clic, così contano
 * anche quelli dalla scheda e quelli fatti prima che la pagina finisca di caricarsi (il segnale "prenota" della
 * card non arriva sempre). L'esperienza si ritrova confrontando il link con quelli del catalogo.
 */
function clicksByExperience(rows: AnalyticsRow[]): ClickRow[] {
  const map = new Map<string, ClickRow>()
  const catalog: { base: string; title: string; provider: Provider; price: number }[] = []
  for (const c of CATEGORY_LIST)
    for (const e of c.experiences)
      if (e.affiliateUrl && e.provider && e.provider !== 'cosefighe') catalog.push({ base: e.affiliateUrl.split('?')[0], title: e.title, provider: e.provider, price: priceOf(e.price) })
  for (const r of rows) {
    if (r.type !== 'click') continue
    const href = String(r.meta?.href ?? '')
    if (!/getyourguide\.|viator\./.test(href)) continue
    // Il link registrato è tagliato a 120 caratteri: basta che sia l'inizio di quello a catalogo.
    const path = href.split('?')[0]
    const exp = path.length >= 40 ? catalog.find((e) => e.base.startsWith(path)) : undefined
    const provider = exp?.provider ?? (href.includes('viator.') ? 'viator' : 'getyourguide')
    const title = exp?.title ?? (r.name?.startsWith('prenota:') ? r.name.slice(8) : path)
    const key = `${provider}|${title}`
    const cur = map.get(key) ?? { title, provider, clicks: 0, price: exp?.price ?? 0 }
    cur.clicks++
    map.set(key, cur)
  }
  return [...map.values()].sort((a, b) => b.clicks - a.clicks)
}

export default function AdminAffiliation() {
  const [days, setDays] = useState(30)
  const [rows, setRows] = useState<AnalyticsRow[]>([])
  const [sessions, setSessions] = useState(0)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [conv, setConv] = useState(3)
  const [rate, setRate] = useState(8)
  const [form, setForm] = useState<{ month: string; provider: Provider; bookings: string; amount: string }>({ month: new Date().toISOString().slice(0, 7), provider: 'getyourguide', bookings: '', amount: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = 'Affiliazione · Pannello Cose Fighe'
    if (!isSupabaseConfigured) return
    loadAnalytics(days).then(({ rows }) => {
      setRows(rows)
      setSessions(new Set(rows.map((r) => r.session)).size)
    })
    fetchCommissions().then(setCommissions)
    fetchSiteSettings().then((s) => {
      if (s.conversion_rate) setConv(Number(s.conversion_rate))
      if (s.commission_rate) setRate(Number(s.commission_rate))
    })
  }, [days])

  const clicks = useMemo(() => clicksByExperience(rows), [rows])
  const totalClicks = clicks.reduce((n, c) => n + c.clicks, 0)
  const byProvider = (p: Provider) => clicks.filter((c) => c.provider === p).reduce((n, c) => n + c.clicks, 0)
  const estimate = (c: ClickRow) => (c.clicks * (conv / 100) * c.price * rate) / 100
  const totalEstimate = clicks.reduce((n, c) => n + estimate(c), 0)
  const realTotal = commissions.reduce((n, c) => n + Number(c.amount), 0)

  const saveRates = async () => {
    await saveSiteSetting('conversion_rate', String(conv))
    await saveSiteSetting('commission_rate', String(rate))
  }

  const addCommission = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const ok = await saveCommission({ month: form.month + '-01', provider: form.provider, bookings: Number(form.bookings) || 0, amount: Number(form.amount.replace(',', '.')) || 0 })
    setSaving(false)
    if (ok) {
      setCommissions(await fetchCommissions())
      setForm({ ...form, bookings: '', amount: '' })
    }
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Affiliazione"
        subtitle="Chi clicca su Prenota, quanto potrebbe rendere, quanto ha reso davvero."
        action={
          <div role="group" aria-label="Periodo" className="flex gap-1 rounded-full border border-line bg-white p-1">
            {[7, 30, 90].map((d) => (
              <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${days === d ? 'bg-ink text-white' : 'text-ink/65 hover:text-ink'}`}>
                {d} giorni
              </button>
            ))}
          </div>
        }
      />

      {!isSupabaseConfigured && <Notice title="Database non collegato">I click e le commissioni si leggono dal database.</Notice>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Click su Prenota" value={totalClicks.toLocaleString('it-IT')} hint={`${sessions ? Math.round((totalClicks / sessions) * 1000) / 10 : 0}% delle visite`} />
        <Stat label="GetYourGuide" value={byProvider('getyourguide').toLocaleString('it-IT')} hint="click" />
        <Stat label="Viator" value={byProvider('viator').toLocaleString('it-IT')} hint="click" />
        <Stat label="Guadagno stimato" value={eur(totalEstimate)} hint={`con ${conv}% di conversione e ${rate}% di commissione`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
            <p className="text-sm font-semibold">Esperienze più cliccate</p>
            <span className="text-xs text-ink/45">stima = click × conversione × prezzo × commissione</span>
          </div>
          {clicks.length === 0 ? (
            <p className="px-6 py-8 text-sm text-ink/45">Nessun click su Prenota ancora. Compaiono appena le esperienze hanno il link di affiliazione.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead className="border-b border-line">
                  <tr>
                    <th className={th}>Esperienza</th>
                    <th className={th}>Piattaforma</th>
                    <th className={`${th} text-right`}>Click</th>
                    <th className={`${th} text-right`}>Prezzo</th>
                    <th className={`${th} text-right`}>Stima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {clicks.map((c) => (
                    <tr key={c.provider + c.title}>
                      <td className={td}>{c.title}</td>
                      <td className={td}>{c.provider === 'sconosciuto' ? <Badge>—</Badge> : <Badge tone={c.provider === 'viator' ? 'blue' : 'orange'}>{PROVIDER_LABEL[c.provider]}</Badge>}</td>
                      <td className={`${td} text-right font-semibold tabular-nums`}>{c.clicks}</td>
                      <td className={`${td} text-right tabular-nums`}>{c.price ? eur(c.price) : '—'}</td>
                      <td className={`${td} text-right tabular-nums text-ink/70`}>{eur(estimate(c))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="text-sm font-semibold">Parametri della stima</p>
            <p className="mt-1 text-xs text-ink/45">Le piattaforme dichiarano il 2-5% di conversione sui click. Aggiorna con i tuoi numeri reali.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Input label="Conversione %" type="number" min={0} max={100} step={0.5} value={conv} onChange={(e) => setConv(Number(e.target.value))} />
              <Input label="Commissione %" type="number" min={0} max={100} step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
            </div>
            <Button variant="secondary" className="mt-4" onClick={saveRates}>
              Salva parametri
            </Button>
          </Card>

          <Card>
            <p className="text-sm font-semibold">Commissioni reali</p>
            <p className="mt-1 text-xs text-ink/45">
              Le vendite le vedono solo i portali partner: ogni mese copia qui il totale dai loro rapporti.
              <a href="https://partner.getyourguide.com" target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 text-orange">
                GetYourGuide <ArrowUpRight size={11} />
              </a>
            </p>
            <form onSubmit={addCommission} className="mt-4 grid grid-cols-2 gap-3">
              <Input label="Mese" type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required />
              <Select label="Piattaforma" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value as Provider })}>
                <option value="getyourguide">GetYourGuide</option>
                <option value="viator">Viator</option>
              </Select>
              <Input label="Prenotazioni" type="number" min={0} value={form.bookings} onChange={(e) => setForm({ ...form, bookings: e.target.value })} />
              <Input label="Importo €" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              <div className="col-span-2">
                <Button type="submit" disabled={saving}>
                  <Plus size={14} /> Registra
                </Button>
              </div>
            </form>
            {commissions.length === 0 ? (
              <p className="mt-4 text-sm text-ink/45">Nessuna commissione registrata.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line text-sm">
                {commissions.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2">
                    <span>
                      {new Date(c.month).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })} · {PROVIDER_LABEL[c.provider]}
                      <span className="ml-2 text-ink/45">{c.bookings} prenotazioni</span>
                    </span>
                    <span className="font-semibold tabular-nums">{eur(Number(c.amount))}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between py-2 font-semibold">
                  <span>Totale reale</span>
                  <span className="tabular-nums">{eur(realTotal)}</span>
                </li>
              </ul>
            )}
          </Card>
        </div>
      </div>

      {clicks.length === 0 && totalClicks === 0 && commissions.length === 0 && isSupabaseConfigured && (
        <div className="mt-6">
          <AdminEmpty title="Ancora niente da misurare" text="Quando le esperienze avranno il link di affiliazione, qui vedi ogni click e la stima del guadagno." />
        </div>
      )}
    </AdminLayout>
  )
}
