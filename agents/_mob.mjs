import { chromium } from 'playwright'
const [base, out, ...paths] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'it-IT' })
const page = await ctx.newPage()
for (const p of paths) {
  await page.goto(base + p, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)) } window.scrollTo(0, 0) })
  await page.waitForTimeout(900)
  const name = (p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '-').split('?')[0]) + '.png'
  await page.screenshot({ path: `${out}/${name}`, fullPage: true })
  console.log(name)
}
await browser.close()
