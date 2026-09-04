import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { ArrowRight, MapPin } from 'lucide-react'
import { Page } from '../components/Page'
import { PageHero } from '../components/ui/PageHero'
import { ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { CATEGORY_LIST } from '../data/categories'
import { usePageMeta } from '../hooks/usePageMeta'

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

function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const target = parseInt(value, 10)
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView || Number.isNaN(target)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(target)
      return
    }
    const start = performance.now()
    const duration = 900
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target])
  return <span ref={ref}>{Number.isNaN(target) ? value : n}</span>
}

const facts = [
  { num: `${total}`, label: 'esperienze in catalogo' },
  { num: '6', label: 'categorie' },
  { num: '12', label: 'creator locali' },
  { num: '2023', label: 'anno di fondazione' },
]

const events = [
  { date: '29 marzo', label: 'Aperitivo & Networking', location: 'Riva Fiorita, Napoli' },
  { date: '12 aprile', label: 'Serata Cose Fighe', location: 'Riva Fiorita, Napoli' },
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
        eyebrow="La nostra storia"
        title="Chi siamo"
        subtitle="Nati a Napoli nel 2023 da un'idea semplice: la città ha molto più da offrire di quello che mostrano le guide."
        aside={
          <div className="overflow-hidden rounded-[2rem] border border-ink/10" aria-hidden="true">
            <img src="/img/napoli-skyline.webp" alt="" width={1000} height={667} className="img-warm aspect-[4/3] w-full object-cover" />
          </div>
        }
      />


      <section className="section-y">
        <div className="container-x grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <h2 className="heading-lg">Nati per far innamorare di Napoli</h2>
            <div className="mt-5 max-w-prose space-y-4 leading-relaxed text-ink/65">
              <p>
                Siamo una piattaforma che connette viaggiatori curiosi con creator locali appassionati, per vivere
                esperienze autentiche lontano dal turismo di massa.
              </p>
              <p>Il nostro obiettivo? Che tu torni a casa con storie da raccontare, non solo foto da postare.</p>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="relative mx-auto w-full max-w-[360px] md:max-w-none">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[2.5rem] border-2 border-ink bg-cream p-10 shadow-hard">
              <img src="/mascotte-1.webp" alt="La mascotte di Cose Fighe" width={516} height={640} className="h-full w-auto object-contain" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-paper py-10">
        <div className="container-x">
          <dl className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:divide-x md:divide-ink/10">
            {facts.map((f) => (
              <div key={f.label} className="md:px-8 first:md:pl-0">
                <dd className="font-display text-4xl text-orange md:text-5xl">
                  <CountUp value={f.num} />
                </dd>
                <dt className="mt-1 text-sm text-ink/60">{f.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-y">
        <div className="container-x">
          <Reveal>
            <h2 className="heading-lg">I nostri valori</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <div className="border-t-2 border-ink/10 pt-5">
                  <span className="font-display text-3xl text-orange">0{i + 1}</span>
                  <h3 className="mt-3 text-[17px] font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container-x">
          <Reveal>
            <h2 className="heading-lg">Eventi passati</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {events.map((ev, i) => (
              <Reveal key={ev.date} delay={i * 0.06}>
                <div className="flex items-center gap-6 rounded-3xl border border-ink/10 bg-white p-6 md:p-8">
                  <span className="heading-md leading-none text-orange">{ev.date}</span>
                  <div className="border-l border-ink/10 pl-6">
                    <h3 className="text-[17px] font-semibold">{ev.label}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/55">
                      <MapPin size={13} /> {ev.location}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-paper">
        <div className="container-x grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <h2 className="heading-lg">Fai parte della storia</h2>
            <p className="mt-4 max-w-md text-ink/60">Che tu voglia vivere un'esperienza o diventare creator, siamo qui per te.</p>
          </Reveal>
          <Reveal delay={0.08} className="flex flex-wrap gap-3 md:justify-end">
            <ButtonLink to="/esperienze">
              Esplora le esperienze <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink to="/contatti" variant="secondary">
              Scrivici
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </Page>
  )
}
