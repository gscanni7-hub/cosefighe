import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, MapPin, Menu, X } from 'lucide-react'
import { ButtonLink } from './ui/Button'
import { SearchDialog } from './SearchDialog'
import { preloadMappa } from '../lib/mappaPreload'
import { track } from '../lib/track'
import { langOf, otherLangPath, useLp, useT, type Lang } from '../i18n/lang'

const navItems = [
  { label: 'Esperienze', to: '/esperienze' },
  { label: 'Cosa fare', to: '/cosa-fare' },
  { label: 'Blog', to: '/blog' },
  { label: 'Chi siamo', to: '/chi-siamo' },
  { label: 'Contatti', to: '/contatti' },
]

/** Selettore IT | EN: porta alla stessa pagina nell'altra lingua. light: su fondo bianco; dark: nel piè di pagina. */
export function LangSwitch({ tone = 'light', className = '' }: { tone?: 'light' | 'dark'; className?: string }) {
  const { pathname, search } = useLocation()
  const t = useT()
  const lang = langOf(pathname)
  const to = otherLangPath(pathname) + search
  const dark = tone === 'dark'
  const base = 'flex h-7 min-w-[32px] items-center justify-center rounded-full px-2 text-xs font-semibold tracking-wide transition-colors'
  const item = (l: Lang) => {
    const label = l === 'en' ? 'English' : 'Italiano'
    if (l === lang)
      return (
        <span lang={l} aria-label={label} aria-current="true" className={`${base} ${dark ? 'bg-white text-ink' : 'bg-ink text-white'}`}>
          {l.toUpperCase()}
        </span>
      )
    return (
      <Link
        to={to}
        hrefLang={l}
        lang={l}
        aria-label={label}
        onClick={() => track('lingua', { a: l })}
        className={`${base} ${dark ? 'text-white/70 hover:text-white' : 'text-ink/70 hover:bg-cream hover:text-ink'}`}
      >
        {l.toUpperCase()}
      </Link>
    )
  }
  return (
    <div role="group" aria-label={t('Lingua')} className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${dark ? 'border-white/25' : 'border-line bg-white'} ${className}`}>
      {item('it')}
      {item('en')}
    </div>
  )
}

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)
  const location = useLocation()
  const t = useT()
  const lp = useLp()

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

  const isActive = (it: string) => {
    const to = lp(it)
    return to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
  }

  return (
    <>
      <a href="#main" className="skip-link">
        {t('Vai al contenuto')}
      </a>
      <header
        className={`fixed top-0 z-50 w-full transition-[background-color,box-shadow,padding] duration-300 ease-out-quart ${
          scrolled ? 'bg-white/90 py-2 shadow-[0_1px_0_0_rgba(17,17,17,0.08)] backdrop-blur-md' : 'py-4'
        }`}
      >
        <div className="container-x flex items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link to={lp('/')} viewTransition className="shrink-0" aria-label={t('Cose Fighe, home')}>
            <img
              src="/logo-mark.webp"
              alt=""
              width={407}
              height={329}
              className={`w-auto object-contain transition-[height] duration-300 ease-out-quart ${scrolled ? 'h-8' : 'h-9 md:h-11'}`}
            />
          </Link>

          <nav aria-label={t('Principale')} className="hidden lg:block">
            <ul className="flex items-center gap-0.5 rounded-full border border-line bg-white p-1">
              {navItems.map((item) => {
                const active = isActive(item.to)
                return (
                  <li key={item.to}>
                    <Link
                      to={lp(item.to)}
                      viewTransition
                      aria-current={active ? 'page' : undefined}
                      className={`block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        active ? 'bg-ink text-white' : 'text-ink/75 hover:bg-cream hover:text-ink'
                      }`}
                    >
                      {t(item.label)}
                    </Link>
                  </li>
                )
              })}
              <li>
                <Link
                  to={lp('/mappa')}
                  viewTransition
                  aria-label={t('La mappa di Napoli')}
                  title={t('La mappa')}
                  onMouseEnter={preloadMappa}
                  onTouchStart={preloadMappa}
                  aria-current={isActive('/mappa') ? 'page' : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-cream hover:text-ink ${isActive('/mappa') ? 'bg-ink text-white hover:bg-ink hover:text-white' : 'text-ink/75'}`}
                >
                  <MapPin size={16} />
                </Link>
              </li>
              <li className="ml-1 pr-0.5">
                <LangSwitch />
              </li>
            </ul>
          </nav>

          <div className="flex items-center justify-end gap-3">
            <div className="hidden lg:block">
              <ButtonLink to="/contatti" size="sm">
                {t('Scrivici')} <ArrowRight size={14} />
              </ButtonLink>
            </div>
            <LangSwitch className="lg:hidden" />
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-cream lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? t('Chiudi il menu') : t('Apri il menu')}
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
              aria-label={t('Menu')}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="container-x mt-3 lg:hidden"
            >
              <ul className="overflow-hidden rounded-3xl border border-line bg-white p-2 shadow-soft">
                <li>
                  <Link to={lp('/mappa')} viewTransition onTouchStart={preloadMappa} onMouseEnter={preloadMappa} className="mb-1 flex w-full items-center gap-3 rounded-2xl bg-sand px-4 py-3.5 text-left text-base font-semibold text-ink">
                    <MapPin size={18} className="text-orange" />
                    {t('La mappa di Napoli')}
                  </Link>
                </li>
                {navItems.map((item) => {
                  const active = isActive(item.to)
                  return (
                    <li key={item.to}>
                      <Link
                        to={lp(item.to)}
                        viewTransition
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors ${
                          active ? 'bg-ink text-white' : 'hover:bg-cream'
                        }`}
                      >
                        {t(item.label)}
                        <ArrowRight size={16} className={active ? 'text-white/70' : 'text-ink/60'} />
                      </Link>
                    </li>
                  )
                })}
                <li className="px-2 pb-1 pt-3">
                  <ButtonLink to="/contatti" className="w-full">
                    {t('Scrivici')} <ArrowRight size={16} />
                  </ButtonLink>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <SearchDialog open={search} onClose={() => setSearch(false)} onOpen={() => setSearch(true)} />
    </>
  )
}
