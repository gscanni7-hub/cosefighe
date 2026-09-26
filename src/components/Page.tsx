import { useEffect, type ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { PromoToast } from './PromoToast'
import { useLang } from '../i18n/lang'

/** Struttura comune delle pagine pubbliche: barra, contenuto, piè di pagina. */
export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  const lang = useLang()
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
      <PromoToast />
    </div>
  )
}
