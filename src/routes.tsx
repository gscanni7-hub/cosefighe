import { lazy, Suspense, type ReactNode } from 'react'
import { Link, Outlet, ScrollRestoration, isRouteErrorResponse, useRouteError, type RouteObject } from 'react-router'
import { MotionConfig } from 'motion/react'
import { AdminProvider } from './context/AdminContext'
import HomePage from './pages/HomePage'
import ExperiencesPage from './pages/ExperiencesPage'
import WhatsOnPage from './pages/WhatsOnPage'
import CreatorPage from './pages/CreatorPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CategoryPage from './pages/CategoryPage'
import BlogPage from './pages/BlogPage'
import BlogArticlePage from './pages/BlogArticlePage'
import PrivacyPage from './pages/PrivacyPage'
import CookiePage from './pages/CookiePage'
import CreditsPage from './pages/CreditsPage'
import NotFoundPage from './pages/NotFoundPage'

// L'area admin viene scaricata solo quando serve.
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminExperiences = lazy(() => import('./pages/admin/AdminExperiences'))
const AdminExperienceForm = lazy(() => import('./pages/admin/AdminExperienceForm'))
const AdminArticles = lazy(() => import('./pages/admin/AdminArticles'))
const AdminArticleForm = lazy(() => import('./pages/admin/AdminArticleForm'))
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))
const AdminDrafts = lazy(() => import('./pages/admin/AdminDrafts'))

const AdminFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-paper font-sans text-sm text-ink/50">Caricamento del pannello...</div>
)

const RootLayout = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
)

const admin = (el: ReactNode) => <Suspense fallback={<AdminFallback />}>{el}</Suspense>

/** Se qualcosa si rompe, invece di una pagina bianca si vede cosa è successo. */
function RootError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : String(error)
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 font-sans text-ink">
      <div className="card max-w-md p-8">
        <p className="label text-orange">Qualcosa non ha funzionato</p>
        <h1 className="mt-3 text-xl font-bold">La pagina non si è caricata</h1>
        <p className="mt-2 text-sm text-ink/60">Ricarica la pagina. Se succede ancora, manda questo messaggio a chi gestisce il sito:</p>
        <pre className="mt-4 overflow-auto rounded-2xl bg-white p-4 text-xs text-error">{message}</pre>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold underline underline-offset-4">
          Torna alla home
        </Link>
      </div>
    </div>
  )
}

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RootError />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/esperienze', element: <ExperiencesPage /> },
      { path: '/cosa-fare', element: <WhatsOnPage /> },
      { path: '/creator', element: <CreatorPage /> },
      { path: '/chi-siamo', element: <AboutPage /> },
      { path: '/contatti', element: <ContactPage /> },
      { path: '/categoria/:slug', element: <CategoryPage /> },
      { path: '/blog', element: <BlogPage /> },
      { path: '/blog/:slug', element: <BlogArticlePage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/cookie', element: <CookiePage /> },
      { path: '/crediti', element: <CreditsPage /> },
      { path: '/admin/login', element: admin(<AdminLogin />) },
      { path: '/admin', element: admin(<AdminDashboard />) },
      { path: '/admin/esperienze', element: admin(<AdminExperiences />) },
      { path: '/admin/esperienze/:id', element: admin(<AdminExperienceForm />) },
      { path: '/admin/articoli', element: admin(<AdminArticles />) },
      { path: '/admin/articoli/:id', element: admin(<AdminArticleForm />) },
      { path: '/admin/lead', element: admin(<AdminLeads />) },
      { path: '/admin/dati', element: admin(<AdminAnalytics />) },
      { path: '/admin/bozze', element: admin(<AdminDrafts />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

/** Provider comuni a browser e pre-generazione. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AdminProvider>{children}</AdminProvider>
    </MotionConfig>
  )
}
