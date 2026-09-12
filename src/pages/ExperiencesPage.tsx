import { useMemo, useState } from 'react'
import { ArrowRight, Heart } from 'lucide-react'
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
import { useSaved } from '../lib/saved'
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

type SortKey = 'consigliati' | 'prezzo-asc' | 'prezzo-desc' | 'durata'
const SORT: { key: SortKey; label: string }[] = [
  { key: 'consigliati', label: 'Consigliate' },
  { key: 'prezzo-asc', label: 'Prezzo: dal più basso' },
  { key: 'prezzo-desc', label: 'Prezzo: dal più alto' },
  { key: 'durata', label: 'Durata: dalle più brevi' },
]

const priceOf = (e: Experience) => Number(e.price.replace(/[^\d]/g, '')) || 0
const hoursOf = (e: Experience) => Number(e.duration.replace(',', '.').replace(/[^\d.]/g, '')) || 0

const allExperiences = CATEGORY_LIST.flatMap((c) => c.experiences.map((e) => ({ ...e, category: c })))

function CategorySection({ cat }: { cat: Category }) {
  return (
    <section id={`cat-${cat.slug}`} className="scroll-mt-32 border-t border-line py-12 md:py-16">
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

export default function ExperiencesPage() {
  usePageMeta({
    title: 'Esperienze a Napoli · Cose Fighe',
    description: `${total} esperienze in 6 categorie: food, outdoor, sport, arte, laboratori e spettacoli. Curate da creator napoletani.`,
  })

  const [price, setPrice] = useState<PriceKey | null>(null)
  const [duration, setDuration] = useState<DurationKey | null>(null)
  const [sort, setSort] = useState<SortKey>('consigliati')
  const [onlySaved, setOnlySaved] = useState(false)
  const { saved } = useSaved()
  const filtering = price !== null || duration !== null || sort !== 'consigliati' || onlySaved

  const results = useMemo(() => {
    if (!filtering) return []
    const p = PRICE.find((x) => x.key === price)
    const d = DURATION.find((x) => x.key === duration)
    const list = allExperiences.filter(
      (e) => (!p || p.test(priceOf(e))) && (!d || d.test(hoursOf(e))) && (!onlySaved || saved.includes(e.title)),
    )
    if (sort === 'prezzo-asc') list.sort((a, b) => priceOf(a) - priceOf(b))
    if (sort === 'prezzo-desc') list.sort((a, b) => priceOf(b) - priceOf(a))
    if (sort === 'durata') list.sort((a, b) => hoursOf(a) - hoursOf(b))
    return list
  }, [filtering, price, duration, sort, onlySaved, saved])

  const reset = () => {
    setPrice(null)
    setDuration(null)
    setSort('consigliati')
    setOnlySaved(false)
  }

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

      <nav aria-label="Categorie" className="sticky top-[56px] z-40 border-b border-line bg-white/90 backdrop-blur-md md:top-[60px]">
        <div className="container-x">
          <ul className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORY_LIST.map((cat) => (
              <li key={cat.slug} className="shrink-0">
                <a href={`#cat-${cat.slug}`} className="chip" onClick={reset}>
                  {cat.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="container-x pb-8">
        <div className="flex flex-col gap-4 py-8 md:flex-row md:flex-wrap md:items-center md:gap-x-8">
          <div role="group" aria-label="Prezzo" className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
            <span className="mr-1 shrink-0 text-sm font-medium text-ink/55">Prezzo</span>
            {PRICE.map((p) => (
              <button
                key={p.key}
                type="button"
                aria-pressed={price === p.key}
                className={`chip ${price === p.key ? 'chip-on' : ''}`}
                onClick={() => setPrice(price === p.key ? null : p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Durata" className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
            <span className="mr-1 shrink-0 text-sm font-medium text-ink/55">Durata</span>
            {DURATION.map((d) => (
              <button
                key={d.key}
                type="button"
                aria-pressed={duration === d.key}
                className={`chip ${duration === d.key ? 'chip-on' : ''}`}
                onClick={() => setDuration(duration === d.key ? null : d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden md:ml-auto">
            <button
              type="button"
              aria-pressed={onlySaved}
              className={`chip ${onlySaved ? 'chip-on' : ''}`}
              onClick={() => setOnlySaved(!onlySaved)}
            >
              <Heart size={14} fill={onlySaved ? 'currentColor' : 'none'} /> Salvate{saved.length ? ` (${saved.length})` : ''}
            </button>
            <label className="chip shrink-0 cursor-pointer gap-2 pr-2">
              <span className="text-ink/55">Ordina</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="bg-transparent font-medium text-ink outline-none"
                aria-label="Ordina le esperienze"
              >
                {SORT.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {filtering ? (
          <section className="border-t border-line py-12 md:py-16" aria-live="polite">
            <Reveal className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="heading-lg">
                  {results.length} {results.length === 1 ? 'esperienza' : 'esperienze'}
                </h2>
                <p className="mt-2 text-ink/60">
                  {[
                    onlySaved ? 'Salvate' : null,
                    PRICE.find((p) => p.key === price)?.label,
                    DURATION.find((d) => d.key === duration)?.label,
                    sort !== 'consigliati' ? SORT.find((s) => s.key === sort)?.label : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={reset}>
                Togli i filtri
              </Button>
            </Reveal>
            {results.length === 0 ? (
              <EmptyState
                title={onlySaved && !saved.length ? 'Non hai ancora salvato niente' : 'Nessuna esperienza con questi filtri'}
                text={
                  onlySaved && !saved.length
                    ? 'Tocca il cuore su una card e la ritrovi qui, anche la prossima volta che torni.'
                    : 'Prova a cambiare prezzo o durata, oppure guarda tutte le categorie.'
                }
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
