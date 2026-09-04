import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Page } from '../components/Page'
import { PageHero } from '../components/ui/PageHero'
import { ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { ExperienceCard } from '../components/ui/ExperienceCard'
import { WaitlistForm } from '../components/ui/WaitlistForm'
import { CATEGORIES, CATEGORY_LIST } from '../data/categories'
import { fetchExperiencesByCategory, mapDbExperience } from '../lib/db'
import { usePageMeta } from '../hooks/usePageMeta'
import NotFoundPage from './NotFoundPage'
import type { Category, Experience } from '../types'

const categoryImages: Record<string, string> = {
  food: '/food.webp',
  outdoor: '/outdoor.webp',
  sport: '/sport.webp',
  arte: '/arte.webp',
  laboratori: '/laboratori.webp',
  spettacoli: '/spettacoli.webp',
}

function CategoryView({ cat }: { cat: Category }) {
  const [experiences, setExperiences] = useState<Experience[]>(cat.experiences)

  usePageMeta({
    title: `${cat.label} a Napoli · Cose Fighe`,
    description: `${cat.subtitle}. ${cat.experiences.length} esperienze ${cat.label.toLowerCase()} a Napoli curate da creator locali.`,
    image: categoryImages[cat.slug],
  })

  useEffect(() => {
    setExperiences(cat.experiences)
    fetchExperiencesByCategory(cat.slug).then((rows) => {
      if (rows && rows.length > 0) setExperiences(rows.map(mapDbExperience))
    })
  }, [cat])

  const others = CATEGORY_LIST.filter((c) => c.slug !== cat.slug)

  return (
    <Page>
      <PageHero
        back={{ to: '/esperienze', label: 'Tutte le categorie' }}
        eyebrow={cat.subtitle}
        title={cat.label}
        subtitle={`${experiences.length} esperienze a Napoli. Le prenotazioni aprono presto.`}
        aside={
          <div
            className="mx-auto w-[200px] overflow-hidden rounded-[2rem] border-2 border-ink shadow-hard md:ml-auto md:w-[280px]"
            style={{ backgroundColor: cat.accent }}
            aria-hidden="true"
          >
            <img src={categoryImages[cat.slug]} alt="" width={900} height={900} className="h-full w-full object-cover" />
          </div>
        }
      />

      <section className="section-y">
        <div className="container-x">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {experiences.map((exp, i) => (
              <ExperienceCard key={exp.title} exp={exp} index={i} />
            ))}
          </div>
          <Reveal className="mt-14 border-t border-ink/10 pt-8">
            <p className="label text-ink/50">Altre categorie</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {others.map((c) => (
                <li key={c.slug}>
                  <ButtonLink to={`/categoria/${c.slug}`} variant="secondary" size="sm">
                    {c.label} <ArrowRight size={14} />
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-paper">
        <div className="container-x grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <h2 className="heading-lg">Ti avvisiamo quando si parte</h2>
            <p className="mt-4 max-w-md text-ink/60">Le esperienze {cat.label} aprono presto. Lascia la mail e sei tra i primi.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <WaitlistForm source={`categoria-${cat.slug}`} />
          </Reveal>
        </div>
      </section>
    </Page>
  )
}

export default function CategoryPage() {
  const { slug } = useParams()
  const cat = CATEGORIES[slug ?? ''] as Category | undefined
  if (!cat) return <NotFoundPage />
  return <CategoryView key={cat.slug} cat={cat} />
}
