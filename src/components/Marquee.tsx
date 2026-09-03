import { motion } from 'motion/react'

interface MarqueeProps {
  text: string
  outline?: boolean
  reverse?: boolean
  /** Usa colori chiari (per fasce su fondo scuro) */
  light?: boolean
}

export const Marquee = ({ text, outline = false, reverse = false, light = false }: MarqueeProps) => {
  const color = outline ? (light ? 'text-outline-light' : 'text-outline') : light ? 'text-white' : 'text-brand-dark'
  return (
    <div className="relative flex overflow-x-hidden w-full bg-transparent py-4">
      <motion.div
        className="whitespace-nowrap flex"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {[...Array(4)].map((_, i) => (
          <span key={i} className={`text-6xl md:text-8xl font-display uppercase px-8 ${color}`}>
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
