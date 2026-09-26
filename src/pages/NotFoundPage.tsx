import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { ButtonLink } from '../components/ui/Button'
import { FloatingImage } from '../components/Decorations'
import { usePageMeta } from '../hooks/usePageMeta'
import { useLp, useT } from '../i18n/lang'

export default function NotFoundPage() {
  const t = useT()
  const lp = useLp()
  usePageMeta({ title: t('Pagina non trovata · Cose Fighe'), description: t('La pagina che cerchi non esiste.') })
  return (
    <Page>
      <section className="bg-paper pt-36 pb-24">
        <div className="container-x grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="label text-orange">{t('Errore 404')}</p>
            <h1 className="mt-4 font-display text-display-xl uppercase">{t('Questa strada non porta da nessuna parte')}</h1>
            <p className="mt-5 max-w-md text-ink/65">
              {t('Succede anche nei vicoli di Napoli. Torna alla home o guarda le esperienze.')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink to={lp('/')}>
                <ArrowLeft size={16} />
                {' ' + t('Home')}
              </ButtonLink>
              <ButtonLink to={lp('/esperienze')} variant="secondary">
                {t('Esperienze') + ' '}
                <ArrowRight size={16} />
              </ButtonLink>
            </div>
          </div>
          <div className="mx-auto w-[180px] md:w-[260px]" aria-hidden="true">
            <FloatingImage src="/mascotte-404.webp" amplitude={10} />
          </div>
        </div>
      </section>
    </Page>
  )
}
