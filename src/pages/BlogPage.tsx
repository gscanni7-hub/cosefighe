import { useState } from 'react'
import { Page } from '../components/Page'
import { FloatingImage } from '../components/Decorations'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { ArticleCard } from '../components/ui/ArticleCard'
import { WaitlistForm } from '../components/ui/WaitlistForm'
import { ARTICLES_BY_DATE } from '../data/articles'
import { usePageMeta } from '../hooks/usePageMeta'

const categories = ['Tutti', ...Array.from(new Set(ARTICLES_BY_DATE.map((a) => a.category)))]

export default function BlogPage() {
  usePageMeta({
    title: 'Blog · Guide, consigli e storie su Napoli · Cose Fighe',
    description: 'Guide e racconti per vivere Napoli come un local: street food, Vesuvio, Napoli Sotterranea, quartieri, aperitivi, laboratori.',
    image: ARTICLES_BY_DATE[0].coverImage,
  })

  const [filter, setFilter] = useState('Tutti')
  const [featured, ...rest] = ARTICLES_BY_DATE
  const list = filter === 'Tutti' ? rest : ARTICLES_BY_DATE.filter((a) => a.category === filter)
  const showFeatured = filter === 'Tutti'

  return (
    <Page>
      <PageHero
        eyebrow="Storie, guide e consigli"
        title="Il blog"

        subtitle="Scritto da chi Napoli la vive ogni giorno. Niente classifiche copiate: posti veri, orari veri, consigli da local."
        aside={
          <div className="relative mx-auto w-[180px] md:ml-auto md:w-[240px]" aria-hidden="true">
            <FloatingImage src="/meditazione.webp" amplitude={10} />
          </div>
        }
      />


      <section className="section-y">
        <div className="container-x">
          {showFeatured && (
            <div className="mb-12">
              <ArticleCard article={featured} featured />
            </div>
          )}

          <Reveal className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 className="heading-lg">
              {showFeatured ? 'Tutti gli articoli' : `Articoli ${filter}`}
            </h2>
            <div role="group" aria-label="Filtra per categoria" className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  aria-pressed={filter === c}
                  className={`min-h-[38px] rounded-full border px-4 text-sm font-medium transition-colors ${
                    filter === c ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white text-ink/75 hover:border-ink hover:text-ink'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((a, i) => (
              <ArticleCard key={a.slug} article={a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-paper">
        <div className="container-x grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <h2 className="heading-lg">Non perdere nessun articolo</h2>
            <p className="mt-4 max-w-md text-ink/60">Lascia la mail: nuove guide su Napoli e la notizia di quando aprono le prenotazioni.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <WaitlistForm source="blog" />
          </Reveal>
        </div>
      </section>
    </Page>
  )
}
