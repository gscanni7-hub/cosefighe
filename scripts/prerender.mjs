/**
 * Pre-generazione delle pagine pubbliche.
 * Gira dopo `vite build` (client) e `vite build --ssr` (server):
 * per ogni indirizzo pubblico scrive dist/<indirizzo>/index.html con
 * il contenuto già renderizzato, titolo, descrizione, canonical, Open Graph
 * e dati strutturati. Rigenera anche la sitemap.
 */
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = join(root, process.env.DIST_DIR ?? 'dist')
const { render, publicPaths, routeSeo, SITE_URL } = await import(join(root, process.env.SSR_DIR ?? 'dist-ssr', 'entry-server.js'))

const template = await readFile(join(dist, 'index.html'), 'utf8')
// Guscio vuoto per gli indirizzi non pre-generati (404, admin, query dinamiche).
await copyFile(join(dist, 'index.html'), join(dist, 'app.html'))

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const abs = (p) => (p.startsWith('http') ? p : SITE_URL + p)

function head(path, seo) {
  const url = SITE_URL + (path === '/' ? '/' : path)
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
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

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .filter((p) => !['/privacy', '/cookie'].includes(p))
  .map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod><changefreq>${p === '/cosa-fare' ? 'daily' : 'weekly'}</changefreq><priority>${p === '/' ? '1.0' : p.startsWith('/blog/') ? '0.6' : '0.8'}</priority></url>`)
  .join('\n')}
</urlset>
`
await writeFile(join(dist, 'sitemap.xml'), sitemap)
console.log(`Pre-generate ${ok} pagine, sitemap con ${paths.length - 2} indirizzi.`)
