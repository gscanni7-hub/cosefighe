import { useState } from 'react'
import { Page } from '../components/Page'
import { FloatingImage } from '../components/Decorations'
import { PageHero } from '../components/ui/PageHero'
import { Reveal } from '../components/ui/Reveal'
import { ArticleCard } from '../components/ui/ArticleCard'
import { NextStep } from '../components/ui/NextStep'
import { ARTICLES_BY_DATE } from '../data/articles'
import { usePageMeta } from '../hooks/usePageMeta'
import { useLang, useLp, useT } from '../i18n/lang'
import { hasArticleEn, localizeArticle } from '../i18n/content'

const categories = ['Tutti', ...Array.from(new Set(ARTICLES_BY_DATE.map((a) => a.category)))]

/** In inglese solo gli articoli tradotti, con titolo, estratto e categoria in inglese. */
const ARTICLES_EN = ARTICLES_BY_DATE.filter(hasArticleEn).map((a) => localizeArticle(a, 'en'))
const categoriesEn = ['Tutti', ...Array.from(new Set(ARTICLES_EN.map((a) => a.category)))]

export default function BlogPage() {
  const lang = useLang()
  const t = useT()
  const lp = useLp()
  const articles = lang === 'en' ? ARTICLES_EN : ARTICLES_BY_DATE
  const cats = lang === 'en' ? categoriesEn : categories

  usePageMeta({
    title: t('Blog · Guide, consigli e storie su Napoli · Cose Fighe'),
    description: t('Guide e racconti per vivere Napoli come un local: street food, Vesuvio, Napoli Sotterranea, quartieri, aperitivi, laboratori.'),
    image: articles[0]?.coverImage ?? '/img/napoli-skyline.webp',
  })

  const [filter, setFilter] = useState('Tutti')
  const [featured, ...rest] = articles
  const list = filter === 'Tutti' ? rest : articles.filter((a) => a.category === filter)
  const showFeatured = filter === 'Tutti'

  return (
    <Page>
      <PageHero
        eyebrow={t('Storie, guide e consigli')}
        title={t('Il blog')}

        subtitle={t('Scritto da chi Napoli la vive ogni giorno. Niente classifiche copiate: posti veri, orari veri, consigli da local.')}
        aside={
          <div className="relative mx-auto w-[180px] md:ml-auto md:w-[240px]" aria-hidden="true">
            <FloatingImage src="/mascotte-giornalista.webp" amplitude={10} />
          </div>
        }
      />


      <section className="section-y">
        <div className="container-x">
          {showFeatured && featured && (
            <div className="mb-12">
              <ArticleCard article={featured} featured />
            </div>
          )}

          <Reveal className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <h2 className="heading-lg">
              {showFeatured ? t('Tutti gli articoli') : t('Articoli {categoria}', { categoria: filter })}
            </h2>
            <div role="group" aria-label={t('Filtra per categoria')} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 md:mx-0 md:flex-wrap md:px-0 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cats.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  aria-pressed={filter === c}
                  className={`chip ${filter === c ? 'chip-on' : ''}`}
                >
                  {c === 'Tutti' ? t('Tutti') : c}
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
        title={t('Letto abbastanza? Ora vivilo')}
        text={t('Le esperienze dei nostri creator partono dagli stessi posti di cui scriviamo.')}
        primary={{ to: lp('/esperienze'), label: t('Esplora le esperienze') }}
        secondary={{ to: lp('/cosa-fare'), label: t('Cosa fare a Napoli') }}
      />
    </Page>
  )
}
