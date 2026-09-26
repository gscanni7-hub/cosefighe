/**
 * Divide i testi lunghi in un file per pagina, così il browser scarica solo quello che serve:
 * - src/data/split/schede-it/<providerId>.json, schede-en/<providerId>.json  (testi delle schede)
 * - src/data/split/bodies-it/<slug>.json, bodies-en/<slug-italiano>.json      (corpi degli articoli)
 * - src/data/split/slugs.json  (slug inglesi di esperienze, eventi e articoli: servono al selettore IT | EN anche sulle pagine italiane)
 * La cartella è generata (non va in git): gira prima di ogni build e di `npm run dev`.
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const data = join(root, 'src/data')
const out = join(data, 'split')
const read = async (p) => (existsSync(join(data, p)) ? JSON.parse(await readFile(join(data, p), 'utf8')) : {})

await rm(out, { recursive: true, force: true })
const groups = {
  'schede-it': await read('schede.json'),
  'schede-en': await read('en/schede.json'),
  'bodies-it': await read('generated-bodies.json'),
  'bodies-en': await read('en/articles-bodies.json'),
}
for (const [dir, map] of Object.entries(groups)) {
  await mkdir(join(out, dir), { recursive: true })
  let n = 0
  for (const [key, value] of Object.entries(map)) {
    if (!/^[\w-]+$/.test(key)) continue
    await writeFile(join(out, dir, key + '.json'), JSON.stringify(value))
    n++
  }
  console.log(`dividi-dati: ${dir}, ${n} file`)
}

const exp = await read('en/experiences.json')
const ev = await read('en/events.json')
const ar = await read('en/articles.json')
const pick = (m, key) => Object.fromEntries(Object.entries(m).filter(([, v]) => v?.slug && v?.title).map(([k, v]) => [key(k, v), v.slug]))
const slugs = {
  experiences: pick(exp, (_, v) => v.slugIt),
  events: pick(ev, (k) => k),
  articles: pick(ar, (k) => k),
}
await writeFile(join(out, 'slugs.json'), JSON.stringify(slugs, null, 1) + '\n')
console.log('dividi-dati: slugs.json')
