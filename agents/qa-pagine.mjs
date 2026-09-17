import { chromium } from 'playwright'
const base = 'http://localhost:4176'
const paths = ['/', '/esperienze', '/esperienze/galleria-borbonica-cisterne-rifugi-e-auto-depoca', '/blog', '/blog/napoli-in-3-giorni', '/blog/street-food-napoli-guida-completa', '/privacy', '/categoria/arte', '/cosa-fare']
const browser = await chromium.launch({ channel: 'chrome', headless: true })
for (const w of [1280, 400]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } })
  for (const p of paths) {
    const page = await ctx.newPage(); const logs = []
    page.on('console', (m) => { if (['error','warning'].includes(m.type()) && !m.text().includes('Unexpected token')) logs.push(m.type()+': '+m.text().slice(0,150)) })
    page.on('pageerror', (e) => { if (!e.message.includes('Unexpected token')) logs.push('pageerror: '+e.message.slice(0,150)) })
    await page.goto(base + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(700)
    const info = await page.evaluate(() => ({ h1: document.querySelector('h1')?.textContent?.trim().slice(0,40), words: document.body.innerText.split(/\s+/).length, sw: document.documentElement.scrollWidth }))
    console.log(w, p, JSON.stringify(info), logs.length ? logs : 'ok'); await page.close()
  }
  await ctx.close()
}
// navigazione interna verso pagine caricate a parte
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto(base + '/categoria/food', { waitUntil: 'networkidle' })
await page.locator('article h3 a').first().click(); await page.waitForTimeout(1200)
console.log('card → scheda:', page.url().split('/').pop().slice(0,50), '|', (await page.locator('h2').allTextContents()).slice(0,3))
await page.goto(base + '/blog', { waitUntil: 'networkidle' })
await page.locator('a[href^="/blog/"]').first().click(); await page.waitForTimeout(1200)
console.log('blog → articolo:', page.url().split('/').pop().slice(0,50), '| parole', await page.evaluate(() => document.body.innerText.split(/\s+/).length))
await browser.close()
