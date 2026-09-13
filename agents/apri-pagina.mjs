/**
 * Apre una pagina con il Chrome installato sul Mac (come farebbe una persona) e stampa il testo
 * o l'HTML. Serve agli agenti quando un sito rifiuta le richieste automatiche (es. GetYourGuide).
 * Uso: node agents/apri-pagina.mjs <url> [--html] [--wait 2000]
 */
import { chromium } from 'playwright'
const [, , url, ...rest] = process.argv
if (!url) {
  console.error('Uso: node agents/apri-pagina.mjs <url> [--html] [--wait ms]')
  process.exit(1)
}
const html = rest.includes('--html')
const wait = Number(rest[rest.indexOf('--wait') + 1]) || 1500
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ locale: 'it-IT', viewport: { width: 1366, height: 900 } })
const page = await ctx.newPage()
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(wait)
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 1600)
    await page.waitForTimeout(400)
  }
  console.log(html ? await page.content() : await page.evaluate(() => document.body.innerText))
} catch (e) {
  console.error('errore:', e.message.split('\n')[0])
  process.exitCode = 2
} finally {
  await browser.close()
}
