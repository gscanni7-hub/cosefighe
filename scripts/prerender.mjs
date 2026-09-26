/**
 * Pre-generazione delle pagine pubbliche.
 * Gira dopo `vite build` (client) e `vite build --ssr` (server):
 * per ogni indirizzo pubblico scrive dist/<indirizzo>/index.html con
 * il contenuto già renderizzato, titolo, descrizione, canonical, Open Graph
 * e dati strutturati. Rigenera anche la sitemap.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = join(root, process.env.DIST_DIR ?? 'dist')
const { render, publicPaths, routeSeo, SITE_URL } = await import(join(root, process.env.SSR_DIR ?? 'dist-ssr', 'entry-server.js'))

const template = await readFile(join(dist, 'index.html'), 'utf8')
// Guscio vuoto per gli indirizzi non pre-generati (404, admin, query dinamiche).
// È raggiungibile anche come /app: noindex, altrimenti Google la vede come un doppione della home.
await writeFile(join(dist, 'app.html'), template.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>'))

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const abs = (p) => (p.startsWith('http') ? p : SITE_URL + p)

function head(path, seo) {
  const url = SITE_URL + (path === '/' ? '/' : path)
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,
    `<meta property="og:type" content="${path.startsWith('/blog/') ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="Cose Fighe" />`,
    `<meta property="og:locale" content="it_IT" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:image" content="${abs(seo.image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta name="twitter:image" content="${abs(seo.image)}" />`,
  ]
  if (seo.preloadImage) tags.push(`<link rel="preload" as="image" href="${seo.preloadImage}" fetchpriority="high" />`)
  for (const ld of seo.jsonLd) tags.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`)
  return tags.join('\n    ')
}

const stripHead = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>\s*/g, '')
    .replace(/<meta name="description"[^>]*>\s*/g, '')
    .replace(/<meta property="og:[^"]*"[^>]*>\s*/g, '')
    .replace(/<meta name="twitter:[^"]*"[^>]*>\s*/g, '')

const paths = publicPaths()
const today = new Date().toISOString().slice(0, 10)
let ok = 0
for (const path of paths) {
  const seo = routeSeo(path)
  let body = await render(path)
  // React mette in testa al frammento i suggerimenti di precaricamento delle immagini:
  // vanno nell'head, non dentro la radice, altrimenti l'aggancio nel browser non combacia.
  const hints = []
  body = body.replace(/^(?:<link [^>]*\/?>)+/, (m) => {
    hints.push(m)
    return ''
  })
  const html = stripHead(template)
    .replace('</head>', `    ${head(path, seo)}\n    ${hints.join('')}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  // "/" -> index.html; "/blog/x" -> blog/x.html (Vercel li serve come /blog/x grazie a cleanUrls).
  const file = path === '/' ? join(dist, 'index.html') : join(dist, `${path.slice(1)}.html`)
  await mkdir(join(file, '..'), { recursive: true })
  await writeFile(file, html)
  ok++
}

// Pagina 404 vera: Vercel la serve con stato 404 per ogni indirizzo che non esiste (prima rispondeva 200: "soft 404" per Google).
{
  let body = await render('/pagina-non-trovata')
  const hints = []
  body = body.replace(/^(?:<link [^>]*\/?>)+/, (m) => {
    hints.push(m)
    return ''
  })
  const head404 = ['<title>Pagina non trovata · Cose Fighe</title>', '<meta name="robots" content="noindex" />', '<meta name="description" content="La pagina che cerchi non esiste." />'].join('\n    ')
  const html = stripHead(template)
    .replace('</head>', `    ${head404}\n    ${hints.join('')}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  await writeFile(join(dist, '404.html'), html)
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .filter((p) => !['/privacy', '/cookie'].includes(p))
  .map((p) => {
    const seo = routeSeo(p)
    const daily = p === '/' || p.startsWith('/cosa-fare')
    return `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc><lastmod>${seo.updated ?? today}</lastmod><changefreq>${daily ? 'daily' : 'weekly'}</changefreq><priority>${p === '/' || p === '/cosa-fare' ? '1.0' : p.startsWith('/blog/') ? '0.6' : p.startsWith('/esperienze/') ? '0.7' : '0.8'}</priority></url>`
  })
  .join('\n')}
</urlset>
`
await writeFile(join(dist, 'sitemap.xml'), sitemap)
console.log(`Pre-generate ${ok} pagine, sitemap con ${paths.length - 2} indirizzi.`)

// IndexNow: avvisa Bing (e chi lo usa) degli indirizzi aggiornati. Solo nelle build su Vercel;
// la chiave è pubblica per protocollo (public/<chiave>.txt).
const INDEXNOW_KEY = 'f9e928b5c09f1cd00f1c528d72161979'
if (process.env.VERCEL && !process.env.SKIP_INDEXNOW) {
  const host = new URL(SITE_URL).host
  const urlList = paths.filter((p) => !['/privacy', '/cookie'].includes(p)).map((p) => SITE_URL + (p === '/' ? '/' : p))
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList }),
    })
    console.log(`IndexNow: ${res.status} per ${urlList.length} indirizzi.`)
  } catch (e) {
    console.warn('IndexNow non raggiungibile:', e.message)
  }
}
