import { useEffect, useState } from 'react'
import { Eye, EyeOff, Mail, RefreshCw, Trash2 } from 'lucide-react'
import { AdminLayout, Button, Card, PageHeader } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { deleteLead, fetchLeads, markLeadRead } from '../../lib/db'
import type { Lead } from '../../types'

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    fetchLeads().then((rows) => {
      setLeads(rows)
      setLoading(false)
    })
  }

  useEffect(() => {
    document.title = 'Lead — Admin'
    load()
  }, [])

  const toggleRead = async (id: string, read: boolean) => {
    if (!read) await markLeadRead(id)
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, read: !read } : l)))
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Eliminare questo lead?')) {
      await deleteLead(id)
      setLeads((prev) => prev.filter((l) => l.id !== id))
    }
  }

  const unread = leads.filter((l) => !l.read).length

  return (
    <AdminLayout>
      <PageHeader
        title="Lead"
        subtitle={`${leads.length} lead totali${unread > 0 ? ` · ${unread} non letti` : ''}`}
        action={
          <Button
            variant="secondary"
            onClick={() => {
              setLoading(true)
              load()
            }}
          >
            <RefreshCw size={14} /> Aggiorna
          </Button>
        }
      />

      {!isSupabaseConfigured && (
        <Card className="mb-6 bg-yellow-50 border-yellow-400">
          <p className="text-sm font-bold">Configura Supabase nel .env per visualizzare i lead.</p>
          <p className="text-xs text-black/60 mt-1">
            I messaggi del modulo di contatto vengono salvati nella tabella <code>leads</code>.
          </p>
        </Card>
      )}

      {loading ? (
        <Card>
          <p className="text-black/40 text-sm">Caricamento...</p>
        </Card>
      ) : leads.length === 0 ? (
        <Card className="text-center py-16">
          <Mail size={48} className="text-black/20 mx-auto mb-4" />
          <p className="font-display text-3xl uppercase text-black/20">Nessun lead ancora</p>
          <p className="text-sm text-black/40 mt-2">I messaggi del form contatti appariranno qui.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card
              key={lead.id}
              className={`cursor-pointer transition-all ${
                lead.read ? '' : 'border-[#FF5500] shadow-[6px_6px_0px_0px_rgba(255,85,0,0.3)]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${lead.read ? 'bg-black/20' : 'bg-[#FF5500]'}`} />
                <div className="flex-1 min-w-0" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold">{lead.name || 'Anonimo'}</span>
                    {!lead.read && (
                      <span className="bg-[#FF5500] text-white px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                        Nuovo
                      </span>
                    )}
                    {lead.topic && (
                      <span className="px-2 py-0.5 rounded-full border-2 border-black text-xs font-bold">{lead.topic}</span>
                    )}
                    <span className="text-xs text-black/40 ml-auto">
                      {new Date(lead.created_at).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-black/60 mt-0.5">{lead.email}</p>
                  {expanded === lead.id && lead.message && (
                    <div className="mt-4 p-4 bg-[#f5f5f5] rounded-xl border-2 border-black/10">
                      <p className="text-xs font-bold uppercase tracking-wider text-black/40 mb-2">Messaggio</p>
                      <p className="text-sm text-black/80 leading-relaxed whitespace-pre-wrap">{lead.message}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleRead(lead.id, lead.read)}
                    title={lead.read ? 'Segna come non letto' : 'Segna come letto'}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-black/20 hover:border-black transition-all"
                  >
                    {lead.read ? (
                      <EyeOff size={13} className="text-black/40" />
                    ) : (
                      <Eye size={13} className="text-[#FF5500]" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-red-200 hover:border-red-500 text-red-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
