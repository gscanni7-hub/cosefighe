import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, BarChart3, FileText, Inbox, Plus, Sparkles, Users } from 'lucide-react'
import { AdminLayout, Badge, Card, Notice, PageHeader, Stat } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { fetchLeads, fetchStats, type Stats } from '../../lib/db'
import type { Lead } from '../../types'

const shortcuts = [
  { to: '/admin/bozze', label: 'Approva le bozze', icon: Inbox },
  { to: '/admin/esperienze/new', label: 'Nuova esperienza', icon: Sparkles },
  { to: '/admin/articoli/new', label: 'Nuovo articolo', icon: FileText },
  { to: '/admin/lead', label: 'Leggi i lead', icon: Users },
  { to: '/admin/dati', label: 'Guarda i dati', icon: BarChart3 },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ experiences: 0, articles: 0, leads: 0, unread: 0 })
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Pannello · Cose Fighe'
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    Promise.all([fetchStats(), fetchLeads()]).then(([s, leads]) => {
      setStats(s)
      setRecentLeads(leads.slice(0, 5))
      setLoading(false)
    })
  }, [])

  const v = (n: number) => (loading ? '–' : n.toLocaleString('it-IT'))

  return (
    <AdminLayout>
      <PageHeader title="Buongiorno" subtitle="Ecco come sta il sito oggi." />

      {!isSupabaseConfigured && (
        <Notice title="Database non collegato">
          Il pannello funziona in anteprima. Per salvare esperienze, articoli e lead servono le due variabili di Supabase nel file <code className="rounded bg-white px-1">.env</code> e su Vercel, poi lo schema in <code className="rounded bg-white px-1">supabase/schema.sql</code>.
        </Notice>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Esperienze" value={v(stats.experiences)} />
        <Stat label="Articoli" value={v(stats.articles)} />
        <Stat label="Lead" value={v(stats.leads)} />
        <Stat label="Da leggere" value={v(stats.unread)} hint={stats.unread > 0 ? 'ci sono messaggi nuovi' : undefined} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-2">
          <p className="px-4 pb-1 pt-3 text-sm font-semibold">Scorciatoie</p>
          <ul>
            {shortcuts.map((s) => (
              <li key={s.to}>
                <Link to={s.to} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-paper">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-orange">
                    <s.icon size={15} />
                  </span>
                  <span className="flex-1">{s.label}</span>
                  {s.to.endsWith('/new') ? <Plus size={15} className="text-ink/35" /> : <ArrowRight size={15} className="text-ink/35" />}
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between px-6 pt-5">
            <p className="text-sm font-semibold">Ultimi lead</p>
            <Link to="/admin/lead" className="text-sm font-medium text-orange hover:underline">
              Vedi tutti
            </Link>
          </div>
          {!isSupabaseConfigured ? (
            <p className="px-6 py-8 text-sm text-ink/45">I messaggi dei moduli compariranno qui.</p>
          ) : recentLeads.length === 0 ? (
            <p className="px-6 py-8 text-sm text-ink/45">Nessun lead ancora.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{lead.name || 'Senza nome'}</p>
                    <p className="truncate text-xs text-ink/45">{lead.email}</p>
                  </div>
                  {lead.read ? <Badge>Letto</Badge> : <Badge tone="orange">Nuovo</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
