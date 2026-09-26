import { useParams } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { PageHero } from '../components/ui/PageHero'
import { ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { NextStep } from '../components/ui/NextStep'
import { CATEGORIES, categoryIn, categoryListIn } from '../data/categories'
import { CATEGORY_TEXTS } from '../data/categorieTesti'
import { relatedForCategory } from '../data/correlati'
import { usePageMeta } from '../hooks/usePageMeta'
import NotFoundPage from './NotFoundPage'
import { useLang, useLp, useT } from '../i18n/lang'
import { hasArticleEn, localizeArticle, testiIn } from '../i18n/content'
import type { Category } from '../types'

/** Testo con segnaposto diviso in pezzi come nel JSX di prima, così l'HTML italiano resta identico. */
const parts = (text: string, vars: Record<string, string | number>) =>
  text
    .split(/(\{\w+\})/)
    .filter(Boolean)
    .map((p) => (/^\{\w+\}$/.test(p) ? vars[p.slice(1, -1)] : p))

/** Titoli e descrizioni in inglese, con le parole che cercano gli stranieri. */
const SEO_EN: Record<string, { title: string; description: string }> = {
  food: {
    title: 'Naples food tours and street food · Cose Fighe',
    description: 'Naples food tours picked one by one: street food in the old town, pizza tours, a winery lunch on Vesuvius and aperitivo in Piazza Bellini. Platform prices.',
  },
  outdoor: {
    title: 'Boat trips and day trips from Naples · Cose Fighe',
    description: 'Boat trips on the Bay of Naples and day trips to the Amalfi Coast, Capri, Pompeii and Vesuvius, picked one by one, with honest notes on how each day goes.',
  },
  sport: {
    title: 'Snorkelling and bike tours in Naples · Cose Fighe',
    description: 'Active things to do in Naples: snorkelling over the sunken Roman villas of Baia and Posillipo, and bike and e-bike tours from the seafront to the old town.',
  },
  arte: {
    title: 'Underground Naples, Veiled Christ and art tours',
    description: 'Art and history tours in Naples: the Veiled Christ, underground Naples, the catacombs, Herculaneum and the old town with a local guide, picked one by one.',
  },
  laboratori: {
    title: 'Pizza making and cooking classes in Naples · Cose Fighe',
    description: 'Pizza making classes, fresh pasta and tiramisù workshops in Naples with local chefs and pizzaioli: three hours at the counter, then you eat what you made.',
  },
  spettacoli: {
    title: 'Live Neapolitan music and shows in Naples · Cose Fighe',
    description: 'Live Neapolitan song in Naples: an hour of the classics sung without microphones, with tarantella and mandolin, in a small room. Picked one by one.',
  },
}

const categoryImages: Record<string, string> = {
  food: '/food.webp',
  outdoor: '/outdoor.webp',
  sport: '/sport.webp',
  arte: '/arte.webp',
  laboratori: '/laboratori.webp',
  spettacoli: '/spettacoli.webp',
}

function CategoryView({ cat: catIt }: { cat: Category }) {
  const t = useT()
  const lp = useLp()
  const lang = useLang()
  // In inglese: etichette tradotte e solo le esperienze tradotte.
  const cat = categoryIn(catIt, lang)
  const experiences = cat.experiences

  usePageMeta(
    lang === 'en' && SEO_EN[cat.slug]
      ? { ...SEO_EN[cat.slug], image: categoryImages[cat.slug] }
      : {
          title: `${cat.label} a Napoli · Cose Fighe`,
          description: `${cat.subtitle}. ${cat.experiences.length} esperienze ${cat.label.toLowerCase()} a Napoli, scelte una per una.`,
          image: categoryImages[cat.slug],
        },
  )

  const others = categoryListIn(lang).filter((c) => c.slug !== cat.slug)
  const texts = testiIn('CATEGORY_TEXTS', CATEGORY_TEXTS, lang)[cat.slug]
  const readsIt = relatedForCategory(cat.slug)
  const reads = lang === 'it' ? readsIt : readsIt.filter(hasArticleEn).map((a) => localizeArticle(a, lang))

  return (
    <Page>
      <PageHero
        back={{ to: lp('/esperienze'), label: t('Tutte le categorie') }}
        eyebrow={cat.subtitle}
        title={cat.label}
        subtitle={t(lang === 'en' && experiences.length === 1 ? '{n} esperienza a Napoli, scelta da chi la città la vive.' : '{n} esperienze a Napoli, scelte da chi la città la vive.', { n: experiences.length })}
        aside={
          <div className="mx-auto w-[200px] overflow-hidden rounded-[2rem] md:ml-auto md:w-[280px]" style={{ backgroundColor: cat.accent }} aria-hidden="true">
            <img src={categoryImages[cat.slug]} alt="" width={900} height={900} className="h-full w-full object-cover" />
          </div>
        }
      />

      <section className="section-y">
        <div className="container-x">
          {texts && (
            <Reveal className="mb-10 max-w-3xl md:mb-14">
              <p className="text-lg leading-relaxed text-ink/70">{texts.intro}</p>
            </Reveal>
          )}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {experiences.map((exp, i) => (
              <ExperienceCard key={exp.title} exp={exp} category={cat.label} index={i} />
            ))}
          </div>
          {reads.length > 0 && (
            <Reveal className="mt-14 border-t border-line pt-8">
              <p className="label text-ink/60">{t('Guide utili')}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {reads.map((a) => (
                  <li key={a.slug}>
                    <ButtonLink to={lp(`/blog/${a.slug}`)} variant="secondary" size="sm">
                      {a.title.split(':')[0]} <ArrowRight size={14} />
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          <Reveal className="mt-8 border-t border-line pt-8">
            <p className="label text-ink/60">{t('Altre categorie')}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {others.map((c) => (
                <li key={c.slug}>
                  <ButtonLink to={lp(`/categoria/${c.slug}`)} variant="secondary" size="sm">
                    {c.label} <ArrowRight size={14} />
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {texts && (
        <section className="section-y border-t border-line bg-white">
          <div className="container-x">
            <Reveal>
              <h2 className="heading-lg">{t('Domande frequenti')}</h2>
              <p className="mt-3 max-w-xl text-ink/60">
                {parts(t('Su {c} a Napoli, le cose che ci chiedono più spesso.'), { c: lang === 'en' ? cat.label : cat.label.toLowerCase() })}
              </p>
            </Reveal>
            <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {texts.faq.map((f) => (
                <div key={f.q}>
                  <h3 className="text-lg font-semibold leading-snug">{f.q}</h3>
                  <p className="mt-2 leading-relaxed text-ink/65">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <NextStep
        title={t('Cosa succede in città in questi giorni?')}
        text={t("Feste, mercati, concerti e mostre a Napoli, giorno per giorno. Scegli le date e guarda cosa c'è.")}
        primary={{ to: lp('/cosa-fare'), label: t('Cosa fare a Napoli') }}
        secondary={{ to: lp('/esperienze'), label: t('Tutte le esperienze') }}
      />
    </Page>
  )
}

export default function CategoryPage() {
  const { slug } = useParams()
  const cat = CATEGORIES[slug ?? ''] as Category | undefined
  if (!cat) return <NotFoundPage />
  return <CategoryView key={cat.slug} cat={cat} />
}
