import type { ReactNode } from 'react'

type Tone = 'white' | 'orange' | 'ink' | 'blue' | 'cream'

const tones: Record<Tone, string> = {
  white: 'bg-white text-ink',
  orange: 'bg-orange text-white',
  ink: 'bg-ink text-white',
  blue: 'bg-blue text-white',
  cream: 'bg-cream text-ink',
}

interface StickerProps {
  children: ReactNode
  tone?: Tone
  rotate?: -3 | -2 | 0 | 2 | 3
  className?: string
}

const rotations = { '-3': '-rotate-3', '-2': '-rotate-2', '0': '', '2': 'rotate-2', '3': 'rotate-3' } as const

/** Etichetta stile adesivo: bordo nero, ombra dura, leggera rotazione. */
export function Sticker({ children, tone = 'white', rotate = 0, className = '' }: StickerProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-[0.14em] shadow-hard-sm ${tones[tone]} ${rotations[String(rotate) as keyof typeof rotations]} ${className}`}
    >
      {children}
    </span>
  )
}
