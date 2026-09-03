import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Sticker } from './Sticker'

type Tone = 'orange' | 'blue' | 'ink' | 'paper'

const tones: Record<Tone, string> = {
  orange: 'bg-orange text-white',
  blue: 'bg-blue text-white',
  ink: 'bg-ink text-white',
  paper: 'bg-paper text-ink',
}

interface PageHeroProps {
  tone?: Tone
  kicker?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
  backdrop?: ReactNode
}

/** Apertura di pagina: colore pieno, etichetta, titolo enorme a sinistra, elemento illustrativo a destra. */
export function PageHero({ tone = 'orange', kicker, title, subtitle, actions, aside, backdrop }: PageHeroProps) {
  const light = tone !== 'paper'
  return (
    <section className={`relative overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24 ${tones[tone]}`}>
      {backdrop}
      <div className={`pointer-events-none absolute inset-0 dots ${light ? 'text-white/15' : 'text-ink/10'}`} aria-hidden="true" />
      <div className="container-x relative grid items-end gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          {kicker && (
            <div className="mb-6">
              <Sticker tone={light ? 'white' : 'orange'} rotate={-2}>
                {kicker}
              </Sticker>
            </div>
          )}
          <h1 className="font-display text-display-xl uppercase tracking-tight">{title}</h1>
          {subtitle && (
            <p className={`mt-6 max-w-xl text-lg leading-relaxed md:text-xl ${light ? 'text-white/80' : 'text-ink/65'}`}>
              {subtitle}
            </p>
          )}
          {actions && <div className="mt-8 flex flex-wrap items-center gap-4">{actions}</div>}
        </motion.div>
        {aside && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="relative"
          >
            {aside}
          </motion.div>
        )}
      </div>
    </section>
  )
}
