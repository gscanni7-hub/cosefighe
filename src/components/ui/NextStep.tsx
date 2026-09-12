import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { ButtonLink } from './Button'
import { Reveal } from './Reveal'

interface NextStepProps {
  title: string
  text: string
  primary: { to: string; label: ReactNode }
  secondary?: { to: string; label: ReactNode }
}

/** Chiusura di pagina: un rimando alla prossima cosa utile. Nessun modulo: quello sta nel piè di pagina. */
export function NextStep({ title, text, primary, secondary }: NextStepProps) {
  return (
    <section className="section-y bg-paper">
      <div className="container-x grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <h2 className="heading-lg">{title}</h2>
          <p className="mt-4 max-w-md text-ink/60">{text}</p>
        </Reveal>
        <Reveal delay={0.08} className="flex flex-wrap gap-3 md:justify-end">
          <ButtonLink to={primary.to}>
            {primary.label} <ArrowRight size={16} />
          </ButtonLink>
          {secondary && (
            <ButtonLink to={secondary.to} variant="secondary">
              {secondary.label}
            </ButtonLink>
          )}
        </Reveal>
      </div>
    </section>
  )
}
