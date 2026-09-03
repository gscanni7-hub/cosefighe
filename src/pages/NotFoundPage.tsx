import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { ButtonLink } from '../components/ui/Button'
import { FloatingImage } from '../components/Decorations'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFoundPage() {
  usePageMeta({ title: 'Pagina non trovata · Cose Fighe', description: 'La pagina che cerchi non esiste.' })
  return (
    <Page>
      <section className="relative overflow-hidden bg-paper pt-40 pb-24">
        <div className="pointer-events-none absolute inset-0 dots text-ink/[0.07]" aria-hidden="true" />
        <div className="container-x relative grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="font-display text-display-xl uppercase leading-none text-orange">404</p>
            <h1 className="mt-4 font-display text-display-md uppercase">Questa strada non porta da nessuna parte</h1>
            <p className="mt-4 max-w-md text-ink/65">
              Succede anche nei vicoli di Napoli. Torna alla home o guarda le esperienze.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink to="/">
                <ArrowLeft size={16} /> Home
              </ButtonLink>
              <ButtonLink to="/esperienze" variant="white">
                Esperienze <ArrowRight size={16} />
              </ButtonLink>
            </div>
          </div>
          <div className="mx-auto w-[200px] md:w-[300px]" aria-hidden="true">
            <FloatingImage src="/meditazione.webp" />
          </div>
        </div>
      </section>
    </Page>
  )
}
