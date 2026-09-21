import { CATEGORY_LIST } from './data/categories'
import { ARTICLES_BY_DATE } from './data/articles'
import { COSA_FARE_FAQ } from './data/faq'
import { CATEGORY_TEXTS } from './data/categorieTesti'
import { GUIDE, GUIDE_TITLE } from './data/guida'
import { EXPERIENCE_PAGES } from './data/schede'
import { schedaTexts } from './data/schedeTesti'
import { eventDateLabel, eventEnd, eventPath, eventPriceNumber, eventsBetween, eventsForPages, findEvent, isFreeEvent } from './data/events'
import generated from './data/generated.json'
import { BUILD_DAY } from './lib/buildDay'
import { addDays, weekendRange } from './lib/dates'
import type { CityEvent, Experience } from './types'

/** Indirizzo pubblico del sito. Quando arriverà il dominio, cambia solo qui. */
export const SITE_URL = 'https://www.cosefighenapoli.it'
export const SITE_NAME = 'Cose Fighe'

export interface RouteSeo {
  title: string
  description: string
  image: string
  /** Oggetti JSON-LD da inserire nella pagina. */
  jsonLd: Record<string, unknown>[]
  /** Immagine da precaricare (quella più grande sopra la piega). */
  preloadImage?: string
  /** Ultima modifica vera della pagina (AAAA-MM-GG), per la sitemap. */
  updated?: string
}

/** Ultimo ritocco a mano delle pagine fisse: aggiorna quando cambi i loro testi. */
const STATIC_UPDATED = '2026-09-13'
type Row = { category_slug?: string; updated_at?: string | null; created_at?: string | null }
/** Data più recente tra le esperienze pubblicate (di una categoria o di tutte). */
const experiencesUpdated = (slug?: string) => {
  const rows = ((generated as { experiences?: Row[] }).experiences ?? []).filter((r) => !slug || r.category_slug === slug)
  const dates = rows.map((r) => (r.updated_at ?? r.created_at ?? '').slice(0, 10)).filter(Boolean)
  return dates.length ? dates.sort().at(-1)! : STATIC_UPDATED
}

const abs = (path: string) => (path.startsWith('http') ? path : SITE_URL + path)

/** Taglia un testo sull'ultimo spazio entro `max` caratteri, con i puntini. */
const cut = (text: string, max: number) => (text.length > max ? text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : text)
/**
 * <title> entro 65 caratteri: con il suffisso « · Cose Fighe» se ci sta, altrimenti senza; se il testo da solo
 * è ancora lungo, resta la parte prima dei due punti (è quella con la parola chiave), altrimenti si taglia.
 */
export const seoTitle = (text: string, suffix = ' · Cose Fighe') => {
  if (text.length + suffix.length <= 65) return text + suffix
  if (text.length <= 65) return text
  const head = text.split(':')[0].trim()
  if (head.length >= 30 && head.length <= 65) return head.length + suffix.length <= 65 ? head + suffix : head
  return cut(text, 65)
}

/** Anteprima per WhatsApp, Facebook e simili: JPEG 1200×630 in /og, perché le webp non vengono mostrate. */
const og = (path: string) => `/og/${path.split('/').pop()!.replace(/\.webp$/, '')}.jpg`
const OG_HOME = '/og/napoli-skyline.jpg'

const organization = {
  '@type': 'Organization',
  '@id': SITE_URL + '/#org',
  name: SITE_NAME,
  url: SITE_URL,
  logo: abs('/icon-512.png'),
  foundingDate: '2026',
  foundingLocation: { '@type': 'Place', name: 'Napoli' },
  sameAs: ['https://www.instagram.com/cosefighe_/'],
  email: 'ciao@cosefighe.it',
  address: { '@type': 'PostalAddress', addressLocality: 'Napoli', addressRegion: 'Campania', addressCountry: 'IT' },
}

const website = {
  '@type': 'WebSite',
  '@id': SITE_URL + '/#site',
  url: SITE_URL,
  name: SITE_NAME,
  alternateName: ['Cose Fighe Napoli', 'cosefighenapoli.it'],
  inLanguage: 'it-IT',
  publisher: { '@id': SITE_URL + '/#org' },
}

const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
})

const priceNumber = (p: string) => Number(p.replace(/[^\d,.]/g, '').replace(',', '.')) || undefined

const experienceProduct = (exp: Experience, categoryLabel: string) => ({
  '@type': 'Product',
  name: exp.title,
  image: abs(exp.image),
  description: `${categoryLabel} a Napoli, ${exp.location}. ${exp.duration}. ${exp.included}.`,
  brand: { '@type': 'Brand', name: SITE_NAME },
  // Voto e numero di recensioni sono quelli della piattaforma partner, gli stessi mostrati in pagina.
  aggregateRating: exp.reviews > 0 ? { '@type': 'AggregateRating', ratingValue: exp.rating, reviewCount: exp.reviews, bestRating: 5, worstRating: 1 } : undefined,
  offers: {
    '@type': 'Offer',
    price: priceNumber(exp.price),
    priceCurrency: 'EUR',
    availability: exp.affiliateUrl ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
    url: exp.affiliateUrl ?? abs('/esperienze'),
  },
})

/** Scarto orario di Roma in una data ("+02:00" d'estate, "+01:00" d'inverno). */
const romeOffset = (iso: string): string => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Rome', timeZoneName: 'longOffset' }).formatToParts(new Date(iso + 'T12:00:00Z'))
    const tz = parts.find((p) => p.type === 'timeZoneName')?.value ?? ''
    const off = tz.replace('GMT', '')
    return /^[+-]\d{2}:\d{2}$/.test(off) ? off : '+01:00'
  } catch {
    return '+01:00'
  }
}

/** Comuni intorno a Napoli che compaiono come «zona» di un evento: lì l'indirizzo non è Napoli. */
const OTHER_TOWNS = [
  'Pompei', 'Ercolano', 'Portici', 'San Giorgio a Cremano', 'Torre del Greco', 'Torre Annunziata', 'Castellammare di Stabia', 'Vico Equense', 'Sorrento',
  'Pozzuoli', 'Bacoli', 'Quarto', 'Giugliano', 'Casoria', 'Afragola', 'Aversa', 'Caserta', 'Nola', 'Boscoreale', 'Capri', 'Ischia', 'Procida', 'Salerno',
  'Amalfi', 'Positano', 'Ravello', 'Benevento', 'Avellino', 'Marano', 'Cuma', 'Baia',
]
const townOf = (area: string) => OTHER_TOWNS.find((t) => area.toLowerCase() === t.toLowerCase() || area.toLowerCase().startsWith(t.toLowerCase() + ' ')) ?? 'Napoli'
/** La via, se il luogo la contiene dopo una virgola («Fossato di Castel Sant'Elmo, via Tito Angelini 20/A»). */
const streetOf = (place: string) => place.split(',').slice(1).map((s) => s.trim()).find((s) => /^(via|viale|piazza|piazzale|piazzetta|corso|vico|largo|salita|calata|riviera|lungomare|rampe|discesa)\b/i.test(s))

/** Chi organizza: il sito ufficiale dell'evento, con il dominio come nome. Non inventiamo nomi. */
const organizerOf = (url?: string) => {
  if (!url) return undefined
  try {
    const u = new URL(url)
    return { '@type': 'Organization', name: u.hostname.replace(/^www\./, ''), url: u.origin + '/' }
  } catch {
    return undefined
  }
}

/** Data e ora di inizio e fine in ISO 8601 con lo scarto di Roma: l'orario, quando c'è («21:00 (porte 20:30)» dà le 21). */
const eventDates = (e: CityEvent) => {
  const times = [...(e.time ?? '').matchAll(/(\d{1,2})[:.](\d{2})/g)].map((m) => `${m[1].padStart(2, '0')}:${m[2]}`)
  const end = eventEnd(e)
  const startDate = times[0] ? `${e.start}T${times[0]}:00${romeOffset(e.start)}` : e.start
  const single = end === e.start
  // Un solo giorno: la fine con il suo orario se c'è ed è dopo l'inizio, altrimenti uguale all'inizio (mai prima).
  const endDate = single ? (times[1] && times[1] > times[0] ? `${end}T${times[1]}:00${romeOffset(end)}` : startDate) : end
  return { startDate, endDate }
}

/** Un evento del programma in schema.org, per il riquadro eventi di Google. `url` è la nostra pagina, i biglietti sono sul sito ufficiale. */
const eventSchema = (e: CityEvent) => {
  const free = isFreeEvent(e)
  const price = eventPriceNumber(e)
  const street = streetOf(e.place)
  const organizer = organizerOf(e.url)
  return {
    '@type': 'Event',
    name: e.title,
    description: e.blurb || undefined,
    ...eventDates(e),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: e.place || 'Napoli',
      address: { '@type': 'PostalAddress', streetAddress: street, addressLocality: townOf(e.area), addressRegion: 'Campania', addressCountry: 'IT' },
    },
    organizer,
    image: abs(OG_HOME),
    url: abs(eventPath(e)),
    isAccessibleForFree: free || undefined,
    offers:
      price !== undefined
        ? { '@type': 'Offer', price, priceCurrency: 'EUR', availability: 'https://schema.org/InStock', validFrom: BUILD_DAY, url: e.url ?? abs(eventPath(e)) }
        : undefined,
  }
}

/** Titolo della pagina evento entro 65 caratteri: la data resta sempre, il titolo si accorcia se serve. */
const eventTitle = (e: CityEvent) => {
  const date = eventDateLabel(e)
  const full = `${e.title} · ${date}`
  if (full.length <= 65) return seoTitle(full)
  const head = e.title.split(':')[0].trim()
  if (`${head} · ${date}`.length <= 65) return `${head} · ${date}`
  // Data corta ("24 ott 2026") prima di rinunciarci: un titolo tagliato a metà si legge male nei risultati.
  const short = date.replace(/(\d+) ([a-zà]+) (\d{4})/, (_, d, m, y) => `${d} ${m.slice(0, 3)} ${y}`)
  if (`${e.title} · ${short}`.length <= 65) return `${e.title} · ${short}`
  return seoTitle(e.title)
}

const guideList = {
  '@type': 'ItemList',
  name: GUIDE_TITLE,
  itemListOrder: 'https://schema.org/ItemListOrderAscending',
  numberOfItems: GUIDE.length,
  itemListElement: GUIDE.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.title, url: abs('/cosa-fare#' + g.slug) })),
}

const faqPage = {
  '@type': 'FAQPage',
  mainEntity: COSA_FARE_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

const graph = (...items: Record<string, unknown>[]) => [{ '@context': 'https://schema.org', '@graph': items }]

const total = CATEGORY_LIST.reduce((n, c) => n + c.experiences.length, 0)

/** Titolo, descrizione, immagine e dati strutturati per ogni indirizzo pubblico. */
export function routeSeo(path: string): RouteSeo {
  const clean = path.replace(/\/+$/, '') || '/'

  if (clean === '/') {
    return {
      title: 'Cosa fare a Napoli: esperienze, eventi e idee di local',
      description: 'Cosa fare a Napoli oggi e nel weekend: eventi controllati dalla redazione e tour, laboratori, barche e sotterranei scelti uno per uno, con i prezzi.',
      image: OG_HOME,
      preloadImage: '/mascotte-hero.webp',
      updated: BUILD_DAY,
      jsonLd: graph(organization, website),
    }
  }
  if (clean === '/esperienze') {
    return {
      title: `${total} esperienze a Napoli: food, outdoor, arte, laboratori`,
      description: `${total} esperienze in 6 categorie, scelte una per una: street food, Vesuvio, barca, laboratori, sotterranei. Prezzi da €10.`,
      image: og('/img/naples-streetfood.webp'),
      updated: experiencesUpdated(),
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
      title: 'Cosa fare a Napoli: 25 cose da fare, eventi e programma',
      description: 'Cosa fare a Napoli: il programma dei prossimi giorni controllato dalla redazione, le 25 cose da fare scelte da chi ci vive e le esperienze prenotabili.',
      image: OG_HOME,
      updated: BUILD_DAY,
      jsonLd: graph(
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Cosa fare a Napoli', path: '/cosa-fare' }]),
        guideList,
        faqPage,
        ...eventsBetween(BUILD_DAY, addDays(BUILD_DAY, 29)).map(eventSchema),
      ),
    }
  }
  if (clean === '/cosa-fare/oggi') {
    return {
      title: 'Cosa fare a Napoli oggi: eventi e idee dell’ultimo minuto',
      description: 'Gli eventi di oggi a Napoli, controllati dalla redazione, e le esperienze che puoi prenotare anche all’ultimo. Si aggiorna ogni mattina.',
      image: OG_HOME,
      updated: BUILD_DAY,
      jsonLd: graph(
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Cosa fare a Napoli', path: '/cosa-fare' }, { name: 'Oggi', path: clean }]),
        ...eventsBetween(BUILD_DAY, BUILD_DAY).map(eventSchema),
      ),
    }
  }
  if (clean === '/cosa-fare/weekend') {
    const w = weekendRange(BUILD_DAY)
    return {
      title: 'Cosa fare a Napoli nel weekend: programma di sabato e domenica',
      description: 'Il programma del fine settimana a Napoli: concerti, feste, mostre, mercati, giorno per giorno, e le esperienze da prenotare. Si aggiorna ogni mattina.',
      image: OG_HOME,
      updated: BUILD_DAY,
      jsonLd: graph(
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Cosa fare a Napoli', path: '/cosa-fare' }, { name: 'Questo weekend', path: clean }]),
        ...eventsBetween(w.from, w.to).map(eventSchema),
      ),
    }
  }
  if (clean === '/creator') {
    return {
      updated: STATIC_UPDATED,
      title: 'Diventa creator a Napoli · Cose Fighe',
      description: 'Conosci Napoli meglio di una guida? Proponi la tua esperienza su Cose Fighe: decidi tu prezzo e date, guadagni a ogni prenotazione.',
      image: OG_HOME,
      jsonLd: graph(breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Diventa creator', path: '/creator' }])),
    }
  }
  if (clean === '/chi-siamo') {
    return {
      updated: STATIC_UPDATED,
      title: 'Chi siamo: chi sceglie le esperienze di Cose Fighe a Napoli',
      description: 'Cose Fighe nasce nel 2026 a Napoli per connettere viaggiatori curiosi con creator locali. La nostra storia, i nostri valori.',
      image: OG_HOME,
      jsonLd: graph(organization, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Chi siamo', path: '/chi-siamo' }])),
    }
  }
  if (clean === '/contatti') {
    return {
      updated: STATIC_UPDATED,
      title: 'Contatti: scrivi alla redazione di Cose Fighe a Napoli',
      description: 'Scrivici per una domanda, per proporre la tua esperienza o una collaborazione. Rispondiamo entro 24 ore nei giorni feriali.',
      image: OG_HOME,
      jsonLd: graph({ '@type': 'ContactPage', name: 'Contatti Cose Fighe', url: abs('/contatti') }, breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Contatti', path: '/contatti' }])),
    }
  }
  if (clean === '/blog') {
    return {
      title: 'Blog · Guide, consigli e storie su Napoli · Cose Fighe',
      description: 'Guide e racconti per vivere Napoli come un local: street food, Vesuvio, Napoli Sotterranea, quartieri, aperitivi, laboratori.',
      image: ARTICLES_BY_DATE[0] ? og(ARTICLES_BY_DATE[0].coverImage) : OG_HOME,
      updated: ARTICLES_BY_DATE[0]?.date ?? STATIC_UPDATED,
      jsonLd: graph(
        { '@type': 'Blog', name: 'Il blog di Cose Fighe', url: abs('/blog'), publisher: { '@id': SITE_URL + '/#org' } },
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]),
      ),
    }
  }
  if (clean === '/privacy') return { title: 'Informativa sulla privacy di Cose Fighe', description: 'Come Cose Fighe tratta i dati di chi visita il sito e scrive alla redazione: analisi senza cookie, moduli di contatto, diritti e contatti.', image: OG_HOME, updated: STATIC_UPDATED, jsonLd: [] }
  if (clean === '/cookie') return { title: 'Informativa sui cookie di Cose Fighe', description: 'Cose Fighe non usa cookie di tracciamento: le statistiche sono anonime e senza identificatori. Cosa viene salvato nel browser e perché.', image: OG_HOME, updated: STATIC_UPDATED, jsonLd: [] }
  const cat = clean.match(/^\/categoria\/([^/]+)$/)
  if (cat) {
    const c = CATEGORY_LIST.find((x) => x.slug === cat[1])
    if (c) {
      return {
        title: seoTitle(`${c.label} a Napoli: ${c.experiences.length} esperienze scelte una per una`),
        description: cut(`${c.subtitle}. ${c.experiences.map((e) => e.title.split(':')[0]).slice(0, 2).join(', ')} e altre esperienze ${c.label.toLowerCase()} a Napoli scelte una per una.`, 158),
        image: c.experiences[0] ? og(c.experiences[0].image) : OG_HOME,
        updated: experiencesUpdated(c.slug),
        jsonLd: graph(
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Esperienze', path: '/esperienze' }, { name: c.label, path: clean }]),
          { '@type': 'ItemList', name: `Esperienze ${c.label} a Napoli`, itemListElement: c.experiences.map((e, i) => ({ '@type': 'ListItem', position: i + 1, item: experienceProduct(e, c.label) })) },
          ...(CATEGORY_TEXTS[c.slug]
            ? [{ '@type': 'FAQPage', mainEntity: CATEGORY_TEXTS[c.slug].faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }]
            : []),
        ),
      }
    }
  }

  const ep = clean.match(/^\/esperienze\/([^/]+)$/)
  if (ep) {
    const p = EXPERIENCE_PAGES.find((x) => x.slug === ep[1])
    if (p) {
      const scheda = schedaTexts(p.exp.providerId)
      const intro = scheda?.intro ?? `${p.category.label} a Napoli, ${p.exp.location}. ${p.exp.duration}. ${p.exp.included}.`
      const faq = scheda?.faq?.length
        ? [{ '@type': 'FAQPage', mainEntity: scheda.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }]
        : []
      return {
        title: seoTitle(p.exp.title),
        description: intro.length > 158 ? intro.slice(0, 155).replace(/\s+\S*$/, '') + '…' : intro,
        image: og(p.exp.image),
        preloadImage: p.exp.image,
        updated: experiencesUpdated(p.category.slug),
        jsonLd: graph(
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Esperienze', path: '/esperienze' }, { name: p.category.label, path: `/categoria/${p.category.slug}` }, { name: p.exp.title, path: clean }]),
          { ...experienceProduct(p.exp, p.category.label), '@id': abs(clean) + '#product', url: abs(clean), description: intro },
          ...faq,
        ),
      }
    }
  }

  const art = clean.match(/^\/blog\/([^/]+)$/)
  if (art) {
    const a = ARTICLES_BY_DATE.find((x) => x.slug === art[1])
    if (a) {
      return {
        title: seoTitle(a.title),
        description: cut(a.excerpt, 158),
        image: og(a.coverImage),
        preloadImage: a.coverImage,
        updated: a.date,
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

  const ev = clean.match(/^\/eventi\/([^/]+)$/)
  if (ev) {
    const e = findEvent(ev[1])
    if (e) {
      return {
        title: eventTitle(e),
        description: cut(`${e.blurb} Data, orario, luogo e prezzo, e cosa fare a Napoli negli stessi giorni.`.trim(), 158),
        image: OG_HOME,
        updated: e.start,
        jsonLd: graph(
          breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Cosa fare a Napoli', path: '/cosa-fare' }, { name: e.title, path: clean }]),
          { ...eventSchema(e), '@id': abs(clean) + '#event' },
        ),
      }
    }
  }

  return {
    title: 'Pagina non trovata · Cose Fighe',
    description: 'La pagina che cerchi non esiste.',
    image: OG_HOME,
    jsonLd: [],
  }
}

/** Tutti gli indirizzi pubblici da pre-generare e mettere nella sitemap. */
export function publicPaths(): string[] {
  return [
    '/',
    '/esperienze',
    '/cosa-fare',
    '/cosa-fare/oggi',
    '/cosa-fare/weekend',
    '/creator',
    '/chi-siamo',
    '/contatti',
    '/blog',
    '/privacy',
    '/cookie',
    ...CATEGORY_LIST.map((c) => `/categoria/${c.slug}`),
    ...EXPERIENCE_PAGES.map((p) => p.path),
    ...ARTICLES_BY_DATE.map((a) => `/blog/${a.slug}`),
    // Una pagina per evento; quelli finiti da più di 30 giorni escono da sitemap e pre-generazione.
    ...eventsForPages(BUILD_DAY, 30).map(eventPath),
  ]
}
