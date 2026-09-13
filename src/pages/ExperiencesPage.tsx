import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { Page } from '../components/Page'
import { FloatingImage } from '../components/Decorations'
import { PageHero } from '../components/ui/PageHero'
import { Button, ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { EmptyState } from '../components/ui/EmptyState'
import { NextStep } from '../components/ui/NextStep'
import { CATEGORY_LIST } from '../data/categories'
import { usePageMeta } from '../hooks/usePageMeta'
import type { Category, Experience } from '../types'

const total = CATEGORY_LIST.reduce((n, c) => n + c.experiences.length, 0)

type PriceKey = 'low' | 'mid' | 'high'
type DurationKey = 'short' | 'medium' | 'long'

const PRICE: { key: PriceKey; label: string; test: (n: number) => boolean }[] = [
  { key: 'low', label: 'Fino a €30', test: (n) => n <= 30 },
  { key: 'mid', label: '€30 – 60', test: (n) => n > 30 && n <= 60 },
  { key: 'high', label: 'Oltre €60', test: (n) => n > 60 },
]
const DURATION: { key: DurationKey; label: string; test: (h: number) => boolean }[] = [
  { key: 'short', label: 'Fino a 2 ore', test: (h) => h <= 2 },
  { key: 'medium', label: '2 – 4 ore', test: (h) => h > 2 && h <= 4 },
  { key: 'long', label: 'Mezza giornata o più', test: (h) => h > 4 },
]

type SortKey = 'consigliati' | 'prezzo-asc' | 'prezzo-desc' | 'durata' | 'recensioni'
const SORT: { key: SortKey; label: string; short: string }[] = [
  { key: 'consigliati', label: 'Consigliate', short: 'Consigliate' },
  { key: 'recensioni', label: 'Più recensite', short: 'Più recensite' },
  { key: 'prezzo-asc', label: 'Prezzo: dal più basso', short: 'Prezzo ↑' },
  { key: 'prezzo-desc', label: 'Prezzo: dal più alto', short: 'Prezzo ↓' },
  { key: 'durata', label: 'Durata: dalle più brevi', short: 'Più brevi' },
]

const priceOf = (e: Experience) => Number(e.price.replace(',', '.').replace(/[^\d.]/g, '')) || 0
const hoursOf = (e: Experience) => {
  const m = e.duration.replace(',', '.').match(/[\d.]+/g)
  if (!m) return 0
  const n = Number(m[0])
  return /min/i.test(e.duration) && !/or[ae]/i.test(e.duration) ? n / 60 : n
}

const allExperiences = CATEGORY_LIST.flatMap((c) => c.experiences.map((e) => ({ ...e, category: c })))

function CategorySection({ cat }: { cat: Category }) {
  return (
    <section id={`cat-${cat.slug}`} className="scroll-mt-36 border-t border-line py-12 md:py-16">
      <Reveal className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="heading-lg">{cat.label}</h2>
          <p className="mt-2 text-ink/60">
            {cat.subtitle} · {cat.experiences.length} esperienze
          </p>
        </div>
        <ButtonLink to={`/categoria/${cat.slug}`} variant="link">
          Vedi la categoria <ArrowRight size={15} />
        </ButtonLink>
      </Reveal>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {cat.experiences.map((exp, i) => (
          <ExperienceCard key={exp.title} exp={exp} category={cat.label} index={i} />
        ))}
      </div>
    </section>
  )
}

/** Riga di scelte esclusive dentro il pannello filtri (un solo valore attivo, ricliccando si toglie). */
function Choice<K extends string>({ label, options, value, onChange }: { label: string; options: { key: K; label: string }[]; value: K | null; onChange: (k: K | null) => void }) {
  return (
    <fieldset className="min-w-0">
      <legend className="label mb-3 text-ink/50">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.key
          return (
            <button key={o.key} type="button" aria-pressed={on} className={`chip ${on ? 'chip-on' : ''}`} onClick={() => onChange(on ? null : o.key)}>
              {on && <Check size={13} strokeWidth={2.5} />}
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default function ExperiencesPage() {
  usePageMeta({
    title: 'Esperienze a Napoli · Cose Fighe',
    description: `${total} esperienze in 6 categorie: food, outdoor, sport, arte, laboratori e spettacoli. Curate da creator napoletani.`,
  })

  const [price, setPrice] = useState<PriceKey | null>(null)
  const [duration, setDuration] = useState<DurationKey | null>(null)
  const [sort, setSort] = useState<SortKey>('consigliati')
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const activeCount = (price ? 1 : 0) + (duration ? 1 : 0)
  const filtering = activeCount > 0 || sort !== 'consigliati'

  const results = useMemo(() => {
    if (!filtering) return []
    const p = PRICE.find((x) => x.key === price)
    const d = DURATION.find((x) => x.key === duration)
    const list = allExperiences.filter(
      (e) => (!p || p.test(priceOf(e))) && (!d || d.test(hoursOf(e))),
    )
    if (sort === 'prezzo-asc') list.sort((a, b) => priceOf(a) - priceOf(b))
    if (sort === 'prezzo-desc') list.sort((a, b) => priceOf(b) - priceOf(a))
    if (sort === 'durata') list.sort((a, b) => hoursOf(a) - hoursOf(b))
    if (sort === 'recensioni') list.sort((a, b) => b.reviews - a.reviews)
    return list
  }, [filtering, price, duration, sort])

  const reset = () => {
    setPrice(null)
    setDuration(null)
    setSort('consigliati')
  }

  // Il pannello si chiude con Esc o cliccando fuori.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const activeChips: { label: string; clear: () => void }[] = [
    price ? { label: PRICE.find((p) => p.key === price)!.label, clear: () => setPrice(null) } : null,
    duration ? { label: DURATION.find((d) => d.key === duration)!.label, clear: () => setDuration(null) } : null,
    sort !== 'consigliati' ? { label: SORT.find((s) => s.key === sort)!.label, clear: () => setSort('consigliati') } : null,
  ].filter((x): x is { label: string; clear: () => void } => !!x)

  const sortLabel = SORT.find((s) => s.key === sort)!

  return (
    <Page>
      <PageHero
        eyebrow="Cosa vuoi vivere?"
        title="Esperienze a Napoli"
        subtitle={`${CATEGORY_LIST.length} categorie, ${total} esperienze scelte da chi la città la vive ogni giorno.`}
        aside={
          <div className="relative mx-auto w-[180px] md:ml-auto md:w-[260px]" aria-hidden="true">
            <FloatingImage src="/trekking.webp" amplitude={10} />
          </div>
        }
      />

      {/* Barra unica: categorie a sinistra, filtri e ordine a destra. Resta in alto scorrendo. */}
      <div className={`sticky top-[56px] border-b border-line bg-white/92 backdrop-blur-md md:top-[60px] ${open ? 'z-[60]' : 'z-40'}`}>
        <div className="container-x relative" ref={panelRef}>
          <div className="flex items-center gap-3 py-2.5">
            <nav aria-label="Categorie" className="min-w-0 flex-1">
              <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {CATEGORY_LIST.map((cat) => (
                  <li key={cat.slug} className="shrink-0">
                    <a
                      href={`#cat-${cat.slug}`}
                      className="chip"
                      onClick={() => {
                        reset()
                        setOpen(false)
                      }}
                    >
                      {cat.label}
                      <span className="text-ink/40">{cat.experiences.length}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex shrink-0 items-center gap-2 border-l border-line pl-3">
              <label className="chip hidden cursor-pointer gap-1.5 pr-2 md:inline-flex">
                <span className="text-ink/55">Ordina</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="max-w-[170px] bg-transparent font-medium text-ink outline-none" aria-label="Ordina le esperienze">
                  {SORT.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                aria-expanded={open}
                aria-controls="filtri"
                onClick={() => setOpen(!open)}
                className={`chip ${activeCount ? 'chip-on' : ''}`}
              >
                <SlidersHorizontal size={14} />
                Filtri
                {activeCount > 0 && (
                  <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-ink">{activeCount}</span>
                )}
                <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {open && (
            <>
              <div className="fixed inset-0 z-40 bg-ink/30 md:hidden" aria-hidden="true" onClick={() => setOpen(false)} />
              <div
                id="filtri"
                role="dialog"
                aria-label="Filtri"
                className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-line bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-soft md:absolute md:inset-x-auto md:bottom-auto md:right-5 md:top-full md:mt-2 md:max-h-[75vh] md:w-[460px] md:rounded-3xl md:border md:p-6 sm:md:right-8"
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="font-semibold">Filtra le esperienze</p>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Chiudi i filtri" className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink/70 hover:text-ink">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid gap-6">
                  <Choice label="Prezzo a persona" options={PRICE} value={price} onChange={setPrice} />
                  <Choice label="Durata" options={DURATION} value={duration} onChange={setDuration} />
                  <fieldset className="md:hidden">
                    <legend className="label mb-3 text-ink/50">Ordina per</legend>
                    <div className="flex flex-wrap gap-2">
                      {SORT.map((s) => (
                        <button key={s.key} type="button" aria-pressed={sort === s.key} className={`chip ${sort === s.key ? 'chip-on' : ''}`} onClick={() => setSort(s.key)}>
                          {s.short}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
                  <button type="button" onClick={reset} className="text-sm font-medium text-ink/60 underline-offset-4 hover:text-ink hover:underline" disabled={!filtering}>
                    Azzera
                  </button>
                  <Button size="sm" onClick={() => setOpen(false)}>
                    {filtering ? `Mostra ${results.length} ${results.length === 1 ? 'esperienza' : 'esperienze'}` : 'Chiudi'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="container-x pb-8">
        {filtering ? (
          <section className="py-10 md:py-14" aria-live="polite">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="heading-lg">
                  {results.length} {results.length === 1 ? 'esperienza' : 'esperienze'}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {activeChips.map((c) => (
                    <button key={c.label} type="button" onClick={c.clear} className="chip chip-on gap-1.5 pr-2.5" aria-label={`Togli il filtro ${c.label}`}>
                      {c.label}
                      <X size={13} />
                    </button>
                  ))}
                  <button type="button" onClick={reset} className="text-sm font-medium text-ink/60 underline-offset-4 hover:text-ink hover:underline">
                    Togli tutto
                  </button>
                </div>
              </div>
              <p className="text-sm text-ink/50">
                Ordinate per <span className="font-medium text-ink/75">{sortLabel.label.toLowerCase()}</span>
              </p>
            </div>
            {results.length === 0 ? (
              <EmptyState
                title="Nessuna esperienza con questi filtri"
                text="Prova a cambiare prezzo o durata, oppure guarda tutte le categorie."

                actions={<Button onClick={reset}>Togli i filtri</Button>}
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {results.map((exp, i) => (
                  <ExperienceCard key={exp.title} exp={exp} category={exp.category.label} index={i} />
                ))}
              </div>
            )}
          </section>
        ) : (
          CATEGORY_LIST.map((cat) => <CategorySection key={cat.slug} cat={cat} />)
        )}
      </div>

      <NextStep
        title="Non sai da dove iniziare?"
        text="Guarda cosa succede a Napoli nei giorni in cui ci sei: eventi in città ed esperienze disponibili, giorno per giorno."
        primary={{ to: '/cosa-fare', label: 'Cosa fare a Napoli' }}
        secondary={{ to: '/contatti', label: 'Chiedi a noi' }}
      />
    </Page>
  )
}
