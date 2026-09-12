import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router'
import { MotionConfig } from 'motion/react'
import './index.css'
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

const AdminFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] font-sans text-sm text-black/50">
    Caricamento del pannello...
  </div>
)

const RootLayout = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
)

const admin = (el: React.ReactNode) => <Suspense fallback={<AdminFallback />}>{el}</Suspense>

const router = createBrowserRouter([
  {
    element: <RootLayout />,
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
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <AdminProvider>
        <RouterProvider router={router} />
      </AdminProvider>
    </MotionConfig>
  </StrictMode>,
)
