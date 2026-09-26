/** Tutto l'inglese in un pacchetto a parte (vedi enData.ts). */
import type { EnBundle } from './enData'
import comune from './ui/comune.json'
import home from './ui/home.json'
import esperienze from './ui/esperienze.json'
import cosafare from './ui/cosafare.json'
import eventi from './ui/eventi.json'
import mappa from './ui/mappa.json'
import blog from './ui/blog.json'
import pagine from './ui/pagine.json'
import experiences from '../data/en/experiences.json'
import events from '../data/en/events.json'
import articles from '../data/en/articles.json'
import categories from '../data/en/categories.json'
import testi from '../data/en/testi.json'

const bundle: EnBundle = {
  ui: { ...comune, ...home, ...esperienze, ...cosafare, ...eventi, ...mappa, ...blog, ...pagine },
  experiences: experiences as EnBundle['experiences'],
  events: events as EnBundle['events'],
  articles: articles as EnBundle['articles'],
  categories: categories as EnBundle['categories'],
  testi: testi as EnBundle['testi'],
}
export default bundle
