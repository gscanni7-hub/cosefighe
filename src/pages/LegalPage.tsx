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
      <PageHero eyebrow={kicker} title={title} subtitle={`Ultimo aggiornamento: ${updated}`} />
      <section className="section-y">
        <div className="container-x">
          <div className="max-w-prose space-y-8 text-ink/75 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_h2]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_a]:underline [&_a]:underline-offset-4">
            {children}
          </div>
        </div>
      </section>
    </Page>
  )
}
