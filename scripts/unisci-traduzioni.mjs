/**
 * Unisce le traduzioni parziali (src/data/en/parts/) nei file definitivi di src/data/en/.
 *
 *   experiences.json, experiences-*.json → experiences.json
 *   schede.json, schede-*.json           → schede.json
 *   articles.json, articles-*.json       → articles.json   (tranne articles-bodies*)
 *   articles-bodies.json, articles-bodies-*.json → articles-bodies.json
 *   events.json, events-*.json           → events.json
 *
 * Si parte dal file definitivo che c'è già e ci si sovrappongono i parziali (in ordine di nome):
 * se un parziale manca, le traduzioni già presenti restano. Chiavi in ordine alfabetico, indentazione 1.
 * Gira prima di `vite build` (vedi package.json).
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const enDir = join(root, 'src', 'data', 'en')
const partsDir = join(enDir, 'parts')

const GROUPS = [
  { out: 'experiences.json', match: /^experiences(-.+)?\.json$/ },
  { out: 'schede.json', match: /^schede(-.+)?\.json$/ },
  { out: 'articles.json', match: /^articles(-(?!bodies).+)?\.json$/ },
  { out: 'articles-bodies.json', match: /^articles-bodies(-.+)?\.json$/ },
  { out: 'events.json', match: /^events(-.+)?\.json$/ },
]

const readJson = async (file) => {
  try {
    const v = JSON.parse(await readFile(file, 'utf8'))
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null
  } catch (e) {
    console.warn(`unisci-traduzioni: ${file} non è un JSON valido (${e.message}), lo salto.`)
    return null
  }
}

const sorted = (obj) => Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]))

const parts = existsSync(partsDir) ? (await readdir(partsDir)).filter((f) => f.endsWith('.json')).sort() : []

for (const g of GROUPS) {
  const files = parts.filter((f) => g.match.test(f))
  const outFile = join(enDir, g.out)
  if (!files.length) {
    console.log(`unisci-traduzioni: ${g.out} — nessun parziale, resta com'è.`)
    continue
  }
  const merged = (existsSync(outFile) && (await readJson(outFile))) || {}
  let added = 0
  for (const f of files) {
    const data = await readJson(join(partsDir, f))
    if (!data) continue
    for (const [k, v] of Object.entries(data)) {
      merged[k] = v
      added++
    }
  }
  await writeFile(outFile, JSON.stringify(sorted(merged), null, 1) + '\n')
  console.log(`unisci-traduzioni: ${g.out} — ${files.length} parziali, ${added} voci, ${Object.keys(merged).length} in totale.`)
}
