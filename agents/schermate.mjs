import { chromium } from 'playwright'
const [base, out, ...paths] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'chrome' })
for (const vp of [{ w: 1280, h: 800, n: 'desk' }, { w: 400, h: 800, n: 'mob' }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, locale: 'it-IT' })
  const page = await ctx.newPage()
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)) } window.scrollTo(0, 0) })
    await page.waitForTimeout(800)
    const name = (p === '/' ? 'home' : p.replace(/^\//, '').replace(/\//g, '-')) + '-' + vp.n + '.png'
    await page.screenshot({ path: `${out}/${name}`, fullPage: true })
    console.log(name)
  }
  await ctx.close()
}
await browser.close()
