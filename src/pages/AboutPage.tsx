import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { FloatingImage } from '../components/Decorations'
import { PageHero } from '../components/ui/PageHero'
import { ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { CATEGORY_LIST } from '../data/categories'
import { usePageMeta } from '../hooks/usePageMeta'
import { useLp, useT } from '../i18n/lang'

const total = CATEGORY_LIST.reduce((n, c) => n + c.experiences.length, 0)

const values = [
  {
    title: 'Autenticità',
    text: 'Solo esperienze reali, curate da napoletani che amano la loro città e la conoscono vicolo per vicolo.',
  },
  {
    title: 'Territorio',
    text: 'Ogni esperienza nasce dal quartiere, valorizza chi ci lavora e rispetta la tradizione.',
  },
  {
    title: 'Unicità',
    text: 'Niente tour di massa. Piccoli gruppi, esperienze su misura, momenti che non si ripetono.',
  },
]


const facts = [
  { num: `${total}`, label: 'esperienze in catalogo' },
  { num: '6', label: 'categorie' },
  { num: '12', label: 'creator locali' },
  { num: '2026', label: 'anno di fondazione' },
]


export default function AboutPage() {
  const t = useT()
  const lp = useLp()
  usePageMeta({
    title: t('Chi siamo · Cose Fighe'),
    description: t(
      'Cose Fighe nasce nel 2026 a Napoli per connettere viaggiatori curiosi con creator locali. La nostra storia, i nostri valori.',
    ),
    image: '/img/napoli-skyline.webp',
  })

  return (
    <Page>
      <PageHero
        eyebrow={t('La nostra storia')}
        title={t('Chi siamo')}
        subtitle={t("Nati a Napoli nel 2026 da un'idea semplice: la città ha molto più da offrire di quello che mostrano le guide.")}
        aside={
          <div className="relative mx-auto w-[180px] md:ml-auto md:w-[260px]" aria-hidden="true">
            <FloatingImage src="/mascotte-1.webp" amplitude={10} />
          </div>
        }
      />


      <section className="section-y">
        <div className="container-x grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <h2 className="heading-lg">{t('Nati per far innamorare di Napoli')}</h2>
            <div className="mt-5 max-w-prose space-y-4 leading-relaxed text-ink/65">
              <p>
                {t(
                  'Siamo una piattaforma che connette viaggiatori curiosi con creator locali appassionati, per vivere esperienze autentiche lontano dal turismo di massa.',
                )}
              </p>
              <p>{t('Il nostro obiettivo? Che tu torni a casa con storie da raccontare, non solo foto da postare.')}</p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-[2rem] bg-cream" aria-hidden="true">
              <img src="/img/napoli-skyline.webp" alt={t("Napoli dall'alto: il porto e il Vesuvio")} width={1000} height={667} className="img-warm aspect-[4/3] w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-paper py-10">
        <div className="container-x">
          <dl className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:divide-x md:divide-line">
            {facts.map((f) => (
              <div key={f.label} className="md:px-8 first:md:pl-0">
                <dd className="font-display text-4xl text-ink md:text-5xl">{f.num}</dd>
                <dt className="mt-1 text-sm text-ink/60">{t(f.label)}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x">
          <Reveal>
            <h2 className="heading-lg">{t('I nostri valori')}</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <div className="border-t border-line pt-5">
                  <span className="font-display text-3xl text-ink/30">0{i + 1}</span>
                  <h3 className="mt-3 text-[17px] font-semibold">{t(v.title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{t(v.text)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      <section className="section-y bg-paper">
        <div className="container-x grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <h2 className="heading-lg">{t('Fai parte della storia')}</h2>
            <p className="mt-4 max-w-md text-ink/60">{t("Che tu voglia vivere un'esperienza o diventare creator, siamo qui per te.")}</p>
          </Reveal>
          <Reveal delay={0.08} className="flex flex-wrap gap-3 md:justify-end">
            <ButtonLink to={lp('/esperienze')}>
              {t('Esplora le esperienze') + ' '}<ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink to={lp('/contatti')} variant="secondary">
              {t('Scrivici')}
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </Page>
  )
}
