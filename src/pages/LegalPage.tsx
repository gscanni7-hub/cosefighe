import type { ReactNode } from 'react'
import { Page } from '../components/Page'
import { PageHero } from '../components/ui/PageHero'
import { usePageMeta } from '../hooks/usePageMeta'

interface LegalPageProps {
  title: string
  kicker: string
  description: string
  updated: string
  children: ReactNode
}

export function LegalPage({ title, kicker, description, updated, children }: LegalPageProps) {
  usePageMeta({ title: `${title} · Cose Fighe`, description })
  return (
    <Page>
      <PageHero tone="paper" kicker={kicker} title={title} subtitle={`Ultimo aggiornamento: ${updated}`} />
      <section className="section-y">
        <div className="container-x">
          <div className="max-w-prose space-y-8 text-ink/75 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:uppercase [&_h2]:text-ink [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_a]:underline [&_a]:underline-offset-4">
            {children}
          </div>
        </div>
      </section>
    </Page>
  )
}
