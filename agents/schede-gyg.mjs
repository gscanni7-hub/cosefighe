import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
const out = process.argv[2]
const ids = process.argv.slice(3)
const browser = await chromium.launch({ channel: 'chrome', headless: false, args: ['--disable-blink-features=AutomationControlled'] })
const ctx = await browser.newContext({ locale: 'it-IT', viewport: { width: 1366, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' })
const page = await ctx.newPage()
const res = {}
for (const id of ids) {
  try {
    await page.goto(`https://www.getyourguide.com/it-it/comune-di-napoli-l162/-t${id}/`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(4500)
    const data = await page.evaluate(() => {
      const lds = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { return JSON.parse(s.textContent) } catch { return null } }).filter(Boolean)
      const prod = lds.find(l => (Array.isArray(l['@type']) ? l['@type'] : [l['@type']]).includes('Product'))
      return { url: location.href, name: prod?.name, description: prod?.description, rating: prod?.aggregateRating?.ratingValue, reviews: prod?.aggregateRating?.reviewCount, text: document.body.innerText.slice(0, 9000) }
    })
    res[id] = data
    console.log(id, '→', data.name, data.rating, data.reviews)
  } catch (e) { console.log(id, 'errore', e.message.split('\n')[0]) }
}
writeFileSync(out, JSON.stringify(res, null, 1))
await browser.close()
