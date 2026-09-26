import { Search } from 'lucide-react'

/** Apre la ricerca in tutto il sito (la finestra sta nella barra in alto). */
export const openSearch = () => window.dispatchEvent(new Event('cf:cerca'))

/** Finto campo di ricerca: al tocco apre la ricerca vera. Serve dove non c'è la lente (su telefono non c'è ⌘K). */
export function SearchField({ placeholder = 'Cerca un’esperienza, un evento, un posto', className = '' }: { placeholder?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={openSearch}
      className={`flex h-12 w-full max-w-md items-center gap-3 rounded-full border border-line bg-white px-4 text-left text-[15px] text-ink/60 shadow-card transition-colors hover:border-ink/30 ${className}`}
    >
      <Search size={17} className="shrink-0 text-ink/60" />
      <span className="truncate">{placeholder}</span>
    </button>
  )
}
