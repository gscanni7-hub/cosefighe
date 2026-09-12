import { motion } from 'motion/react'
import { CircleCheckBig, Clock, Star } from 'lucide-react'
import type { Experience } from '../../types'
import { Sticker } from './Sticker'

interface ExperienceCardProps {
  exp: Experience
  index?: number
  /** column: foto sopra (default). row: foto a sinistra, per liste compatte. */
  layout?: 'column' | 'row'
}

export function ExperienceCard({ exp, index = 0, layout = 'column' }: ExperienceCardProps) {
  const row = layout === 'row'
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
      </div>

      <div className={`flex flex-1 flex-col ${row ? 'p-4 md:p-5' : 'p-5'}`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className={`font-semibold leading-snug ${row ? 'text-[15px] md:text-base' : 'text-[17px]'}`}>{exp.title}</h3>
          <span className="shrink-0 font-display text-xl text-orange">{exp.price}</span>
        </div>
        <p className="mt-2 text-sm text-ink/60">
          {exp.location} · {exp.duration} · {exp.group} pers.
        </p>
        {!row && (
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-ink/60">
            <CircleCheckBig size={14} className="mt-0.5 shrink-0" />
            <span>{exp.included}</span>
          </p>
        )}
        <div className={`mt-auto flex items-center justify-between text-sm ${row ? 'pt-3' : 'pt-5'}`}>
          <span className="flex items-center gap-1 font-semibold">
            <Star size={14} className="text-orange" fill="currentColor" />
            {exp.rating.toLocaleString('it-IT')}
            <span className="font-normal text-ink/45">({exp.reviews.toLocaleString('it-IT')})</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-ink/50">
            <Clock size={12} /> Prossimamente
          </span>
        </div>
      </div>
    </motion.article>
  )
}
