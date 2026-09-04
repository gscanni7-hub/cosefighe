import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'

interface FloatingBlobProps {
  className?: string
  color?: string
  delay?: number
}

export const FloatingBlob = ({ className = '', color = '#FFD600', delay = 0 }: FloatingBlobProps) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{ y: [0, -30, 0], x: [0, 10, -10, 0] }}
    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
    aria-hidden="true"
  >
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill={color} stroke="#111111" strokeWidth="4" />
      <circle cx="35" cy="40" r="6" fill="#111111" />
      <circle cx="65" cy="40" r="6" fill="#111111" />
      <path d="M35 65C35 65 45 75 65 65" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
      <path d="M10 50C-5 40 10 20 20 40" fill="white" stroke="#111111" strokeWidth="4" strokeLinejoin="round" />
      <path d="M90 50C105 40 90 20 80 40" fill="white" stroke="#111111" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  </motion.div>
)

interface FloatingImageProps {
  src: string
  alt?: string
  className?: string
  delay?: number
  amplitude?: number
}

/** Immagine che fluttua lentamente. La larghezza si imposta con className sul contenitore. */
export const FloatingImage = ({ src, alt = '', className = '', delay = 0, amplitude = 18 }: FloatingImageProps) => (
  <motion.div
    className={className}
    animate={{ y: [0, -amplitude, 0], rotate: [0, 3, -3, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
    aria-hidden={alt === '' ? true : undefined}
  >
    <img src={src} alt={alt} className="h-auto w-full object-contain drop-shadow-2xl" decoding="async" />
  </motion.div>
)

interface ParallaxProps {
  children: ReactNode
  speed?: number
  className?: string
}

export const Parallax = ({ children, speed = 1, className = '' }: ParallaxProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [60 * speed, -60 * speed])
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

interface MouseParallaxProps {
  children: ReactNode
  strength?: number
  className?: string
}

/** Sposta leggermente il contenuto seguendo il mouse. Disattivato su touch e con "riduci movimento". */
export const MouseParallax = ({ children, strength = 12, className = '' }: MouseParallaxProps) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 60, damping: 18, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 60, damping: 18, mass: 0.6 })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e: MouseEvent) => {
      x.set((e.clientX / window.innerWidth - 0.5) * strength * 2)
      y.set((e.clientY / window.innerHeight - 0.5) * strength * 2)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [strength, x, y])

  return (
    <motion.div style={{ x: sx, y: sy }} className={className}>
      {children}
    </motion.div>
  )
}

interface DragScrollProps {
  children: ReactNode
  className?: string
  ariaLabel?: string
}

/** Striscia orizzontale scorrevole anche trascinando con il mouse. */
export const DragScroll = ({ children, className = '', ariaLabel }: DragScrollProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const state = useRef({ down: false, startX: 0, scroll: 0, moved: false })

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    state.current = { down: true, startX: e.clientX, scroll: ref.current.scrollLeft, moved: false }
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!state.current.down || !ref.current) return
    const dx = e.clientX - state.current.startX
    if (Math.abs(dx) > 4) state.current.moved = true
    ref.current.scrollLeft = state.current.scroll - dx
  }
  const end = () => {
    state.current.down = false
  }
  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (state.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      state.current.moved = false
    }
  }

  return (
    <div
      ref={ref}
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerLeave={end}
      onClickCapture={onClickCapture}
      className={`cursor-grab select-none active:cursor-grabbing ${className}`}
    >
      {children}
    </div>
  )
}
