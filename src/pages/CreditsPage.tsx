import { ExternalLink } from 'lucide-react'
import { Page } from '../components/Page'
import { PageHero } from '../components/ui/PageHero'
import { usePageMeta } from '../hooks/usePageMeta'
import credits from '../data/credits.json'

interface Credit {
  title: string
  page: string
  artist: string
  license: string
}

const entries = Object.entries(credits as Record<string, Credit>).sort(([a], [b]) => a.localeCompare(b))

export default function CreditsPage() {
  usePageMeta({
    title: 'Crediti fotografici · Cose Fighe',
    description: 'Autori e licenze delle fotografie usate sul sito Cose Fighe.',
  })
  return (
    <Page>
      <PageHero
        eyebrow="Grazie a chi fotografa Napoli"
        title="Crediti fotografici"
        subtitle="Le fotografie di esperienze e articoli provengono da Wikimedia Commons con licenze libere. Le illustrazioni della mascotte sono di Cose Fighe."
      />
      <section className="section-y">
        <div className="container-x">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map(([key, c]) => (
              <li key={key} className="flex min-w-0 gap-4 overflow-hidden rounded-2xl border border-line bg-white p-3">
                <img
                  src={`/img/${key}.webp`}
                  alt=""
                  width={120}
                  height={90}
                  loading="lazy"
                  decoding="async"
                  className="h-[72px] w-24 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 text-sm">
                  <a
                    href={c.page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-1 font-semibold underline-offset-4 hover:underline"
                  >
                    <span className="min-w-0 truncate">{c.title.replace(/^File:/, '').replace(/\.(jpe?g|JPG)$/, '')}</span>
                    <ExternalLink size={12} className="flex-shrink-0" />
                  </a>
                  <p className="mt-1 truncate text-ink/60">{c.artist || 'Autore non indicato'}</p>
                  <p className="text-xs text-ink/50">{c.license}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Page>
  )
}
