import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import type { Article } from '../../types'
import { Sticker } from './Sticker'

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

export function ArticleCard({ article, index = 0, featured = false }: { article: Article; index?: number; featured?: boolean }) {
  return (
    <motion.article
      initial={{ y: 12 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.05, ease: [0.25, 1, 0.5, 1] }}
      className="h-full"
    >
      <Link
        to={`/blog/${article.slug}`}
        viewTransition
        className={`group flex h-full overflow-hidden rounded-3xl border border-line bg-white transition-[transform,box-shadow] duration-300 ease-out-quart hover:-translate-y-1 hover:shadow-soft ${
          featured ? 'flex-col md:flex-row' : 'flex-col'
        }`}
      >
        <div className={`relative overflow-hidden bg-cream ${featured ? 'aspect-[16/10] md:aspect-auto md:w-1/2' : 'aspect-[16/10]'}`}>
          <img
            src={article.coverImage}
            alt={article.title}
            width={1000}
            height={625}
            loading={featured ? 'eager' : 'lazy'}
            decoding="async"
            className="img-warm h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.04]"
          />
        </div>
        <div className={`flex flex-1 flex-col p-5 ${featured ? 'md:justify-center md:p-10' : ''}`}>
          <div className="flex items-center gap-3">
            <Sticker tone="cream">{article.category}</Sticker>
            <span className="text-xs text-ink/50">
              {formatDate(article.date)} · {article.readingTime} min
            </span>
          </div>
          <h3 className={`mt-4 font-semibold leading-snug ${featured ? 'heading-lg' : 'text-[17px]'}`}>
            {article.title}
          </h3>
          <p className={`mt-3 text-ink/60 ${featured ? 'max-w-prose text-base' : 'line-clamp-3 text-sm'}`}>{article.excerpt}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-orange">
            Leggi <ArrowRight size={14} />
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
