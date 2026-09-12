import { motion } from 'motion/react'
import { ArrowUpRight, Clock, MapPin } from 'lucide-react'
import type { CityEvent } from '../../types'
import { EVENT_CATEGORY_LABELS } from '../../data/events'
import { dayParts, formatShort } from '../../lib/dates'
import { Sticker } from './Sticker'

interface EventCardProps {
  event: CityEvent
  index?: number
  /** Giorno in cui la card viene mostrata: per gli eventi di più giorni cambia la nota "fino a". */
  shownOn?: string
}

/** Card di un evento in città: blocco data a sinistra, dettagli a destra. */
export function EventCard({ event, index = 0, shownOn }: EventCardProps) {
  const start = dayParts(event.start)
  const multi = !!event.end && event.end !== event.start
  const ongoing = multi && shownOn && shownOn > event.start
  return (
    <motion.article
      initial={{ y: 12 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.05, ease: [0.25, 1, 0.5, 1] }}
      className={`grid h-full grid-cols-[4.25rem_1fr] gap-4 rounded-3xl border bg-white p-4 transition-[transform,box-shadow] duration-300 ease-out-quart hover:-translate-y-1 hover:shadow-soft md:p-5 ${
        event.featured ? 'border-ink' : 'border-ink/10'
      }`}
    >
      <div className="flex flex-col items-center justify-start rounded-2xl bg-paper py-3 text-center">
        <span className="text-[11px] font-semibold uppercase text-ink/50">{start.wd}</span>
        <span className="font-display text-3xl leading-none text-orange">{start.day}</span>
        <span className="text-[11px] font-semibold uppercase text-ink/50">{start.mon}</span>
        {multi && <span className="mt-2 text-[10px] leading-tight text-ink/45">fino al {dayParts(event.end!).day}</span>}
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-1.5">
          <Sticker tone="cream">{EVENT_CATEGORY_LABELS[event.category]}</Sticker>
          {event.featured && <Sticker tone="orange">Da non perdere</Sticker>}
          {ongoing && <Sticker tone="outline">in corso</Sticker>}
        </div>
        <h3 className="mt-2.5 text-[17px] font-semibold leading-snug">{event.title}</h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/60">
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} /> {event.place}
          </span>
          {event.time && (
            <span className="inline-flex items-center gap-1">
              <Clock size={13} /> {event.time}
            </span>
          )}
          {multi && <span>{formatShort(event.start)} – {formatShort(event.end!)}</span>}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">{event.blurb}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="font-display text-lg text-orange">{event.price}</span>
          {event.url ? (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold underline decoration-ink/25 underline-offset-[5px] transition-colors hover:text-orange hover:decoration-orange"
            >
              Info e biglietti <ArrowUpRight size={14} />
            </a>
          ) : (
            <span className="text-xs font-medium text-ink/45">{event.area}</span>
          )}
        </div>
      </div>
    </motion.article>
  )
}
