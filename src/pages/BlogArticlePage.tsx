import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { motion, useScroll, useSpring } from 'motion/react'
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from 'lucide-react'
import { Page } from '../components/Page'
import { ButtonLink } from '../components/ui/Button'
import { Sticker } from '../components/ui/Sticker'
import { ArticleCard } from '../components/ui/ArticleCard'
import { WaitlistForm } from '../components/ui/WaitlistForm'
import { getArticleBySlug, getRelatedArticles } from '../data/articles'
import { usePageMeta } from '../hooks/usePageMeta'
import type { Article, ArticleSection } from '../types'

function useArticleJsonLd(article: Article) {
  useEffect(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      image: new URL(article.coverImage, window.location.origin).toString(),
      datePublished: article.date,
      dateModified: article.date,
      author: { '@type': 'Person', name: article.author, jobTitle: article.authorRole },
      publisher: { '@type': 'Organization', name: 'Cose Fighe', url: window.location.origin },
      mainEntityOfPage: { '@type': 'WebPage', '@id': window.location.href },
      keywords: article.tags.join(', '),
      articleSection: article.category,
      inLanguage: 'it-IT',
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'article-json-ld'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
    return () => script.remove()
  }, [article])
}

function ArticleBody({ sections }: { sections: ArticleSection[] }) {
  return (
    <div className="text-ink">
      {sections.map((s, i) => {
        switch (s.type) {
          case 'paragraph':
            return (
              <p key={i} className="mb-6 text-lg leading-relaxed text-ink/75">
                {s.content}
              </p>
            )
          case 'heading':
            return (
              <h2 key={i} className="mb-5 mt-12 scroll-mt-32 font-display text-3xl uppercase leading-tight md:text-4xl" id={`h-${i}`}>
                {s.content}
              </h2>
            )
          case 'subheading':
            return (
              <h3 key={i} className="mb-4 mt-8 font-display text-2xl uppercase leading-tight">
                {s.content}
              </h3>
            )
          case 'list':
            return (
              <div key={i} className="mb-8">
                {s.content && <p className="mb-3 font-bold">{s.content}</p>}
                <ul className="space-y-2.5">
                  {s.items?.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-ink/75">
                      <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full border-2 border-ink bg-orange" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          case 'tip':
            return (
              <aside key={i} className="my-8 rounded-[1.5rem] border-2 border-ink bg-paper px-6 py-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-orange">Consiglio da local</p>
                <p className="leading-relaxed text-ink/80">{s.content}</p>
              </aside>
            )
          case 'quote':
            return (
              <blockquote key={i} className="my-10 rounded-[2rem] border-4 border-ink bg-ink px-8 py-8 text-white shadow-hard-lg">
                <p className="font-display text-2xl uppercase leading-tight md:text-3xl">“{s.content}”</p>
              </blockquote>
            )
          default:
            return null
        }
      })}
    </div>
  )
}

function ArticleView({ article }: { article: Article }) {
  usePageMeta({ title: `${article.title} · Cose Fighe Blog`, description: article.excerpt, image: article.coverImage })
  useArticleJsonLd(article)
  const related = getRelatedArticles(article)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  const date = new Date(article.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
  const headings = article.body.map((s, i) => ({ ...s, i })).filter((s) => s.type === 'heading')

  return (
    <Page>
      <motion.div
        className="fixed left-0 top-0 z-[60] h-1.5 w-full origin-left bg-orange"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <header className="relative bg-ink pt-28 text-white md:pt-32">
        <div className="container-x pb-10">
          <nav aria-label="Percorso" className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-white/60">
            <Link to="/" viewTransition className="hover:text-white">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/blog" viewTransition className="hover:text-white">
              Blog
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/40">{article.category}</span>
          </nav>
          <div className="mt-8">
            <Sticker tone="orange" rotate={-2}>
              {article.category}
            </Sticker>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="mt-5 max-w-4xl font-display text-display-lg uppercase"
          >
            {article.title}
          </motion.h1>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <span className="flex items-center gap-2.5">
              <img
                src={article.authorImage}
                alt=""
                width={40}
                height={40}
                className="h-9 w-9 rounded-full border-2 border-white/40 bg-cream object-contain p-0.5"
              />
              <span>
                <span className="font-bold">{article.author}</span>
                <span className="ml-2 text-xs text-white/50">{article.authorRole}</span>
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-white/60">
              <Calendar size={13} /> {date}
            </span>
            <span className="flex items-center gap-1.5 text-white/60">
              <Clock size={13} /> {article.readingTime} min di lettura
            </span>
          </div>
        </div>
        <div className="container-x">
          <div className="translate-y-12 overflow-hidden rounded-[2rem] border-4 border-ink bg-cream shadow-hard-xl">
            <img
              src={article.coverImage}
              alt={article.title}
              width={1000}
              height={625}
              className="aspect-[16/9] w-full object-cover md:aspect-[21/9]"
            />
          </div>
        </div>
      </header>

      <div className="container-x items-start pb-20 pt-24 md:grid md:grid-cols-[minmax(0,1fr)_300px] md:gap-16 md:pt-28">
        <article className="max-w-prose">
          <p className="mb-10 border-l-4 border-orange pl-6 text-xl leading-relaxed text-ink/70 md:text-2xl">{article.excerpt}</p>
          <ArticleBody sections={article.body} />

          <ul className="mt-12 flex flex-wrap gap-2 border-t-2 border-ink/10 pt-8" aria-label="Tag">
            {article.tags.map((tag) => (
              <li key={tag} className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
                <Tag size={10} /> {tag}
              </li>
            ))}
          </ul>

          <div className="mt-12 flex items-center gap-5 rounded-[2rem] border-4 border-ink bg-paper p-6 md:p-8">
            <img
              src={article.authorImage}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 flex-shrink-0 rounded-full border-4 border-ink bg-white object-contain p-1"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange">Chi ha scritto questo articolo</p>
              <p className="mt-1 font-display text-2xl uppercase">{article.author}</p>
              <p className="text-sm text-ink/55">{article.authorRole} @ Cose Fighe</p>
            </div>
          </div>

          <div className="mt-10">
            <ButtonLink to="/blog" variant="dark" size="sm">
              <ArrowLeft size={13} /> Torna al blog
            </ButtonLink>
          </div>
        </article>

        <aside className="mt-12 space-y-6 md:sticky md:top-28 md:mt-0">
          {headings.length > 0 && (
            <nav aria-label="In questo articolo" className="rounded-[1.5rem] border-4 border-ink bg-ink p-6 text-white shadow-hard-lg">
              <p className="mb-4 font-display text-xl uppercase">In questo articolo</p>
              <ol className="space-y-1">
                {headings.map((h) => (
                  <li key={h.i}>
                    <a
                      href={`#h-${h.i}`}
                      className="block border-b border-white/10 py-1.5 text-sm leading-snug text-white/65 transition-colors last:border-0 hover:text-white"
                    >
                      {h.content}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="rounded-[1.5rem] border-4 border-ink bg-orange p-6 text-white shadow-hard-lg">
            <p className="font-display text-xl uppercase">Prova dal vivo</p>
            <p className="mt-2 text-sm text-white/85">
              Leggere è bello, vivere è meglio. Guarda le esperienze legate a questo tema.
            </p>
            <ButtonLink to={`/categoria/${article.categorySlug}`} variant="dark" size="sm" className="mt-5">
              Esperienze {article.category} <ArrowRight size={13} />
            </ButtonLink>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t-4 border-ink bg-paper py-20">
          <div className="container-x">
            <div className="mb-10 flex items-end justify-between gap-6">
              <h2 className="font-display text-display-lg uppercase">Leggi anche</h2>
              <ButtonLink to="/blog" variant="white" size="sm" className="hidden md:inline-flex">
                Tutti gli articoli <ArrowRight size={13} />
              </ButtonLink>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((a, i) => (
                <ArticleCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-y bg-ink text-white">
        <div className="container-x grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-display-lg uppercase">
              Altre storie <span className="text-orange">in arrivo</span>
            </h2>
            <p className="mt-4 max-w-md text-white/70">Lascia la mail e ricevi le nuove guide su Napoli appena escono.</p>
          </div>
          <WaitlistForm source="articolo" tone="dark" />
        </div>
      </section>
    </Page>
  )
}

export default function BlogArticlePage() {
  const { slug } = useParams()
  const article = getArticleBySlug(slug ?? '')
  if (!article) return <Navigate to="/blog" replace />
  return <ArticleView key={article.slug} article={article} />
}
