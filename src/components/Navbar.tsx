import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { ButtonLink } from './ui/Button'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Esperienze', to: '/esperienze' },
  { label: 'Cosa fare', to: '/cosa-fare' },
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
    const onScroll = () => setScrolled(window.scrollY > 16)
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
        className={`fixed top-0 z-50 w-full transition-[background-color,box-shadow,padding] duration-300 ease-out-quart ${
          scrolled ? 'bg-white/90 py-2 shadow-[0_1px_0_0_rgba(17,17,17,0.08)] backdrop-blur-md' : 'py-4'
        }`}
      >
        <div className="container-x flex items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link to="/" viewTransition className="shrink-0" aria-label="Cose Fighe, home">
            <img
              src="/logo-mark.webp"
              alt=""
              width={407}
              height={329}
              className={`w-auto object-contain transition-[height] duration-300 ease-out-quart ${scrolled ? 'h-8' : 'h-9 md:h-11'}`}
            />
          </Link>

          <nav aria-label="Principale" className="hidden lg:block">
            <ul className="flex items-center gap-0.5 rounded-full border border-ink/10 bg-white/90 p-1 backdrop-blur-sm">
              {navItems.map((item) => {
                const active = isActive(item.to)
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      viewTransition
                      aria-current={active ? 'page' : undefined}
                      className={`block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        active ? 'bg-ink text-white' : 'text-ink/75 hover:bg-cream hover:text-ink'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-3">
            <ButtonLink to="/contatti" size="sm" className="hidden lg:inline-flex">
              Scrivici <ArrowRight size={14} />
            </ButtonLink>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-ink transition-colors hover:bg-cream lg:hidden"
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
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="container-x mt-3 lg:hidden"
            >
              <ul className="overflow-hidden rounded-3xl border border-ink/10 bg-white p-2 shadow-soft">
                {navItems.map((item) => {
                  const active = isActive(item.to)
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        viewTransition
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors ${
                          active ? 'bg-ink text-white' : 'hover:bg-cream'
                        }`}
                      >
                        {item.label}
                        <ArrowRight size={16} className={active ? 'text-white/70' : 'text-ink/40'} />
                      </Link>
                    </li>
                  )
                })}
                <li className="p-2 pt-3">
                  <ButtonLink to="/contatti" className="w-full">
                    Scrivici <ArrowRight size={14} />
                  </ButtonLink>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
