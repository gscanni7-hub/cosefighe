import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Calendar, Newspaper, Search, Ticket, X } from 'lucide-react'
import { CATEGORY_LIST } from '../data/categories'
import { EVENTS, EVENT_CATEGORY_LABELS, eventEnd, eventPath } from '../data/events'
import { ARTICLES_BY_DATE } from '../data/articles'
import { formatShort, todayISO } from '../lib/dates'
import { experiencePath } from '../data/schede'

interface SearchDialogProps {
  open: boolean
  onClose: () => void
  onOpen: () => void
}

/** Minuscole e senza accenti, per confrontare "Sanità" con "sanita". */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

interface Hit {
  kind: 'esperienza' | 'evento' | 'articolo'
  title: string
  meta: string
  to: string
  score: number
}

function search(q: string): Hit[] {
  const words = norm(q).split(/\s+/).filter((w) => w.length > 1)
  if (!words.length) return []
  const score = (fields: string[]) => {
    const text = norm(fields.join(' '))
    let s = 0
    for (const w of words) {
      if (!text.includes(w)) return 0
      s += norm(fields[0]).includes(w) ? 3 : 1
    }
    return s
  }
  const hits: Hit[] = []
  for (const c of CATEGORY_LIST)
    for (const e of c.experiences) {
      const s = score([e.title, e.location, c.label, e.included, e.tag])
      if (s) hits.push({ kind: 'esperienza', title: e.title, meta: `${c.label} · ${e.location} · da ${e.price}`, to: experiencePath(e) ?? `/categoria/${c.slug}`, score: s + 1 })
    }
  const today = todayISO()
  for (const e of EVENTS) {
    if (eventEnd(e) < today) continue
    const s = score([e.title, e.place, e.area, EVENT_CATEGORY_LABELS[e.category], e.blurb])
    if (s) hits.push({ kind: 'evento', title: e.title, meta: `${formatShort(e.start)} · ${e.place}`, to: eventPath(e), score: s })
  }
  for (const a of ARTICLES_BY_DATE) {
    const s = score([a.title, a.excerpt, a.tags.join(' '), a.category])
    if (s) hits.push({ kind: 'articolo', title: a.title, meta: `Blog · ${a.category}`, to: `/blog/${a.slug}`, score: s })
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 12)
}

const ICON = { esperienza: Ticket, evento: Calendar, articolo: Newspaper }
const LABEL = { esperienza: 'Esperienza', evento: 'Evento', articolo: 'Articolo' }

/** Ricerca in tutto il sito: esperienze, eventi in programma, articoli. Si apre anche con ⌘K / Ctrl+K. */
export function SearchDialog({ open, onClose, onOpen }: SearchDialogProps) {
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const hits = useMemo(() => search(q), [q])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) onClose()
        else onOpen()
      }
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, onOpen])

  useEffect(() => {
    if (open) {
      setQ('')
      window.setTimeout(() => inputRef.current?.focus(), 30)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/40 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Cerca nel sito" className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-soft">
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search size={18} className="shrink-0 text-ink/45" />
          <input
            ref={inputRef}
            id="ricerca-sito"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca un'esperienza, un evento, un articolo"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink/40"
            autoComplete="off"
          />
          <button type="button" onClick={onClose} aria-label="Chiudi la ricerca" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/60 hover:bg-paper hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.trim().length < 2 ? (
            <div className="px-4 py-6 text-sm text-ink/55">
              <p>Prova con “pizza”, “barca”, “Sanità”, “MANN” o il nome di un quartiere.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['pizza', 'barca', 'sotterranea', 'Vesuvio', 'concerto', 'mostre'].map((s) => (
                  <button key={s} type="button" onClick={() => setQ(s)} className="chip min-h-[36px] md:min-h-[34px]">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : hits.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink/55">Niente con “{q}”. Prova con una parola sola o guarda tutte le esperienze.</p>
          ) : (
            <ul>
              {hits.map((h) => {
                const Icon = ICON[h.kind]
                return (
                  <li key={h.kind + h.to + h.title}>
                    <Link to={h.to} viewTransition onClick={onClose} className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-paper">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-ink/60">
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{h.title}</span>
                        <span className="block truncate text-sm text-ink/55">
                          {LABEL[h.kind]} · {h.meta}
                        </span>
                      </span>
                      <ArrowRight size={15} className="shrink-0 text-ink/30 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
