export interface SegmentedOption<K extends string> {
  key: K
  label: string
}

interface SegmentedProps<K extends string> {
  options: SegmentedOption<K>[]
  value: K | null
  onChange: (k: K) => void
  /** light: su fondo chiaro. dark: su fondo blu o nero. */
  tone?: 'light' | 'dark'
  label: string
  className?: string
}

/** Selettore a segmenti: una sola pillola, l'opzione scelta è il tassello in rilievo. */
export function Segmented<K extends string>({ options, value, onChange, tone = 'light', label, className = '' }: SegmentedProps<K>) {
  const dark = tone === 'dark'
  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        dark ? 'bg-white/15' : 'bg-ink/[0.06]'
      } ${className}`}
    >
      {options.map((o) => {
        const on = value === o.key
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.key)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium sm:px-3.5 sm:text-sm transition-[background-color,color,box-shadow] duration-200 ease-out-quart ${
              on
                ? dark
                  ? 'bg-white text-blue shadow-[0_1px_3px_rgba(0,0,0,0.18)]'
                  : 'bg-white text-ink shadow-[0_1px_3px_rgba(17,17,17,0.14)]'
                : dark
                  ? 'text-white/85 hover:text-white'
                  : 'text-ink/65 hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
