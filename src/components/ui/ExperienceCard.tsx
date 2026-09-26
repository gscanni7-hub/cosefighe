import { motion } from 'motion/react'
import { Link } from 'react-router'
import { ArrowUpRight, CircleCheckBig, Clock, Heart, Star } from 'lucide-react'
import type { Experience } from '../../types'
import { track } from '../../lib/track'
import { Sticker } from './Sticker'
import { useSaved } from '../../lib/saved'
import { experiencePath } from '../../data/schede'
import { CARD_SIZES, imgSrcSet } from '../../lib/img'
import { useLang, useLp, useT } from '../../i18n/lang'
import { localizeExperience } from '../../i18n/content'

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

export function ExperienceCard({ exp: source, category, index = 0, layout = 'column' }: ExperienceCardProps) {
  const lang = useLang()
  const t = useT()
  const lp = useLp()
  // I testi nella lingua della pagina; salvataggi, indirizzo e misure restano legati al titolo italiano.
  const exp = localizeExperience(source, lang)
  const locale = lang === 'en' ? 'en-GB' : 'it-IT'
  const row = layout === 'row'
  // In riga la foto occupa 2/5 della card da tablet in su.
  const sizes = row ? '(min-width: 768px) 400px, 100vw' : CARD_SIZES
  const max = groupMax(exp.group)
  const { has, toggle } = useSaved()
  const saved = has(source.title)
  const bookable = !!exp.affiliateUrl && !!exp.provider && exp.provider !== 'cosefighe'
  const providerLabel = exp.provider === 'viator' ? 'Viator' : 'GetYourGuide'
  const path = experiencePath(source)
  const page = path ? lp(path) : undefined
  const linkProps = {
    href: exp.affiliateUrl,
    target: '_blank',
    rel: 'sponsored noopener noreferrer',
    onClick: () => track('prenota', { provider: exp.provider ?? '', title: source.title }),
  }

  return (
    <motion.article
      initial={{ y: 12 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.05, ease: [0.25, 1, 0.5, 1] }}
      className={`card group flex h-full overflow-hidden transition-[transform,box-shadow] duration-300 ease-out-quart hover:-translate-y-1 hover:shadow-soft ${
        row ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      <div className={`relative overflow-hidden bg-cream ${row ? 'aspect-[4/3] md:aspect-auto md:w-2/5 md:shrink-0' : 'aspect-[4/3]'}`}>
        {page ? (
          <Link to={page} viewTransition aria-label={t('Scheda di "{titolo}"', { titolo: exp.title })} className="block h-full w-full">
            <img
              src={exp.image}
              srcSet={imgSrcSet(exp.image)}
              sizes={sizes}
              alt={exp.title}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="img-warm h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.04]"
            />
          </Link>
        ) : bookable ? (
          <a {...linkProps} data-track={`prenota:${source.title}`} aria-label={t('Prenota "{titolo}" su {sito}', { titolo: exp.title, sito: providerLabel })} className="block h-full w-full">
            <img
              src={exp.image}
              srcSet={imgSrcSet(exp.image)}
              sizes={sizes}
              alt={exp.title}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="img-warm h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.04]"
            />
          </a>
        ) : (
          <img
            src={exp.image}
            srcSet={imgSrcSet(exp.image)}
            sizes={sizes}
            alt={exp.title}
            width={800}
            height={600}
            loading="lazy"
            decoding="async"
            className="img-warm h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.04]"
          />
        )}
        <div className="absolute left-3 right-14 top-3">
          <Sticker tone="white" className="max-w-full">
            <span className="truncate">{exp.tag}</span>
          </Sticker>
        </div>
        <button
          type="button"
          onClick={() => toggle(source.title)}
          aria-pressed={saved}
          aria-label={saved ? t('Togli "{titolo}" dalle salvate', { titolo: exp.title }) : t('Salva "{titolo}"', { titolo: exp.title })}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur-sm transition-[transform,color] duration-200 ease-out-quart hover:scale-105 active:scale-95 ${
            saved ? 'text-orange' : 'text-ink'
          }`}
        >
          <Heart size={16} fill={saved ? 'currentColor' : 'none'} strokeWidth={2.2} />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <p className="label text-ink/45">
          {category ? `${category} · ` : ''}
          {exp.duration}
        </p>
        <h3 className={`mt-1.5 font-semibold leading-snug ${row ? 'text-[17px] md:text-base' : 'text-[17px]'}`}>
          {page ? (
            <Link to={page} viewTransition className="transition-colors hover:text-orange">
              {exp.title}
            </Link>
          ) : bookable ? (
            <a {...linkProps} data-track={`prenota:${source.title}`} className="transition-colors hover:text-orange">
              {exp.title}
            </a>
          ) : (
            exp.title
          )}
        </h3>
        <p className="mt-2 text-sm text-ink/60">
          {exp.location}
          {max ? ` · ${t('fino a {n} persone', { n: max })}` : ''}
        </p>
        <p className={`mt-1.5 flex items-start gap-1.5 text-sm text-ink/60 ${row ? 'md:hidden' : ''}`}>
          <CircleCheckBig size={14} className="mt-0.5 shrink-0 text-success" />
          <span>{exp.included}</span>
        </p>

        <div className={`mt-auto flex items-end justify-between gap-3 ${row ? 'pt-4 md:pt-3' : 'pt-5'}`}>
          <div className="text-sm">
            <span className="flex items-center gap-1 font-semibold">
              <Star size={14} className="text-orange" fill="currentColor" />
              {exp.rating.toLocaleString(locale)}
              <span className="font-normal text-ink/45">({exp.reviews.toLocaleString(locale)})</span>
            </span>
            {bookable ? (
              <a
                {...linkProps}
                data-track={`prenota:${source.title}`}
                aria-label={t('Prenota "{titolo}" su {sito}', { titolo: exp.title, sito: providerLabel })}
                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-ink underline decoration-ink/25 underline-offset-[4px] transition-colors hover:text-orange hover:decoration-orange"
              >
                {t('Prenota')} <ArrowUpRight size={12} />
              </a>
            ) : (
              <span className="mt-1 flex items-center gap-1 text-xs text-ink/45">
                <Clock size={11} /> {t('Prenotazioni in arrivo')}
              </span>
            )}
          </div>
          <div className="text-right leading-none">
            <span className="text-[11px] font-medium text-ink/45">{t('da')}</span>
            <span className="ml-1 font-display text-2xl text-orange">{exp.price}</span>
            <span className="block text-[11px] text-ink/45">{t('a persona')}</span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
