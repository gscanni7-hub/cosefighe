import type { ReactNode } from 'react'
import { FloatingImage } from '../Decorations'

interface EmptyStateProps {
  title: string
  text?: string
  actions?: ReactNode
  mascot?: string
  className?: string
}

/** Stato vuoto, di errore o "niente trovato": mascotte, una riga, un'uscita. Uguale in tutto il sito. */
export function EmptyState({ title, text, actions, mascot = '/mascotte-binocolo.webp', className = '' }: EmptyStateProps) {
  return (
    <div className={`card grid items-center gap-8 p-8 md:grid-cols-[0.7fr_1.3fr] md:p-12 ${className}`} role="status">
      <div className="mx-auto w-[150px] md:w-[200px]" aria-hidden="true">
        <FloatingImage src={mascot} amplitude={8} />
      </div>
      <div>
        <h3 className="heading-md">{title}</h3>
        {text && <p className="mt-3 max-w-md text-ink/60">{text}</p>}
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  )
}
