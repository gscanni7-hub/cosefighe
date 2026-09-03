import { ArrowRight, MapPin } from 'lucide-react'
import { Page } from '../components/Page'
import { Band } from '../components/Band'
import { PageHero } from '../components/ui/PageHero'
import { ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { Sticker } from '../components/ui/Sticker'
import { CATEGORY_LIST } from '../data/categories'
import { usePageMeta } from '../hooks/usePageMeta'

const total = CATEGORY_LIST.reduce((n, c) => n + c.experiences.length, 0)

const values = [
  {
    title: 'Autenticità',
    text: 'Solo esperienze reali, curate da napoletani che amano la loro città e la conoscono vicolo per vicolo.',
    tone: 'bg-orange text-white',
  },
  {
    title: 'Territorio',
    text: 'Ogni esperienza nasce dal quartiere, valorizza chi ci lavora e rispetta la tradizione.',
    tone: 'bg-blue text-white',
  },
  {
    title: 'Unicità',
    text: 'Niente tour di massa. Piccoli gruppi, esperienze su misura, momenti che non si ripetono.',
    tone: 'bg-ink text-white',
  },
]

const facts = [
  { num: `${total}`, label: 'esperienze in catalogo' },
  { num: '6', label: 'categorie' },
  { num: '12', label: 'creator locali' },
  { num: '2023', label: 'anno di fondazione' },
]

const events = [
  { date: '29 marzo', label: 'Aperitivo & Networking', location: 'Riva Fiorita, Napoli', tone: 'bg-orange text-white' },
  { date: '12 aprile', label: 'Serata Cose Fighe', location: 'Riva Fiorita, Napoli', tone: 'bg-ink text-white' },
]

export default function AboutPage() {
  usePageMeta({
    title: 'Chi siamo · Cose Fighe',
    description:
      'Cose Fighe nasce nel 2023 a Napoli per connettere viaggiatori curiosi con creator locali. La nostra storia, i nostri valori.',
    image: '/img/napoli-skyline.webp',
  })

  return (
    <Page>
      <PageHero
        tone="paper"
        kicker="La nostra storia"
        title={
          <>
            Chi <span className="text-outline">siamo</span>
          </>
        }
        subtitle="Nati a Napoli nel 2023 da un'idea semplice: la città ha molto più da offrire di quello che mostrano le guide."
        backdrop={
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block" aria-hidden="true">
            <img
              src="/img/napoli-skyline.webp"
              alt=""
              width={1000}
              height={667}
              className="h-full w-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/70 to-paper/10" />
          </div>
        }
      />

      <Band text="CHI SIAMO • NAPOLI • COSE FIGHE • LA NOSTRA STORIA • " tone="ink" tilt={-1} outline />

      <section className="section-y">
        <div className="container-x grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <h2 className="font-display text-display-lg uppercase">
              Nati per far <span className="text-orange">innamorare</span> di Napoli
            </h2>
            <div className="mt-6 max-w-prose space-y-4 text-lg leading-relaxed text-ink/65">
              <p>
                Siamo una piattaforma che connette viaggiatori curiosi con creator locali appassionati, per vivere
                esperienze autentiche lontano dal turismo di massa.
              </p>
              <p>Il nostro obiettivo? Che tu torni a casa con storie da raccontare, non solo foto da postare.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="relative">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border-4 border-ink bg-cream p-10 shadow-hard-xl">
              <img src="/mascotte-1.webp" alt="La mascotte di Cose Fighe" width={516} height={640} className="h-full w-auto object-contain" />
            </div>
            <div className="absolute -bottom-5 -right-3 md:-right-6">
              <Sticker tone="orange" rotate={3} className="px-4 py-2 text-sm">
                Dal 2023
              </Sticker>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y-4 border-ink bg-paper py-10">
        <div className="container-x">
          <dl className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:divide-x-2 md:divide-ink/15">
            {facts.map((f) => (
              <div key={f.label} className="md:px-8 first:md:pl-0">
                <dt className="text-xs font-bold uppercase tracking-widest text-ink/50">{f.label}</dt>
                <dd className="mt-1 font-display text-5xl text-orange md:text-6xl">{f.num}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x">
          <Reveal>
            <h2 className="font-display text-display-lg uppercase">I nostri valori</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className={`h-full rounded-[2rem] border-4 border-ink p-8 shadow-hard-lg md:p-10 ${v.tone}`}>
                  <span className="font-display text-6xl opacity-40">0{i + 1}</span>
                  <h3 className="mt-4 font-display text-4xl uppercase">{v.title}</h3>
                  <p className="mt-3 leading-relaxed opacity-85">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container-x">
          <Reveal>
            <h2 className="font-display text-display-lg uppercase">Eventi passati</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {events.map((ev, i) => (
              <Reveal key={ev.date} delay={i * 0.08}>
                <div className={`flex flex-col gap-4 rounded-[2rem] border-4 border-ink p-8 shadow-hard-lg md:p-10 ${ev.tone}`}>
                  <span className="font-display text-display-lg uppercase leading-none">{ev.date}</span>
                  <div>
                    <h3 className="font-display text-2xl uppercase">{ev.label}</h3>
                    <p className="mt-2 flex items-center gap-2 text-sm opacity-75">
                      <MapPin size={13} /> {ev.location}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-blue text-white">
        <div className="container-x grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <h2 className="font-display text-display-lg uppercase">
              Fai parte <span className="text-outline-light">della storia</span>
            </h2>
            <p className="mt-5 max-w-md text-white/75">
              Che tu voglia vivere un'esperienza o diventare creator, siamo qui per te.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-wrap gap-4 md:justify-end">
            <ButtonLink to="/esperienze" variant="white">
              Esplora le esperienze <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink to="/contatti" variant="ghost-light">
              Scrivici
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </Page>
  )
}
