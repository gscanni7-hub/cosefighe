import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, matchRoutes, RouterProvider } from 'react-router'
import './index.css'
import { AppProviders, routes } from './routes'
import { startTracking } from './lib/track'

async function boot() {
  // Le pagine caricate a parte (scheda, articolo, privacy) vanno risolte prima dell'aggancio,
  // altrimenti React troverebbe un HTML diverso da quello che sa disegnare in quel momento.
  const lazyMatches = matchRoutes(routes, window.location)?.filter((m) => m.route.lazy)
  if (lazyMatches?.length) {
    await Promise.all(
      lazyMatches.map(async (m) => {
        const mod = await (m.route.lazy as () => Promise<Record<string, unknown>>)()
        Object.assign(m.route, { ...mod, lazy: undefined })
      }),
    )
  }

  const router = createBrowserRouter(routes)
  const root = document.getElementById('root')!
  const app = (
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>
  )

  // Le pagine pubbliche arrivano già come HTML: React si aggancia a quello che c'è.
  if (root.hasChildNodes())
    hydrateRoot(root, app, {
      onRecoverableError(error, info) {
        // Segnala in console dove l'HTML pre-generato non combacia con React, senza bloccare la pagina.
        console.warn('[hydration]', error instanceof Error ? error.message : error, info.componentStack)
      },
    })
  else createRoot(root).render(app)

  startTracking(router)
}

void boot()
