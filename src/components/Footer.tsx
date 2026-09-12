import { Link } from 'react-router'
import { Instagram, Mail, MapPin } from 'lucide-react'
import { WaitlistForm } from './ui/WaitlistForm'

const columns = [
  {
    title: 'Esplora',
    links: [
      { label: 'Esperienze', to: '/esperienze' },
      { label: 'Cosa fare a Napoli', to: '/cosa-fare' },
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
    <footer className="bg-ink text-white">
      <div className="container-x pb-10 pt-16 md:pt-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="font-display text-display-lg uppercase leading-none">Cose Fighe</p>
            <p className="mt-4 max-w-sm text-white/65">
              Esperienze autentiche a Napoli, curate da creator locali. Le prenotazioni aprono presto.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Avvisami quando aprono le prenotazioni</p>
            <WaitlistForm source="footer" tone="dark" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="label mb-4 text-white/45">{col.title}</h3>
              <ul className="space-y-2.5">
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
            <h3 className="label mb-4 text-white/45">Contatti</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="mailto:ciao@cosefighe.it" className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white">
                  <Mail size={14} /> ciao@cosefighe.it
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/cosefighe_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
                >
                  <Instagram size={14} /> @cosefighe_
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-white/80">
                <MapPin size={14} /> Napoli, Campania
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/45 md:flex-row md:items-center">
          <span>© {year} Cose Fighe. Tutti i diritti riservati.</span>
          <nav aria-label="Legale" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/privacy" viewTransition className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link to="/cookie" viewTransition className="transition-colors hover:text-white">
              Cookie
            </Link>
            <Link to="/admin/login" className="text-white/25 transition-colors hover:text-white">
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
