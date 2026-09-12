import { motion } from 'motion/react'
import { ArrowUpRight, CircleCheckBig, Clock, Heart, Star } from 'lucide-react'
import { PROVIDER_LABEL, type Experience } from '../../types'
import { track } from '../../lib/track'
import { Sticker } from './Sticker'
import { useSaved } from '../../lib/saved'

interface ExperienceCardProps {
  exp: Experience
  /** Nome della categoria, mostrato nella riga sopra il titolo. */
  category?: string
  index?: number
  /** column: foto sopra (default). row: foto a sinistra, per liste compatte. */
  layout?: 'column' | 'row'
}

const groupMax = (group: string) => {
  const nums = group.match(/\d+/g)
  return nums ? nums[nums.length - 1] : null
}

export function ExperienceCard({ exp, category, index = 0, layout = 'column' }: ExperienceCardProps) {
  const row = layout === 'row'
  const { has, toggle } = useSaved()
  const saved = has(exp.title)
  const max = groupMax(exp.group)

  return (
    <motion.article
      initial={{ y: 12 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.05, ease: [0.25, 1, 0.5, 1] }}
      className={`card group flex h-full overflow-hidden transition-[transform,box-shadow] duration-300 ease-out-quart hover:-translate-y-1 hover:shadow-soft ${
        row ? 'flex-row' : 'flex-col'
      }`}
    >
      <div className={`relative overflow-hidden bg-cream ${row ? 'w-2/5 shrink-0' : 'aspect-[4/3]'}`}>
        <img
          src={exp.image}
          alt={exp.title}
          width={800}
          height={600}
          loading="lazy"
          decoding="async"
          className="img-warm h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3">
          <Sticker tone="white">{exp.tag}</Sticker>
        </div>
        <button
          type="button"
          onClick={() => toggle(exp.title)}
          aria-pressed={saved}
          aria-label={saved ? `Togli "${exp.title}" dalle salvate` : `Salva "${exp.title}"`}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-[0_1px_2px_rgba(17,17,17,0.12)] transition-[transform,color] duration-200 ease-out-quart hover:scale-105 active:scale-95 ${
            saved ? 'text-orange' : 'text-ink'
          }`}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} strokeWidth={2.2} />
        </button>
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${row ? 'p-4 md:p-5' : 'p-5'}`}>
        <p className="label text-ink/45">
          {category ? `${category} · ` : ''}
          {exp.duration}
        </p>
        <h3 className={`mt-1.5 font-semibold leading-snug ${row ? 'text-[15px] md:text-base' : 'text-[17px]'}`}>{exp.title}</h3>
        <p className="mt-2 text-sm text-ink/60">
          {exp.location}
          {max ? ` · fino a ${max} persone` : ''}
        </p>
        {!row && (
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-ink/60">
            <CircleCheckBig size={14} className="mt-0.5 shrink-0 text-success" />
            <span>{exp.included}</span>
          </p>
        )}

        <div className={`mt-auto flex items-end justify-between gap-3 ${row ? 'pt-3' : 'pt-5'}`}>
          <div className="text-sm">
            <span className="flex items-center gap-1 font-semibold">
              <Star size={14} className="text-orange" fill="currentColor" />
              {exp.rating.toLocaleString('it-IT')}
              <span className="font-normal text-ink/45">({exp.reviews.toLocaleString('it-IT')})</span>
            </span>
            {exp.affiliateUrl && exp.provider && exp.provider !== 'cosefighe' ? (
              <a
                href={exp.affiliateUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                data-track={`prenota:${exp.title}`}
                onClick={() => track('prenota', { provider: exp.provider ?? '', title: exp.title })}
                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-ink underline decoration-ink/25 underline-offset-[4px] transition-colors hover:text-orange hover:decoration-orange"
              >
                Prenota su {PROVIDER_LABEL[exp.provider]} <ArrowUpRight size={12} />
              </a>
            ) : (
              <span className="mt-1 flex items-center gap-1 text-xs text-ink/45">
                <Clock size={11} /> Prenotazioni in arrivo
              </span>
            )}
          </div>
          <div className="text-right leading-none">
            <span className="text-[11px] font-medium text-ink/45">da</span>
            <span className="ml-1 font-display text-2xl text-orange">{exp.price}</span>
            <span className="block text-[11px] text-ink/45">a persona</span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
