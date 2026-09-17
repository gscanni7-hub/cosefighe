// Mini server che imita Vercel per provare la build in locale: cleanUrls (/x -> x.html), file statici, 404.html per il resto, /admin -> app.html.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
const dist = join(fileURLToPath(new URL('..', import.meta.url)), 'dist')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2', '.json': 'application/json' }
const exists = async (p) => { try { return (await stat(p)).isFile() } catch { return false } }
createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let file = join(dist, p), status = 200
  if (p === '/') file = join(dist, 'index.html')
  else if (p === '/admin' || p.startsWith('/admin/')) file = join(dist, 'app.html')
  else if (!extname(p) && (await exists(join(dist, p.slice(1) + '.html')))) file = join(dist, p.slice(1) + '.html')
  else if (!(await exists(file))) { file = join(dist, '404.html'); status = 404 }
  try { const body = await readFile(file); res.writeHead(status, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }); res.end(body) } catch { res.writeHead(404); res.end('nf') }
}).listen(Number(process.env.PORT ?? 4176), () => console.log('dist su http://localhost:' + (process.env.PORT ?? 4176)))
