import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { CircleCheckBig, FileText, Mail, Plus, Users, Zap } from 'lucide-react'
import { AdminLayout, Card, PageHeader } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { fetchLeads, fetchStats, type Stats } from '../../lib/db'
import type { Lead } from '../../types'

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ experiences: 0, articles: 0, leads: 0, unread: 0 })
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Dashboard — Admin Cose Fighe'
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

  const tiles = [
    { label: 'Esperienze', value: stats.experiences, icon: Zap, color: 'bg-[#FF5500]', to: '/admin/esperienze' },
    { label: 'Articoli', value: stats.articles, icon: FileText, color: 'bg-[#0055FF]', to: '/admin/articoli' },
    { label: 'Lead totali', value: stats.leads, icon: Users, color: 'bg-[#111111]', to: '/admin/lead' },
    { label: 'Lead non letti', value: stats.unread, icon: Mail, color: 'bg-black', to: '/admin/lead' },
  ]

  return (
    <AdminLayout>
      <PageHeader title="Dashboard" subtitle="Benvenuto nel pannello di amministrazione di Cose Fighe" />

      {!isSupabaseConfigured && (
        <Card className="mb-8 bg-yellow-50 border-yellow-400">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 text-black font-bold">
              !
            </div>
            <div>
              <h3 className="font-bold uppercase text-sm mb-1">Supabase non configurato</h3>
              <p className="text-sm text-black/60 mb-3">
                Aggiungi le variabili d'ambiente nel file{' '}
                <code className="bg-yellow-100 px-1 rounded">.env</code> per attivare il database.
              </p>
              <pre className="bg-yellow-100 rounded-lg p-3 text-xs font-mono">
                {`VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
              </pre>
              <p className="text-xs text-black/40 mt-2">
                Poi esegui lo schema SQL in <code>supabase/schema.sql</code> nel tuo progetto Supabase.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to}>
            <Card className={`${t.color} text-white border-black hover:-translate-y-1 transition-transform cursor-pointer`}>
              <t.icon size={24} className="mb-3 opacity-80" />
              <div className="font-display text-4xl mb-1">{loading ? '—' : t.value}</div>
              <div className="font-sans text-xs font-bold uppercase tracking-wider opacity-70">{t.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="font-display text-2xl uppercase mb-4">Azioni rapide</h2>
          <div className="space-y-3">
            <Link
              to="/admin/esperienze/new"
              className="flex items-center gap-3 w-full px-5 py-3 rounded-xl border-2 border-black bg-[#FF5500] text-white font-bold uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
            >
              <Plus size={14} /> Nuova Esperienza
            </Link>
            <Link
              to="/admin/articoli/new"
              className="flex items-center gap-3 w-full px-5 py-3 rounded-xl border-2 border-black bg-[#0055FF] text-white font-bold uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
            >
              <Plus size={14} /> Nuovo Articolo
            </Link>
            <Link
              to="/admin/lead"
              className="flex items-center gap-3 w-full px-5 py-3 rounded-xl border-2 border-black bg-white text-black font-bold uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
            >
              <Users size={14} /> Gestisci Lead
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl uppercase">Lead recenti</h2>
            <Link to="/admin/lead" className="text-xs font-bold uppercase tracking-wider text-[#FF5500] hover:underline">
              Vedi tutti
            </Link>
          </div>
          {isSupabaseConfigured ? (
            recentLeads.length === 0 ? (
              <p className="text-sm text-black/40">Nessun lead ancora</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3 py-2 border-b border-black/10 last:border-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${lead.read ? 'bg-black/20' : 'bg-[#FF5500]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{lead.name || 'Anonimo'}</p>
                      <p className="text-xs text-black/40 truncate">{lead.email}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {lead.read ? (
                        <CircleCheckBig size={14} className="text-black/30" />
                      ) : (
                        <span className="text-xs bg-[#FF5500] text-white px-2 py-0.5 rounded-full font-bold">Nuovo</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-sm text-black/40">Supabase non configurato</p>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}
