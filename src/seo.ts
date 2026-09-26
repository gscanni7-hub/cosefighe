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
import { addDays, dayParts, weekendRange } from './lib/dates'
import { langOf, localizePath, STATIC_PATHS, translate, type Lang } from './i18n/lang'
import { eventSlugEn, hasArticleEn, hasEventEn, hasExperienceEn, localizeArticle, localizeCategory, localizeEvent, localizeExperience, testiIn } from './i18n/content'
import schedeEn from './data/en/schede.json'
import type { Category, CityEvent, Experience } from './types'

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
  /** Le versioni della pagina nelle due lingue (hreflang): `en` solo se la gemella inglese esiste. */
  alternates?: { it: string; en?: string }
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
import { cut, seoTitle } from './lib/seoTitle'
export { seoTitle }

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

const experienceProduct = (exp: Experience, categoryLabel: string, lang: Lang = 'it') => ({
  // Product per il prezzo e le stelle nei risultati, TouristTrip perché è un'attività turistica.
  '@type': ['Product', 'TouristTrip'],
  name: exp.title,
  touristType: categoryLabel,
  image: abs(exp.image),
  description: lang === 'en' ? `${categoryLabel} in Naples, ${exp.location}. ${exp.duration}. ${exp.included}.` : `${categoryLabel} a Napoli, ${exp.location}. ${exp.duration}. ${exp.included}.`,
  brand: { '@type': 'Brand', name: SITE_NAME },
  // Voto e numero di recensioni sono quelli della piattaforma partner, gli stessi mostrati in pagina.
  aggregateRating: exp.reviews > 0 ? { '@type': 'AggregateRating', ratingValue: exp.rating, reviewCount: exp.reviews, bestRating: 5, worstRating: 1 } : undefined,
  offers: {
    '@type': 'Offer',
    price: priceNumber(exp.price),
    priceCurrency: 'EUR',
    availability: exp.affiliateUrl ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
    url: exp.affiliateUrl ?? abs(lang === 'en' ? '/en/experiences' : '/esperienze'),
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
const eventSchema = (e: CityEvent, lang: Lang = 'it') => {
  const free = isFreeEvent(e)
  const price = eventPriceNumber(e)
  const street = streetOf(e.place)
  const organizer = organizerOf(e.url)
  if (lang === 'en') {
    // Nomi, descrizione e luogo tradotti; date, prezzo e comune dall'italiano (l'orario «21:00» si legge da lì).
    const en = localizeEvent(e, 'en')
    const town = townOf(e.area)
    const path = eventPathEn(e)
    return {
      '@type': 'Event',
      name: en.title,
      description: en.blurb || undefined,
      ...eventDates(e),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: en.place || 'Naples',
        address: { '@type': 'PostalAddress', streetAddress: street, addressLocality: town === 'Napoli' ? 'Naples' : town, addressRegion: 'Campania', addressCountry: 'IT' },
      },
      organizer,
      image: abs(OG_HOME),
      url: abs(path),
      inLanguage: 'en',
      isAccessibleForFree: free || undefined,
      offers:
        price !== undefined
          ? { '@type': 'Offer', price, priceCurrency: 'EUR', availability: 'https://schema.org/InStock', validFrom: BUILD_DAY, url: e.url ?? abs(path) }
          : undefined,
    }
  }
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

/** Titolo, descrizione, immagine, dati strutturati e gemella nell'altra lingua per ogni indirizzo pubblico. */
export function routeSeo(path: string): RouteSeo {
  const clean = path.replace(/\/+$/, '') || '/'
  if (langOf(clean) === 'en') {
    const seo = routeSeoEn(clean)
    const it = localizePath(clean, 'it')
    return seo.updated ? { ...seo, alternates: { it, en: clean } } : seo
  }
  const seo = routeSeoIt(clean)
  if (!seo.updated) return seo // 404 (e solo lei: tutte le pagine vere hanno la data)
  const en = localizePath(clean, 'en')
  return { ...seo, alternates: enPaths().has(en) ? { it: clean, en } : { it: clean } }
}

function routeSeoIt(clean: string): RouteSeo {

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
        ...eventsBetween(BUILD_DAY, addDays(BUILD_DAY, 29)).map((e) => eventSchema(e)),
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
        ...eventsBetween(BUILD_DAY, BUILD_DAY).map((e) => eventSchema(e)),
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
        ...eventsBetween(w.from, w.to).map((e) => eventSchema(e)),
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
  if (clean === '/mappa') {
    return {
      title: 'Mappa di Napoli: eventi ed esperienze, dove sono davvero',
      description: 'La mappa di Cose Fighe: gli eventi dei prossimi giorni e le esperienze prenotabili a Napoli e nel golfo, ognuno al suo posto, con le indicazioni per arrivarci.',
      image: '/og/mappa.jpg',
      updated: BUILD_DAY,
      jsonLd: graph(
        { '@type': 'WebPage', name: 'La mappa di Napoli di Cose Fighe', url: abs('/mappa'), description: 'Eventi ed esperienze a Napoli sulla mappa, con indicazioni.' },
        breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Mappa', path: '/mappa' }]),
      ),
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

// ---------------------------------------------------------------- inglese (/en)

/** Testo dell'interfaccia in inglese: la traduzione del dizionario se c'è, altrimenti quella scritta qui. Mai italiano. */
const tr = (it: string, en: string) => {
  const t = translate(it, 'en')
  return t !== it ? t : en
}

/** Un testo lungo di un modulo dati in inglese (testi.json, chiave = nome della costante), se tradotto: altrimenti niente. */
const testoEn = <T,>(keys: string[], it: T): T | undefined => {
  for (const k of keys) {
    const v = testiIn(k, it, 'en')
    if (v !== it && v !== undefined && v !== null) return v
  }
  return undefined
}

const SCHEDE_EN = schedeEn as Record<string, { intro?: string; faq?: { q: string; a: string }[] }>

const eventPathEn = (e: CityEvent) => `/en/events/${eventSlugEn(e)}`

/** Etichetta della categoria in inglese (vuota se non tradotta). */
const categoryEn = (c: Category) => {
  const en = localizeCategory(c, 'en')
  return en === c ? undefined : en
}
/** Categoria con la sua etichetta inglese, o un'etichetta di riserva. */
const catLabelEn = (c: Category) => categoryEn(c)?.label ?? tr(c.label, c.label)

/** FAQ di una categoria in inglese: dai testi della categoria tradotta o dai testi dei moduli. */
const categoryFaqEn = (slug: string): { q: string; a: string }[] | undefined => {
  const it = CATEGORY_TEXTS[slug]
  if (!it) return undefined
  // Prima i testi dei moduli (testi.json → CATEGORY_TEXTS, stessa forma di categorieTesti.ts), poi categories.json.
  const fromTexts = testoEn(['CATEGORY_TEXTS'], CATEGORY_TEXTS)?.[slug]?.faq
  if (fromTexts?.length) return fromTexts
  const c = CATEGORY_LIST.find((x) => x.slug === slug)
  const fromCat = c ? (localizeCategory({ ...c, ...it }, 'en') as Category & { faq?: { q: string; a: string }[] }).faq : undefined
  return fromCat && fromCat !== it.faq ? fromCat : undefined
}

const faqSchema = (faq: { q: string; a: string }[]) => ({ '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })

const organizationEn = { ...organization, foundingLocation: { '@type': 'Place', name: 'Naples' }, address: { ...organization.address, addressLocality: 'Naples' } }
const websiteEn = { ...website, inLanguage: 'en' }

const HOME_EN = { name: 'Home', path: '/en' }
const THINGS_EN = () => ({ name: tr('Cosa fare a Napoli', 'Things to do in Naples'), path: '/en/things-to-do' })
const EXPERIENCES_EN = () => ({ name: tr('Esperienze', 'Experiences'), path: '/en/experiences' })

/** «24 October 2026» o «until 10 October 2026». */
const eventDateLabelEn = (e: CityEvent) => {
  const end = eventEnd(e)
  const p = dayParts(end, 'en')
  const label = `${p.day} ${p.monLong} ${end.slice(0, 4)}`
  return end === e.start ? label : `until ${label}`
}
const eventTitleEn = (e: CityEvent) => {
  const title = localizeEvent(e, 'en').title
  const date = eventDateLabelEn(e)
  const full = `${title} · ${date}`
  if (full.length <= 65) return seoTitle(full)
  const head = title.split(':')[0].trim()
  if (`${head} · ${date}`.length <= 65) return `${head} · ${date}`
  const short = date.replace(/(\d+) ([A-Za-z]+) (\d{4})/, (_, d, m, y) => `${d} ${m.slice(0, 3)} ${y}`)
  if (`${title} · ${short}`.length <= 65) return `${title} · ${short}`
  return seoTitle(title)
}

const eventsEnBetween = (from: string, to: string) => eventsBetween(from, to).filter(hasEventEn)
const experiencesEn = (c: Category) => c.experiences.filter(hasExperienceEn)
const articlesEn = () => ARTICLES_BY_DATE.filter(hasArticleEn)

function routeSeoEn(clean: string): RouteSeo {
  const lang = 'en' as const

  if (clean === '/en') {
    return {
      title: seoTitle('Things to do in Naples: events, tours and local tips'),
      description: 'What’s on in Naples today and this weekend, checked by locals, plus food tours, workshops, boat trips and underground Naples picked one by one.',
      image: OG_HOME,
      preloadImage: '/mascotte-hero.webp',
      updated: BUILD_DAY,
      jsonLd: graph(organizationEn, websiteEn),
    }
  }
  if (clean === '/en/experiences') {
    const all = CATEGORY_LIST.flatMap(experiencesEn)
    return {
      title: seoTitle('Naples experiences: food tours, boats, workshops'),
      description: 'Street food tours, Vesuvius hikes, boat trips, pizza workshops and underground Naples: experiences picked one by one by locals, with real prices.',
      image: og('/img/naples-streetfood.webp'),
      updated: experiencesUpdated(),
      jsonLd: graph(
        breadcrumbs([HOME_EN, EXPERIENCES_EN()]),
        ...(all.length
          ? [{
              '@type': 'ItemList',
              name: 'Experiences in Naples',
              numberOfItems: all.length,
              itemListElement: all.slice(0, 36).map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: localizeExperience(e, lang).title })),
            }]
          : []),
      ),
    }
  }
  if (clean === '/en/things-to-do') {
    const guide = testoEn(['GUIDE'], GUIDE)
    const faq = testoEn(['COSA_FARE_FAQ'], COSA_FARE_FAQ)
    return {
      title: seoTitle('Things to do in Naples: what’s on, events and 25 ideas'),
      description: 'Things to do in Naples: what’s on in the coming days, checked by locals, our 25 favourite things to do and experiences you can book online.',
      image: OG_HOME,
      updated: BUILD_DAY,
      jsonLd: graph(
        breadcrumbs([HOME_EN, THINGS_EN()]),
        ...(guide?.length
          ? [{
              '@type': 'ItemList',
              name: testoEn(['GUIDE_TITLE'], GUIDE_TITLE) ?? tr(GUIDE_TITLE, '25 things to do in Naples'),
              itemListOrder: 'https://schema.org/ItemListOrderAscending',
              numberOfItems: guide.length,
              itemListElement: guide.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.title, url: abs('/en/things-to-do#' + g.slug) })),
            }]
          : []),
        ...(faq?.length ? [faqSchema(faq)] : []),
        ...eventsEnBetween(BUILD_DAY, addDays(BUILD_DAY, 29)).map((e) => eventSchema(e, lang)),
      ),
    }
  }
  if (clean === '/en/things-to-do/today') {
    return {
      title: seoTitle('Things to do in Naples today: events and ideas'),
      description: 'What’s on in Naples today, checked by locals, and experiences you can still book at the last minute. Updated every morning.',
      image: OG_HOME,
      updated: BUILD_DAY,
      jsonLd: graph(
        breadcrumbs([HOME_EN, THINGS_EN(), { name: tr('Oggi', 'Today'), path: clean }]),
        ...eventsEnBetween(BUILD_DAY, BUILD_DAY).map((e) => eventSchema(e, lang)),
      ),
    }
  }
  if (clean === '/en/things-to-do/weekend') {
    const w = weekendRange(BUILD_DAY)
    return {
      title: 'Things to do in Naples this weekend: Saturday and Sunday',
      description: 'What’s on in Naples this weekend: gigs, festivals, exhibitions and markets, day by day, plus experiences to book. Updated every morning.',
      image: OG_HOME,
      updated: BUILD_DAY,
      jsonLd: graph(
        breadcrumbs([HOME_EN, THINGS_EN(), { name: tr('Questo weekend', 'This weekend'), path: clean }]),
        ...eventsEnBetween(w.from, w.to).map((e) => eventSchema(e, lang)),
      ),
    }
  }
  if (clean === '/en/creators') {
    return {
      updated: STATIC_UPDATED,
      title: 'Become a creator in Naples · Cose Fighe',
      description: 'Know Naples better than a guidebook? Put your experience on Cose Fighe: you set the price and the dates, and you earn on every booking.',
      image: OG_HOME,
      jsonLd: graph(breadcrumbs([HOME_EN, { name: tr('Diventa creator', 'Become a creator'), path: clean }])),
    }
  }
  if (clean === '/en/about') {
    return {
      updated: STATIC_UPDATED,
      title: 'About us: who picks the experiences on Cose Fighe',
      description: 'Cose Fighe started in Naples in 2026 to connect curious travellers with local creators. Who we are, how we choose, what we care about.',
      image: OG_HOME,
      jsonLd: graph(organizationEn, breadcrumbs([HOME_EN, { name: tr('Chi siamo', 'About us'), path: clean }])),
    }
  }
  if (clean === '/en/contact') {
    return {
      updated: STATIC_UPDATED,
      title: 'Contact us: write to the Cose Fighe team in Naples',
      description: 'Write to us with a question, to list your experience or to work together. We reply within 24 hours on weekdays.',
      image: OG_HOME,
      jsonLd: graph({ '@type': 'ContactPage', name: 'Contact Cose Fighe', url: abs(clean), inLanguage: 'en' }, breadcrumbs([HOME_EN, { name: tr('Contatti', 'Contact'), path: clean }])),
    }
  }
  if (clean === '/en/map') {
    return {
      title: seoTitle('Map of Naples: events and experiences near you'),
      description: 'The Cose Fighe map: what’s on in the coming days and bookable experiences in Naples and around the bay, each in its real spot, with directions.',
      image: '/og/mappa.jpg',
      updated: BUILD_DAY,
      jsonLd: graph(
        { '@type': 'WebPage', name: 'The Cose Fighe map of Naples', url: abs(clean), description: 'Events and experiences in Naples on a map, with directions.', inLanguage: 'en' },
        breadcrumbs([HOME_EN, { name: tr('Mappa', 'Map'), path: clean }]),
      ),
    }
  }
  if (clean === '/en/blog') {
    const first = articlesEn()[0]
    return {
      title: 'Naples blog: guides, tips and local stories · Cose Fighe',
      description: 'Guides and stories for living Naples like a local: street food, Vesuvius, underground Naples, neighbourhoods, aperitivo and workshops.',
      image: first ? og(first.coverImage) : OG_HOME,
      updated: first?.date ?? STATIC_UPDATED,
      jsonLd: graph(
        { '@type': 'Blog', name: 'The Cose Fighe blog', url: abs(clean), inLanguage: 'en', publisher: { '@id': SITE_URL + '/#org' } },
        breadcrumbs([HOME_EN, { name: 'Blog', path: clean }]),
      ),
    }
  }
  if (clean === '/en/privacy') return { title: 'Privacy policy · Cose Fighe', description: 'How Cose Fighe handles the data of people who visit the site and write to us: cookie-free analytics, contact forms, your rights and how to reach us.', image: OG_HOME, updated: STATIC_UPDATED, jsonLd: [] }
  if (clean === '/en/cookies') return { title: 'Cookie policy · Cose Fighe', description: 'Cose Fighe uses no tracking cookies: statistics are anonymous and carry no identifiers. What is stored in your browser, and why.', image: OG_HOME, updated: STATIC_UPDATED, jsonLd: [] }

  const cat = clean.match(/^\/en\/category\/([^/]+)$/)
  if (cat) {
    const c = CATEGORY_LIST.find((x) => x.slug === cat[1])
    if (c) {
      const label = catLabelEn(c)
      const cEn = categoryEn(c)
      const exps = experiencesEn(c).map((e) => localizeExperience(e, lang))
      const faq = categoryFaqEn(c.slug)
      const lead = cEn?.subtitle ? `${cEn.subtitle}. ` : ''
      return {
        title: seoTitle(exps.length > 1 ? `${label} in Naples: ${exps.length} experiences picked by locals` : `${label} in Naples: experiences picked by locals`),
        description: cut(
          exps.length >= 2
            ? `${lead}${exps.map((e) => e.title.split(':')[0]).slice(0, 2).join(', ')} and more ${label.toLowerCase()} experiences in Naples, picked one by one.`
            : `${lead}${label} experiences in Naples picked one by one by locals, with the real price and our honest take on each.`,
          158,
        ),
        image: c.experiences[0] ? og(c.experiences[0].image) : OG_HOME,
        updated: experiencesUpdated(c.slug),
        jsonLd: graph(
          breadcrumbs([HOME_EN, EXPERIENCES_EN(), { name: label, path: clean }]),
          ...(exps.length ? [{ '@type': 'ItemList', name: `${label} experiences in Naples`, itemListElement: exps.map((e, i) => ({ '@type': 'ListItem', position: i + 1, item: experienceProduct(e, label, lang) })) }] : []),
          ...(faq?.length ? [faqSchema(faq)] : []),
        ),
      }
    }
  }

  const ep = clean.match(/^\/en\/experiences\/([^/]+)$/)
  if (ep) {
    const itPath = localizePath(clean, 'it')
    const p = EXPERIENCE_PAGES.find((x) => x.path === itPath)
    if (p) {
      const exp = localizeExperience(p.exp, lang)
      const label = catLabelEn(p.category)
      const scheda = p.exp.providerId ? SCHEDE_EN[String(p.exp.providerId)] : undefined
      const intro = scheda?.intro || `${label} in Naples, ${exp.location}. ${exp.duration}. ${exp.included}.`
      return {
        title: seoTitle(exp.title),
        description: cut(intro, 158),
        image: og(p.exp.image),
        preloadImage: p.exp.image,
        updated: experiencesUpdated(p.category.slug),
        jsonLd: graph(
          breadcrumbs([HOME_EN, EXPERIENCES_EN(), { name: label, path: `/en/category/${p.category.slug}` }, { name: exp.title, path: clean }]),
          { ...experienceProduct(exp, label, lang), '@id': abs(clean) + '#product', url: abs(clean), description: intro },
          ...(scheda?.faq?.length ? [faqSchema(scheda.faq)] : []),
        ),
      }
    }
  }

  const art = clean.match(/^\/en\/blog\/([^/]+)$/)
  if (art) {
    const slugIt = localizePath(clean, 'it').replace(/^\/blog\//, '')
    const orig = ARTICLES_BY_DATE.find((x) => x.slug === slugIt)
    if (orig) {
      const a = localizeArticle(orig, lang)
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
            author: { '@type': 'Person', name: a.author },
            publisher: { '@id': SITE_URL + '/#org' },
            mainEntityOfPage: { '@type': 'WebPage', '@id': abs(clean) },
            keywords: a.tags.join(', '),
            articleSection: a.category,
            inLanguage: 'en',
          },
          breadcrumbs([HOME_EN, { name: 'Blog', path: '/en/blog' }, { name: a.title, path: clean }]),
        ),
      }
    }
  }

  const ev = clean.match(/^\/en\/events\/([^/]+)$/)
  if (ev) {
    const slugIt = localizePath(clean, 'it').replace(/^\/eventi\//, '')
    const e = findEvent(slugIt)
    if (e) {
      const en = localizeEvent(e, lang)
      return {
        title: eventTitleEn(e),
        description: cut(`${en.blurb} Date, time, venue and price, plus what else is on in Naples the same days.`.trim(), 158),
        image: OG_HOME,
        updated: e.start,
        jsonLd: graph(
          breadcrumbs([HOME_EN, THINGS_EN(), { name: en.title, path: clean }]),
          { ...eventSchema(e, lang), '@id': abs(clean) + '#event' },
        ),
      }
    }
  }

  return {
    title: 'Page not found · Cose Fighe',
    description: 'The page you are looking for does not exist.',
    image: OG_HOME,
    jsonLd: [],
  }
}

/** Indirizzi italiani delle pagine con un nome. */
const itContentPaths = () => [
  ...CATEGORY_LIST.map((c) => `/categoria/${c.slug}`),
  ...EXPERIENCE_PAGES.map((p) => p.path),
  ...ARTICLES_BY_DATE.map((a) => `/blog/${a.slug}`),
  // Una pagina per evento; quelli finiti da più di 30 giorni escono da sitemap e pre-generazione.
  // Regola: un evento finito sparisce dal sito il giorno dopo (lista, mappa, pagina, sitemap).
  ...eventsForPages(BUILD_DAY, 0).map(eventPath),
]

/**
 * Indirizzi inglesi pubblici: le pagine fisse sempre, i contenuti solo se tradotti
 * (categoria con etichetta tradotta, esperienza, articolo, evento).
 */
function enPublicPaths(): string[] {
  return [
    ...Object.values(STATIC_PATHS),
    ...CATEGORY_LIST.filter((c) => categoryEn(c)).map((c) => `/en/category/${c.slug}`),
    ...EXPERIENCE_PAGES.filter((p) => hasExperienceEn(p.exp)).map((p) => localizePath(p.path, 'en')),
    ...articlesEn().map((a) => localizePath(`/blog/${a.slug}`, 'en')),
    ...eventsForPages(BUILD_DAY, 0).filter(hasEventEn).map(eventPathEn),
  ]
}

let EN_SET: Set<string> | undefined
const enPaths = () => (EN_SET ??= new Set(enPublicPaths()))

/** Tutti gli indirizzi pubblici da pre-generare e mettere nella sitemap: prima gli italiani, poi le gemelle inglesi. */
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
    '/mappa',
    '/privacy',
    '/cookie',
    ...itContentPaths(),
    ...enPaths(),
  ]
}
