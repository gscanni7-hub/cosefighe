import { useState } from 'react'
import { Page } from '../components/Page'
import { FloatingImage } from '../components/Decorations'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { ArticleCard } from '../components/ui/ArticleCard'
import { NextStep } from '../components/ui/NextStep'
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
            <FloatingImage src="/mascotte-giornalista.webp" amplitude={10} />
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
                  className={`chip ${filter === c ? 'chip-on' : ''}`}
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

      <NextStep
        title="Letto abbastanza? Ora vivilo"
        text="Le esperienze dei nostri creator partono dagli stessi posti di cui scriviamo."
        primary={{ to: '/esperienze', label: 'Esplora le esperienze' }}
        secondary={{ to: '/cosa-fare', label: 'Cosa fare a Napoli' }}
      />
    </Page>
  )
}
