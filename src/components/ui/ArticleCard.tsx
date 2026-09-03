import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight, Clock } from 'lucide-react'
import type { Article } from '../../types'
import { Sticker } from './Sticker'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

export function ArticleCard({ article, index = 0, featured = false }: { article: Article; index?: number; featured?: boolean }) {
  return (
    <motion.article
      initial={{ y: 18 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.06, ease: [0.25, 1, 0.5, 1] }}
      className="h-full"
    >
      <Link
        to={`/blog/${article.slug}`}
        viewTransition
        className={`group flex h-full overflow-hidden rounded-[2rem] border-4 border-ink bg-white shadow-hard-lg transition-[transform,box-shadow] duration-200 ease-out-quart hover:-translate-y-1.5 hover:shadow-hard-xl ${
          featured ? 'flex-col md:flex-row' : 'flex-col'
        }`}
      >
        <div
          className={`relative overflow-hidden bg-cream ${
            featured ? 'aspect-[16/10] border-b-4 border-ink md:aspect-auto md:w-1/2 md:border-b-0 md:border-r-4' : 'aspect-[16/10] border-b-4 border-ink'
          }`}
        >
          <img
            src={article.coverImage}
            alt={article.title}
            width={1000}
            height={625}
            loading={featured ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-105"
          />
          <div className="absolute left-3 top-3">
            <Sticker tone="orange" rotate={-2}>
              {article.category}
            </Sticker>
          </div>
        </div>
        <div className={`flex flex-1 flex-col p-5 md:p-6 ${featured ? 'md:justify-center md:p-10' : ''}`}>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/50">
            <span>{formatDate(article.date)}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {article.readingTime} min
            </span>
          </p>
          <h3 className={`mt-3 font-display uppercase leading-[1.05] ${featured ? 'text-display-md md:text-display-lg' : 'text-2xl'}`}>
            {article.title}
          </h3>
          <p className={`mt-3 text-ink/65 ${featured ? 'max-w-prose text-base md:text-lg' : 'line-clamp-3 text-sm'}`}>
            {article.excerpt}
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink transition-colors group-hover:text-orange">
            Leggi l'articolo <ArrowRight size={13} />
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
