import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

/** Struttura comune delle pagine pubbliche: barra, contenuto, piè di pagina. */
export function Page({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </div>
  )
}
