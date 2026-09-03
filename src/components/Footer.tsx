import { Link } from 'react-router'
import { Instagram, Mail, MapPin } from 'lucide-react'
import { Marquee } from './Marquee'
import { WaitlistForm } from './ui/WaitlistForm'

const columns = [
  {
    title: 'Esplora',
    links: [
      { label: 'Esperienze', to: '/esperienze' },
      { label: 'Blog', to: '/blog' },
      { label: 'Diventa creator', to: '/creator' },
    ],
  },
  {
    title: 'Scopri',
    links: [
      { label: 'Chi siamo', to: '/chi-siamo' },
      { label: 'Contatti', to: '/contatti' },
      { label: 'Crediti fotografici', to: '/crediti' },
    ],
  },
]

export const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="relative z-10 -mt-8 rounded-t-[3rem] bg-ink text-white">
      <div className="rounded-t-[3rem] border-b-4 border-ink bg-orange py-3">
        <Marquee text="COSE FIGHE • NAPOLI • ESPERIENZE • CREATOR • BLOG • " />
      </div>

      <div className="container-x pb-10 pt-16">
        <div className="mb-16 grid gap-12 border-b border-white/15 pb-16 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="font-display text-display-lg uppercase leading-none">Cose Fighe</p>
            <p className="mt-4 max-w-sm text-white/70">
              Esperienze autentiche a Napoli, curate da creator locali. Le prenotazioni aprono presto.
            </p>
          </div>
          <div>
            <h2 className="mb-4 font-display text-2xl uppercase">Avvisami quando aprono</h2>
            <WaitlistForm source="footer" tone="dark" />
          </div>
        </div>

        <div className="mb-16 grid grid-cols-2 gap-10 md:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-5 font-sans text-xs font-bold uppercase tracking-widest text-white/50">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} viewTransition className="text-sm text-white/80 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="mb-5 font-sans text-xs font-bold uppercase tracking-widest text-white/50">Contatti</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:ciao@cosefighe.it"
                  className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
                >
                  <Mail size={14} /> ciao@cosefighe.it
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/cosefighe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
                >
                  <Instagram size={14} /> @cosefighe
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-white/80">
                <MapPin size={14} /> Napoli, Campania
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-8 text-xs text-white/50 md:flex-row md:items-center">
          <span>© {year} Cose Fighe. Tutti i diritti riservati.</span>
          <nav aria-label="Legale" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/privacy" viewTransition className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link to="/cookie" viewTransition className="transition-colors hover:text-white">
              Cookie
            </Link>
            <Link to="/admin/login" className="text-white/30 transition-colors hover:text-white">
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
