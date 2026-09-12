import type { ReactNode } from 'react'

type Tone = 'cream' | 'orange' | 'ink' | 'white' | 'outline'

const tones: Record<Tone, string> = {
  cream: 'bg-cream text-ink',
  orange: 'bg-orange text-white',
  ink: 'bg-ink text-white',
  white: 'bg-white/95 text-ink shadow-[0_1px_2px_rgba(17,17,17,0.08)]',
  outline: 'bg-transparent text-ink/70 border border-line',
}

interface StickerProps {
  children: ReactNode
  tone?: Tone
  className?: string
}

/** Piccola etichetta a pillola per tag e categorie. */
export function Sticker({ children, tone = 'cream', className = '' }: StickerProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 label ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
