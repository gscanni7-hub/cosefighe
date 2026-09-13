import type { CityEvent, EventCategory } from '../types'
import { overlaps, todayISO } from '../lib/dates'
import generated from './generated.json'

/**
 * DATI DI ESEMPIO. Servono a vedere la sezione funzionare: quando il back end
 * sarà pronto, gli eventi verranno inseriti dal pannello admin e questo file
 * farà solo da riserva. Date e dettagli vanno verificati prima di pubblicare.
 */
const SAMPLE_EVENTS: CityEvent[] = [
  {
    slug: 'street-food-weekend-municipio',
    title: 'Street Food Weekend a Piazza Municipio',
    category: 'food',
    start: '2026-09-12',
    end: '2026-09-13',
    time: '12:00 – 24:00',
    place: 'Piazza Municipio',
    area: 'Centro',
    price: 'Ingresso libero',
    blurb: 'Quaranta cucine di strada da tutta la Campania, birre artigianali e musica dal vivo la sera.',
  },
  {
    slug: 'jazz-tramonto-castel-ovo',
    title: 'Jazz al tramonto sulla terrazza di Castel dell’Ovo',
    category: 'spettacoli',
    start: '2026-09-14',
    time: '19:00',
    place: 'Castel dell’Ovo',
    area: 'Lungomare',
    price: '€12',
    blurb: 'Quartetto napoletano, il golfo alle spalle. Si entra fino a esaurimento posti.',
  },
  {
    slug: 'notte-al-mann',
    title: 'Notte al MANN: il museo aperto fino a mezzanotte',
    category: 'arte',
    start: '2026-09-17',
    time: '19:00 – 24:00',
    place: 'Museo Archeologico Nazionale',
    area: 'Museo',
    price: '€2',
    blurb: 'Le collezioni pompeiane con visite guidate a ciclo continuo e un dj set nel cortile.',
  },
  {
    slug: 'san-gennaro',
    title: 'Festa di San Gennaro e miracolo del sangue',
    category: 'citta',
    start: '2026-09-19',
    time: 'dalle 9:00',
    place: 'Duomo di Napoli',
    area: 'Centro Storico',
    price: 'Gratis',
    featured: true,
    blurb: 'Il giorno più napoletano dell’anno. Arriva presto: il Duomo si riempie all’alba e la festa continua per le strade fino a sera.',
  },
  {
    slug: 'wine-vinyl-market',
    title: 'Wine & Vinyl Market a Palazzo Fondi',
    category: 'food',
    start: '2026-09-19',
    end: '2026-09-21',
    time: '17:00 – 23:00',
    place: 'Palazzo Fondi',
    area: 'Via Medina',
    price: '€8 con calice',
    blurb: 'Vignaioli campani e banchi di dischi usati nello stesso cortile. Il sabato sera suonano dal vivo.',
  },
  {
    slug: 'trail-vesuvio',
    title: 'Trail del Vesuvio, 21 km sul vulcano',
    category: 'sport',
    start: '2026-09-20',
    time: '8:30',
    place: 'Parco Nazionale del Vesuvio',
    area: 'Ercolano',
    price: '€35 iscrizione',
    blurb: 'Gara e camminata non competitiva sui sentieri del cratere. Iscrizioni fino al giovedì prima.',
    url: 'https://www.parconazionaledelvesuvio.it',
  },
  {
    slug: 'napoli-milan-maradona',
    title: 'Napoli – Milan allo stadio Maradona',
    category: 'sport',
    start: '2026-09-20',
    time: '20:45',
    place: 'Stadio Diego Armando Maradona',
    area: 'Fuorigrotta',
    price: 'da €40',
    featured: true,
    blurb: 'Serie A. Se non hai il biglietto, i bar di Fuorigrotta e dei Quartieri sono l’alternativa vera.',
  },
  {
    slug: 'cinema-aperto-maschio-angioino',
    title: 'Cinema all’aperto: Le mani sulla città',
    category: 'spettacoli',
    start: '2026-09-24',
    time: '21:00',
    place: 'Cortile del Maschio Angioino',
    area: 'Piazza Municipio',
    price: 'Gratis',
    blurb: 'Il film di Rosi proiettato dentro il castello, con introduzione di uno storico dell’urbanistica napoletana.',
  },
  {
    slug: 'vintage-market-chiaia',
    title: 'Mercatino vintage di Chiaia',
    category: 'citta',
    start: '2026-09-26',
    end: '2026-09-27',
    time: '10:00 – 20:00',
    place: 'Via Chiaia e Piazza dei Martiri',
    area: 'Chiaia',
    price: 'Ingresso libero',
    blurb: 'Abiti, vinili, ceramiche e mobili anni Settanta. Vale per curiosare anche senza comprare.',
  },
  {
    slug: 'ceramica-aperta-capodimonte',
    title: 'Laboratori di ceramica aperti a Capodimonte',
    category: 'laboratori',
    start: '2026-09-27',
    time: '10:00 – 18:00',
    place: 'Real Fabbrica di Capodimonte',
    area: 'Capodimonte',
    price: '€15',
    blurb: 'Le botteghe aprono le porte: si prova il tornio e si porta a casa il pezzo cotto la settimana dopo.',
  },
  {
    slug: 'festival-del-mare-bagnoli',
    title: 'Festival del Mare a Bagnoli',
    category: 'outdoor',
    start: '2026-10-02',
    end: '2026-10-04',
    time: '10:00 – 22:00',
    place: 'Arenile di Bagnoli',
    area: 'Bagnoli',
    price: 'Gratis, attività a pagamento',
    blurb: 'Prove gratuite di sup e vela, talk sulla bonifica del litorale, concerti la sera sulla sabbia.',
  },
  {
    slug: 'san-carlo-serata-verdi',
    title: 'Serata Verdi al Teatro di San Carlo',
    category: 'spettacoli',
    start: '2026-10-03',
    time: '20:00',
    place: 'Teatro di San Carlo',
    area: 'Via San Carlo',
    price: 'da €25',
    blurb: 'Arie e sinfonie con l’orchestra del teatro. I posti in loggione sono i più economici e si vede benissimo.',
    url: 'https://www.teatrosancarlo.it',
  },
  {
    slug: 'giornate-fai-autunno',
    title: 'Giornate FAI d’autunno: palazzi e chiese chiuse al pubblico',
    category: 'arte',
    start: '2026-10-10',
    end: '2026-10-11',
    time: '10:00 – 18:00',
    place: 'Sedi in tutta la città',
    area: 'Napoli',
    price: 'Offerta libera',
    featured: true,
    blurb: 'Il weekend in cui aprono luoghi normalmente inaccessibili. Le code più lunghe sono a Palazzo Reale: punta sulle chiese del Centro Storico.',
    url: 'https://fondoambiente.it',
  },
  {
    slug: 'corsa-delle-scale',
    title: 'Corsa delle Scale di Napoli',
    category: 'sport',
    start: '2026-10-17',
    time: '9:00',
    place: 'Pedamentina di San Martino',
    area: 'Vomero',
    price: '€10',
    blurb: 'Dieci chilometri su e giù per le scale storiche, da Montesanto a San Martino. Anche camminando.',
  },
  {
    slug: 'fiera-presepe-san-gregorio',
    title: 'Fiera del presepe a San Gregorio Armeno',
    category: 'laboratori',
    start: '2026-10-24',
    end: '2026-10-25',
    time: '9:00 – 20:00',
    place: 'Via San Gregorio Armeno',
    area: 'Centro Storico',
    price: 'Ingresso libero',
    blurb: 'Gli artigiani presentano i pastori dell’anno. Il weekend più affollato prima del Natale, ma anche il più vivo.',
  },
  {
    slug: 'halloween-napoli-sotterranea',
    title: 'Notte di Halloween nella Napoli Sotterranea',
    category: 'citta',
    start: '2026-10-31',
    time: '21:00 e 23:00',
    place: 'Napoli Sotterranea, Piazza San Gaetano',
    area: 'Centro Storico',
    price: '€18',
    blurb: 'Visita notturna a lume di candela, 40 metri sotto la città. Prenotazione obbligatoria.',
    url: 'https://www.napolisotterranea.org',
  },
]

interface DbEvent {
  slug: string
  title: string
  category: EventCategory
  start_date: string
  end_date?: string | null
  time?: string | null
  place?: string | null
  area?: string | null
  price?: string | null
  blurb?: string | null
  url?: string | null
  featured?: boolean | null
}

const dbEvents: CityEvent[] = ((generated.events as DbEvent[]) ?? []).map((e) => ({
  slug: e.slug,
  title: e.title,
  category: e.category,
  start: e.start_date,
  end: e.end_date ?? undefined,
  time: e.time ?? undefined,
  place: e.place ?? '',
  area: e.area ?? '',
  price: e.price ?? '',
  blurb: e.blurb ?? '',
  url: e.url ?? undefined,
  featured: e.featured ?? false,
}))

/** Eventi pubblicati nel database; finché non ce ne sono, restano gli esempi. */
export const EVENTS: CityEvent[] = dbEvents.length ? dbEvents : SAMPLE_EVENTS
export const HAS_DB_EVENTS = dbEvents.length > 0

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  food: 'Food',
  outdoor: 'Outdoor',
  sport: 'Sport',
  arte: 'Arte',
  laboratori: 'Laboratori',
  spettacoli: 'Spettacoli',
  citta: 'In città',
}

export const EVENT_CATEGORIES = Object.keys(EVENT_CATEGORY_LABELS) as EventCategory[]

export function eventEnd(e: CityEvent): string {
  return e.end ?? e.start
}

/** Eventi che cadono, anche solo in parte, tra due date. Ordinati per inizio. */
export function eventsBetween(from: string, to: string, category?: EventCategory | null): CityEvent[] {
  return EVENTS.filter((e) => overlaps(e.start, eventEnd(e), from, to) && (!category || e.category === category)).sort(
    (a, b) => a.start.localeCompare(b.start),
  )
}

/** I prossimi eventi da oggi in poi. */
/** Vero se l'evento dura più di una settimana (mostre, rassegne): nelle liste brevi va in coda. */
export function isLongRunning(e: CityEvent): boolean {
  return !!e.end && eachDayCount(e.start, e.end) > 7
}

function eachDayCount(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1
}

/** I prossimi eventi a data fissa; le mostre e le rassegne lunghe solo se manca altro. */
export function upcomingEvents(limit = 4, today = todayISO()): CityEvent[] {
  const live = EVENTS.filter((e) => eventEnd(e) >= today)
  const dated = live.filter((e) => !isLongRunning(e)).sort((a, b) => a.start.localeCompare(b.start))
  const long = live.filter(isLongRunning).sort((a, b) => eventEnd(a).localeCompare(eventEnd(b)))
  return [...dated, ...long].slice(0, limit)
}
