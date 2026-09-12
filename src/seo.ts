import { CATEGORY_LIST } from './data/categories'
import { ARTICLES_BY_DATE } from './data/articles'

/** Indirizzo pubblico del sito. Quando arriverà il dominio, cambia solo qui. */
export const SITE_URL = 'https://cosefighe.vercel.app'
export const SITE_NAME = 'Cose Fighe'

export interface RouteSeo {
  title: string
  description: string
  image: string
  /** Oggetti JSON-LD da inserire nella pagina. */
  jsonLd: Record<string, unknown>[]
  /** Immagine da precaricare (quella più grande sopra la piega). */
  preloadImage?: string
}

const abs = (path: string) => (path.startsWith('http') ? path : SITE_URL + path)

const organization = {
  '@type': 'Organization',
  '@id': SITE_URL + '/#org',
  name: SITE_NAME,
  url: SITE_URL,
  logo: abs('/icon-512.png'),
  sameAs: ['https://www.instagram.com/cosefighe_/'],
  email: 'ciao@cosefighe.it',
  address: { '@type': 'PostalAddress', addressLocality: 'Napoli', addressRegion: 'Campania', addressCountry: 'IT' },
}

const website = {
  '@type': 'WebSite',
  '@id': SITE_URL + '/#site',
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: 'it-IT',
  publisher: { '@id': SITE_URL + '/#org' },
}

const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
})

const priceNumber = (p: string) => Number(p.replace(/[^\d,.]/g, '').replace(',', '.')) || undefined

const experienceProduct = (exp: { title: string; price: string; image: string; location: string; included: string; duration: string }, categoryLabel: string) => ({
  '@type': 'Product',
  name: exp.title,
  image: abs(exp.image),
  description: `${categoryLabel} a Napoli, ${exp.location}. ${exp.duration}. ${exp.included}.`,
  brand: { '@type': 'Brand', name: SITE_NAME },
  offers: {
    '@type': 'Offer',
    price: priceNumber(exp.price),
    priceCurrency: 'EUR',
    availability: 'https://schema.org/PreOrder',
    url: abs('/esperienze'),
  },
})

const graph = (...items: Record<string, unknown>[]) => [{ '@context': 'https://schema.org', '@graph': items }]

const total = CATEGORY_LIST.reduce((n, c) => n + c.experiences.length, 0)

/** Titolo, descrizione, immagine e dati strutturati per ogni indirizzo pubblico. */
export function routeSeo(path: string): RouteSeo {
  const clean = path.replace(/\/+$/, '') || '/'

  if (clean === '/') {
    return {
      title: 'Cose Fighe · Esperienze autentiche a Napoli',
      description: 'Tour, laboratori, sport e spettacoli a Napoli fuori dai giri turistici, curati da creator locali. Scopri cose fighe da fare in città e cosa succede giorno per giorno.',
      image: '/img/napoli-skyline.webp',
      preloadImage: '/mascotte-hero.webp',
      jsonLd: graph(organization, website),
    }
  }
  if (clean === '/esperienze') {
    return {
      title: `${total} esperienze a Napoli: food, outdoor, arte, laboratori · Cose Fighe`,
      description: `${total} esperienze in 6 categorie, scelte da creator napoletani: street food, Vesuvio, kayak, ceramica, San Carlo. Prezzi da €15.`,
      image: '/img/naples-streetfood.webp',
      jsonLd: graph(
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Esperienze', path: '/esperienze' }]),
        {
          '@type': 'ItemList',
          name: 'Esperienze a Napoli',
          numberOfItems: total,
          itemListElement: CATEGORY_LIST.flatMap((c) => c.experiences).slice(0, 36).map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.title })),
        },
      ),
    }
  }
  if (clean === '/cosa-fare') {
    return {
      title: 'Cosa fare a Napoli: eventi ed esperienze per date · Cose Fighe',
      description: 'Scegli le date e guarda cosa succede a Napoli: feste, concerti, mercati, mostre e le esperienze prenotabili in quei giorni.',
      image: '/mascotte-binocolo.webp',
      jsonLd: graph(breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Cosa fare a Napoli', path: '/cosa-fare' }])),
    }
  }
  if (clean === '/creator') {
    return {
      title: 'Diventa creator a Napoli · Cose Fighe',
      description: 'Conosci Napoli meglio di una guida? Proponi la tua esperienza su Cose Fighe: decidi tu prezzo e date, guadagni a ogni prenotazione.',
      image: '/mascotte-creator.webp',
      jsonLd: graph(breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Diventa creator', path: '/creator' }])),
    }
  }
  if (clean === '/chi-siamo') {
    return {
      title: 'Chi siamo · Cose Fighe',
      description: 'Cose Fighe nasce nel 2023 a Napoli per connettere viaggiatori curiosi con creator locali. La nostra storia, i nostri valori.',
      image: '/img/napoli-skyline.webp',
      jsonLd: graph(organization, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Chi siamo', path: '/chi-siamo' }])),
    }
  }
  if (clean === '/contatti') {
    return {
      title: 'Contatti · Cose Fighe',
      description: 'Scrivici per prenotare un’esperienza, diventare creator o proporre una partnership. Rispondiamo entro 24 ore nei giorni feriali.',
      image: '/mascotte-contatti.webp',
      jsonLd: graph({ '@type': 'ContactPage', name: 'Contatti Cose Fighe', url: abs('/contatti') }, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Contatti', path: '/contatti' }])),
    }
  }
  if (clean === '/blog') {
    return {
      title: 'Blog · Guide, consigli e storie su Napoli · Cose Fighe',
      description: 'Guide e racconti per vivere Napoli come un local: street food, Vesuvio, Napoli Sotterranea, quartieri, aperitivi, laboratori.',
      image: ARTICLES_BY_DATE[0].coverImage,
      jsonLd: graph(
        { '@type': 'Blog', name: 'Il blog di Cose Fighe', url: abs('/blog'), publisher: { '@id': SITE_URL + '/#org' } },
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]),
      ),
    }
  }
  if (clean === '/privacy') return { title: 'Privacy · Cose Fighe', description: 'Informativa sulla privacy di Cose Fighe.', image: '/img/napoli-skyline.webp', jsonLd: [] }
  if (clean === '/cookie') return { title: 'Cookie · Cose Fighe', description: 'Informativa sui cookie di Cose Fighe.', image: '/img/napoli-skyline.webp', jsonLd: [] }
  if (clean === '/crediti') {
    return { title: 'Crediti fotografici · Cose Fighe', description: 'Le fotografie del sito provengono da Wikimedia Commons con licenze libere. Autori e licenze.', image: '/img/napoli-skyline.webp', jsonLd: [] }
  }

  const cat = clean.match(/^\/categoria\/([^/]+)$/)
  if (cat) {
    const c = CATEGORY_LIST.find((x) => x.slug === cat[1])
    if (c) {
      return {
        title: `${c.label} a Napoli: ${c.experiences.length} esperienze · Cose Fighe`,
        description: `${c.subtitle}. ${c.experiences.map((e) => e.title.split(':')[0]).slice(0, 4).join(', ')} e altre esperienze ${c.label.toLowerCase()} a Napoli curate da creator locali.`,
        image: c.experiences[0]?.image ?? '/img/napoli-skyline.webp',
        jsonLd: graph(
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Esperienze', path: '/esperienze' }, { name: c.label, path: clean }]),
          { '@type': 'ItemList', name: `Esperienze ${c.label} a Napoli`, itemListElement: c.experiences.map((e, i) => ({ '@type': 'ListItem', position: i + 1, item: experienceProduct(e, c.label) })) },
        ),
      }
    }
  }

  const art = clean.match(/^\/blog\/([^/]+)$/)
  if (art) {
    const a = ARTICLES_BY_DATE.find((x) => x.slug === art[1])
    if (a) {
      return {
        title: `${a.title} · Cose Fighe Blog`,
        description: a.excerpt,
        image: a.coverImage,
        preloadImage: a.coverImage,
        jsonLd: graph(
          {
            '@type': 'Article',
            '@id': abs(clean) + '#article',
            headline: a.title,
            description: a.excerpt,
            image: abs(a.coverImage),
            datePublished: a.date,
            dateModified: a.date,
            author: { '@type': 'Person', name: a.author, jobTitle: a.authorRole },
            publisher: { '@id': SITE_URL + '/#org' },
            mainEntityOfPage: { '@type': 'WebPage', '@id': abs(clean) },
            keywords: a.tags.join(', '),
            articleSection: a.category,
            inLanguage: 'it-IT',
          },
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: a.title, path: clean }]),
        ),
      }
    }
  }

  return {
    title: 'Pagina non trovata · Cose Fighe',
    description: 'La pagina che cerchi non esiste.',
    image: '/img/napoli-skyline.webp',
    jsonLd: [],
  }
}

/** Tutti gli indirizzi pubblici da pre-generare e mettere nella sitemap. */
export function publicPaths(): string[] {
  return [
    '/',
    '/esperienze',
    '/cosa-fare',
    '/creator',
    '/chi-siamo',
    '/contatti',
    '/blog',
    '/privacy',
    '/cookie',
    '/crediti',
    ...CATEGORY_LIST.map((c) => `/categoria/${c.slug}`),
    ...ARTICLES_BY_DATE.map((a) => `/blog/${a.slug}`),
  ]
}
