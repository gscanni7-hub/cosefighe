import { renderToString } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'
import { AppProviders, routes } from './routes'
import { registerEn } from './i18n/enData'
import enBundle from './i18n/enBundle'
import { preloadPath } from './data/split'

// In generazione l'inglese serve sempre (pagine /en, hreflang, sitemap).
registerEn(enBundle)

export { publicPaths, routeSeo, SITE_URL } from './seo'

/** Genera l'HTML di una pagina pubblica, usato in fase di build da scripts/prerender.mjs. */
export async function render(path: string): Promise<string> {
  await preloadPath(path)
  const handler = createStaticHandler(routes)
  const context = await handler.query(new Request('https://cosefighe.local' + path))
  if (context instanceof Response) throw new Error(`Redirect inatteso per ${path}`)
  const router = createStaticRouter(handler.dataRoutes, context)
  return renderToString(
    <AppProviders>
      <StaticRouterProvider router={router} context={context} hydrate={false} />
    </AppProviders>,
  )
}
