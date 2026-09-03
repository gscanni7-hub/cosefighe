import { motion } from 'motion/react'
import { CircleCheckBig, Clock, MapPin, Star, Users } from 'lucide-react'
import type { Experience, ExperienceColor } from '../../types'
import { Sticker } from './Sticker'

const tones: Record<
  ExperienceColor,
  { body: string; muted: string; star: string; tag: 'ink' | 'white' | 'orange'; soon: string }
> = {
  orange: {
    body: 'bg-orange text-white',
    muted: 'text-white/80',
    star: 'text-white',
    tag: 'ink',
    soon: 'border-white/70 text-white',
  },
  blue: {
    body: 'bg-blue text-white',
    muted: 'text-white/80',
    star: 'text-white',
    tag: 'white',
    soon: 'border-white/70 text-white',
  },
  white: {
    body: 'bg-white text-ink',
    muted: 'text-ink/60',
    star: 'text-orange',
    tag: 'orange',
    soon: 'border-ink text-ink',
  },
}

interface ExperienceCardProps {
  exp: Experience
  index?: number
}

export function ExperienceCard({ exp, index = 0 }: ExperienceCardProps) {
  const t = tones[exp.color]
  return (
    <motion.article
      initial={{ y: 18 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.06, ease: [0.25, 1, 0.5, 1] }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-[2rem] border-4 border-ink bg-white shadow-hard-lg transition-shadow duration-200 hover:shadow-hard-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b-4 border-ink bg-cream">
        <img
          src={exp.image}
          alt={exp.title}
          width={800}
          height={600}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Sticker tone={t.tag} rotate={-2}>
            {exp.tag}
          </Sticker>
        </div>
        <div className="absolute right-3 top-3">
          <Sticker tone="white" rotate={2} className="text-sm normal-case tracking-normal">
            {exp.price}
          </Sticker>
        </div>
      </div>

      <div className={`flex flex-1 flex-col p-5 md:p-6 ${t.body}`}>
        <h3 className="mb-4 flex-1 font-display text-xl uppercase leading-[1.05] md:text-2xl">{exp.title}</h3>
        <ul className={`mb-5 space-y-1.5 text-xs md:text-[13px] ${t.muted}`}>
          <li className="flex items-center gap-1.5">
            <MapPin size={12} className="flex-shrink-0" />
            <span>{exp.location}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <CircleCheckBig size={12} className="flex-shrink-0" />
            <span>{exp.included}</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {exp.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={12} />
              {exp.group} pers.
            </span>
          </li>
        </ul>
        <div className="flex items-center justify-between gap-3">
          <span className={`flex items-center gap-1 text-sm font-bold ${t.star}`}>
            <Star size={13} fill="currentColor" />
            {exp.rating.toLocaleString('it-IT')}
            <span className={`text-xs font-normal ${t.muted}`}>({exp.reviews.toLocaleString('it-IT')})</span>
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${t.soon}`}
          >
            <Clock size={10} /> Prossimamente
          </span>
        </div>
      </div>
    </motion.article>
  )
}
