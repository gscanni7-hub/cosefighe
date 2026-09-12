import { useEffect, useState } from 'react'
import { Bot, Check, ChevronDown, Crown, FileText, Search, ShieldCheck } from 'lucide-react'
import { AdminLayout, Badge, Button, Card, Notice, PageHeader, Toggle } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { fetchAgentRuns, fetchAgentSettings, saveAgentSettings } from '../../lib/db'
import { AGENTS, CADENCE_LABEL, type AgentDef, type AgentSettings, type Cadence } from '../../data/agents'
import type { AgentRun } from '../../types'

const ICONS: Record<string, typeof Bot> = { 'scout-esperienze': Search, 'scrivi-articolo': FileText, 'controllo-seo': ShieldCheck }

const when = (iso: string) => new Date(iso).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const defaults = (a: AgentDef): AgentSettings => ({ agent: a.id, enabled: true, cadence: a.defaultCadence, rules: a.defaultRules })

function AgentCard({ def, settings, lastRun, canSave, onSave }: { def: AgentDef; settings: AgentSettings; lastRun?: AgentRun; canSave: boolean; onSave: (s: AgentSettings) => Promise<boolean> }) {
  const [local, setLocal] = useState<AgentSettings>(settings)
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const Icon = ICONS[def.id] ?? Bot
  const dirty = JSON.stringify(local) !== JSON.stringify(settings)

  useEffect(() => setLocal(settings), [settings])

  const save = async () => {
    setState('saving')
    const ok = await onSave(local)
    setState(ok ? 'saved' : 'error')
    window.setTimeout(() => setState('idle'), 2000)
  }

  return (
    <Card className={`p-0 ${local.enabled ? '' : 'opacity-70'}`}>
      <div className="flex items-start gap-4 p-5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${local.enabled ? 'bg-orange text-white' : 'bg-paper text-ink/40'}`}>
          <Icon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{def.name}</h2>
            <Badge tone="blue">{def.role}</Badge>
            {local.enabled ? <Badge tone="success">attivo</Badge> : <Badge>in pausa</Badge>}
          </div>
          <p className="mt-1 text-sm text-ink/65">{def.mission}</p>
        </div>
        <Toggle checked={local.enabled} onChange={(v) => setLocal({ ...local, enabled: v })} label={`${def.name} attivo`} />
      </div>

      <div className="grid gap-4 border-t border-line px-5 py-4 text-sm md:grid-cols-3">
        <div>
          <p className="label mb-2 text-[11px] text-ink/40">Compiti</p>
          <ul className="space-y-1.5 text-ink/75">
            {def.duties.map((d) => (
              <li key={d} className="flex gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-success" /> {d}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label mb-2 text-[11px] text-ink/40">Gli serve</p>
          <ul className="space-y-1.5 text-ink/75">
            {def.needs.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
          <p className="label mb-2 mt-4 text-[11px] text-ink/40">Produce</p>
          <p className="text-ink/75">{def.produces}</p>
        </div>
        <div>
          <p className="label mb-2 text-[11px] text-ink/40">Riferisce a</p>
          <p className="text-ink/75">{def.reportsTo}</p>
          <p className="label mb-2 mt-4 text-[11px] text-ink/40">Frequenza</p>
          <select value={local.cadence} onChange={(e) => setLocal({ ...local, cadence: e.target.value as Cadence })} className="field" aria-label={`Frequenza di ${def.name}`}>
            {(Object.keys(CADENCE_LABEL) as Cadence[]).map((c) => (
              <option key={c} value={c}>
                {CADENCE_LABEL[c]}
              </option>
            ))}
          </select>
          <p className="label mb-1 mt-4 text-[11px] text-ink/40">Ultima esecuzione</p>
          <p className="text-ink/75">
            {lastRun ? (
              <>
                {when(lastRun.started_at)} · <Badge tone={lastRun.status === 'ok' ? 'success' : lastRun.status === 'errore' ? 'warning' : 'neutral'}>{lastRun.status}</Badge>
                {lastRun.items != null && lastRun.items > 0 && <span className="ml-2 text-ink/55">{lastRun.items} elementi</span>}
              </>
            ) : (
              'Mai'
            )}
          </p>
        </div>
      </div>

      <div className="border-t border-line px-5 py-4">
        <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-sm font-semibold" aria-expanded={open}>
          Istruzioni e regole
          <ChevronDown size={16} className={`text-ink/45 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="mt-3">
            <textarea
              value={local.rules ?? ''}
              onChange={(e) => setLocal({ ...local, rules: e.target.value })}
              rows={14}
              className="field resize-y font-mono text-[13px] leading-relaxed"
              aria-label={`Regole di ${def.name}`}
            />
            <p className="mt-2 text-xs text-ink/45">
              Le legge prima di ogni esecuzione. Si lancia da Claude Code con <code className="rounded bg-paper px-1.5 py-0.5">{def.command}</code>.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
        <span className="text-xs text-ink/45">
          {!canSave ? 'Il salvataggio si attiva quando la tabella agent_settings esiste nel database.' : settings.updated_at ? `Salvato ${when(settings.updated_at)}` : 'Valori di partenza, non ancora salvati'}
        </span>
        <div className="flex items-center gap-2">
          {dirty && (
            <Button variant="ghost" onClick={() => setLocal(settings)}>
              Annulla
            </Button>
          )}
          <Button disabled={!canSave || !dirty || state === 'saving'} onClick={save}>
            {state === 'saving' ? 'Salvo...' : state === 'saved' ? 'Salvato' : state === 'error' ? 'Errore' : 'Salva'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function AdminAgents() {
  const [settings, setSettings] = useState<Record<string, AgentSettings>>(Object.fromEntries(AGENTS.map((a) => [a.id, defaults(a)])))
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [canSave, setCanSave] = useState(false)

  useEffect(() => {
    document.title = 'Agenti · Pannello Cose Fighe'
    if (!isSupabaseConfigured) return
    fetchAgentSettings().then(({ rows, available }) => {
      setCanSave(available)
      if (rows.length) setSettings((prev) => ({ ...prev, ...Object.fromEntries(rows.map((r) => [r.agent, { ...prev[r.agent], ...r, rules: r.rules ?? prev[r.agent]?.rules ?? null }])) }))
    })
    fetchAgentRuns(50).then(setRuns)
  }, [])

  const onSave = async (s: AgentSettings) => {
    const ok = await saveAgentSettings(s)
    if (ok) setSettings((prev) => ({ ...prev, [s.agent]: { ...s, updated_at: new Date().toISOString() } }))
    return ok
  }

  const active = AGENTS.filter((a) => settings[a.id]?.enabled).length

  return (
    <AdminLayout>
      <PageHeader title="Agenti" subtitle="La squadra che lavora per il sito. Loro preparano, tu decidi." />

      {!isSupabaseConfigured ? (
        <Notice title="Database non collegato">Le impostazioni degli agenti si salvano nel database.</Notice>
      ) : (
        !canSave && (
          <Notice title="Manca la tabella delle impostazioni">
            Nel SQL Editor di Supabase esegui la parte finale di <code className="rounded bg-white px-1">supabase/schema.sql</code> (tabella <code className="rounded bg-white px-1">agent_settings</code>). Fino ad allora vedi i valori di partenza e non puoi salvare.
          </Notice>
        )
      )}

      {/* Organigramma */}
      <div className="mb-8">
        <div className="mx-auto w-fit">
          <div className="card flex items-center gap-3 px-5 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
              <Crown size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold">Tu</p>
              <p className="text-xs text-ink/55">Direzione: regole, approvazioni, pubblicazione</p>
            </div>
          </div>
        </div>
        <div className="mx-auto h-6 w-px bg-line" />
        <div className="relative mx-auto grid max-w-4xl grid-cols-3 gap-4 before:absolute before:left-[16.66%] before:right-[16.66%] before:top-0 before:h-px before:bg-line">
          {AGENTS.map((a) => {
            const Icon = ICONS[a.id] ?? Bot
            const on = settings[a.id]?.enabled
            return (
              <a key={a.id} href={`#agente-${a.id}`} className="flex flex-col items-center pt-4 text-center">
                <span className="h-4 w-px bg-line" />
                <span className={`mt-0 flex h-12 w-12 items-center justify-center rounded-2xl ${on ? 'bg-orange text-white' : 'bg-paper text-ink/40'}`}>
                  <Icon size={20} />
                </span>
                <span className="mt-2 text-sm font-semibold">{a.name}</span>
                <span className="text-xs text-ink/55">{a.role}</span>
                <span className="mt-1 text-[11px] text-ink/45">{CADENCE_LABEL[settings[a.id]?.cadence ?? a.defaultCadence]}</span>
              </a>
            )
          })}
        </div>
        <p className="mt-4 text-center text-xs text-ink/45">
          {active} agenti attivi su {AGENTS.length}. Girano con Claude Code, con il tuo abbonamento: a mano con il loro comando, o a orario come routine.
        </p>
      </div>

      <div className="space-y-6">
        {AGENTS.map((a) => (
          <div key={a.id} id={`agente-${a.id}`} className="scroll-mt-20">
            <AgentCard def={a} settings={settings[a.id]} lastRun={runs.find((r) => r.agent === a.id)} canSave={canSave} onSave={onSave} />
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
