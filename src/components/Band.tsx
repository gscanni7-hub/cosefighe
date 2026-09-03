import { Marquee } from './Marquee'

type Tone = 'orange' | 'ink' | 'white' | 'blue'

const tones: Record<Tone, string> = {
  orange: 'bg-orange text-ink',
  ink: 'bg-ink text-white',
  white: 'bg-white text-ink',
  blue: 'bg-blue text-white',
}

interface BandProps {
  text: string
  tone?: Tone
  tilt?: -1 | 1
  outline?: boolean
  className?: string
}

/** Fascia scorrevole inclinata. Il contenitore taglia l'eccedenza laterale, così la pagina non scorre in orizzontale. */
export function Band({ text, tone = 'orange', tilt = -1, outline = false, className = '' }: BandProps) {
  const light = tone === 'ink' || tone === 'blue'
  return (
    <div className={`relative z-10 overflow-hidden py-3 ${className}`} aria-hidden="true">
      <div
        className={`border-y-4 border-ink py-2 ${tones[tone]} ${tilt === -1 ? '-rotate-1' : 'rotate-1'} scale-x-[1.03]`}
      >
        <Marquee text={text} light={light} outline={outline} />
      </div>
    </div>
  )
}
