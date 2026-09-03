import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { ButtonLink } from './ui/Button'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Esperienze', to: '/esperienze' },
  { label: 'Blog', to: '/blog' },
  { label: 'Creator', to: '/creator' },
  { label: 'Chi siamo', to: '/chi-siamo' },
  { label: 'Contatti', to: '/contatti' },
]

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const isActive = (to: string) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to))

  return (
    <>
      <a href="#main" className="skip-link">
        Vai al contenuto
      </a>
      <header
        className={`fixed top-0 z-50 w-full transition-[padding,background-color,box-shadow] duration-300 ease-out-quart ${
          scrolled ? 'bg-white/95 py-2 shadow-[0_2px_0_0_#111111] backdrop-blur-md' : 'py-3'
        }`}
      >
        <div className="container-x flex items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link to="/" viewTransition className="flex-shrink-0" aria-label="Cose Fighe, home">
            <img
              src="/logo-2.webp"
              alt=""
              width={644}
              height={800}
              className={`w-auto object-contain transition-[height] duration-300 ease-out-quart ${
                scrolled ? 'h-10 md:h-12' : 'h-14 md:h-[76px]'
              }`}
            />
          </Link>

          <nav aria-label="Principale" className="hidden lg:block">
            <ul
              className={`flex items-center gap-1 rounded-full border-2 border-ink p-1.5 transition-[background-color,box-shadow] duration-300 ${
                scrolled ? 'bg-white shadow-hard' : 'bg-white/90 shadow-[4px_4px_0_0_rgba(17,17,17,0.35)] backdrop-blur-sm'
              }`}
            >
              {navItems.map((item) => {
                const active = isActive(item.to)
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      viewTransition
                      aria-current={active ? 'page' : undefined}
                      className={`relative block overflow-hidden rounded-full px-4 py-2 font-sans text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${
                        active ? 'bg-orange text-white' : 'text-ink hover:text-white'
                      }`}
                    >
                      {!active && (
                        <motion.span
                          className="absolute inset-0 origin-left rounded-full bg-orange"
                          initial={{ scaleX: 0 }}
                          whileHover={{ scaleX: 1 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-3">
            <ButtonLink to="/contatti" variant="dark" size="sm" className="hidden lg:inline-flex">
              Scrivici <ArrowRight size={14} />
            </ButtonLink>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-ink text-white shadow-[3px_3px_0_0_#ff5500] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Chiudi il menu' : 'Apri il menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-menu"
              aria-label="Menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="container-x mt-3 lg:hidden"
            >
              <ul className="overflow-hidden rounded-[1.75rem] border-2 border-ink bg-white shadow-hard-lg">
                {navItems.map((item, i) => {
                  const active = isActive(item.to)
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        viewTransition
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center justify-between px-6 py-4 font-display text-2xl uppercase transition-colors ${
                          active ? 'bg-orange text-white' : 'hover:bg-cream'
                        } ${i < navItems.length - 1 ? 'border-b-2 border-ink' : ''}`}
                      >
                        {item.label}
                        <ArrowRight size={18} />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
