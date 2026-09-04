import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'

interface PageHeroProps {
  tone?: 'paper' | 'white'
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
  back?: { to: string; label: string }
}

/** Apertura di pagina: titolo a sinistra, eventuale illustrazione a destra, fondo chiaro. */
export function PageHero({ tone = 'paper', eyebrow, title, subtitle, actions, aside, back }: PageHeroProps) {
  return (
    <section className={`${tone === 'paper' ? 'bg-paper' : 'bg-white'} pt-28 pb-12 md:pt-36 md:pb-16`}>
      <div
        className={`container-x grid items-center gap-10 ${
          aside ? 'md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]' : ''
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          {back && (
            <Link
              to={back.to}
              viewTransition
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
            >
              <ArrowLeft size={14} /> {back.label}
            </Link>
          )}
          {eyebrow && <p className="label mb-4 text-orange">{eyebrow}</p>}
          <h1 className="font-display text-display-xl uppercase tracking-tight">{title}</h1>
          {subtitle && <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/65">{subtitle}</p>}
          {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
        </motion.div>
        {aside && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.25, 1, 0.5, 1] }}
            className="relative"
          >
            {aside}
          </motion.div>
        )}
      </div>
    </section>
  )
}
