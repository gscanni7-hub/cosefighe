import { useMemo } from 'react'
import { DATE_PRESETS, addDays, dayParts, presetFor, todayISO } from '../../lib/dates'

export interface DateRangeValue {
  from: string
  to: string
}

interface DateRangeProps {
  value: DateRangeValue
  onChange: (v: DateRangeValue) => void
  /** light: su fondo chiaro. dark: su fondo blu o nero. */
  tone?: 'light' | 'dark'
  /** Solo scorciatoie e campi data, senza la striscia dei giorni (per la home). */
  compact?: boolean
  /** Quanti giorni mostrare nella striscia. */
  horizon?: number
}

const STRIP_DAYS_DEFAULT = 42

/** Selettore di date: scorciatoie, striscia dei giorni cliccabile e campi "dal / al". */
export function DateRange({ value, onChange, tone = 'light', compact = false, horizon = STRIP_DAYS_DEFAULT }: DateRangeProps) {
  const today = todayISO()
  const dark = tone === 'dark'
  const activePreset = presetFor(value.from, value.to)

  const days = useMemo(() => Array.from({ length: horizon }, (_, i) => addDays(today, i)), [today, horizon])

  const chip = (active: boolean) =>
    dark
      ? `chip border-white/40 text-white hover:border-white hover:text-white ${active ? 'border-white bg-white text-blue hover:text-blue' : ''}`
      : `chip ${active ? 'chip-on' : ''}`

  const input = `min-h-[40px] rounded-full border px-3 text-sm font-medium tabular-nums outline-none focus-visible:ring-[3px] focus-visible:ring-orange/60 ${
    dark ? 'border-white/40 bg-white/10 text-white [color-scheme:dark]' : 'border-line bg-white text-ink'
  }`

  const pickDay = (iso: string) => {
    if (value.from === value.to && iso > value.from) onChange({ from: value.from, to: iso })
    else onChange({ from: iso, to: iso })
  }

  const setFrom = (iso: string) => {
    if (!iso) return
    onChange({ from: iso, to: iso > value.to ? iso : value.to })
  }
  const setTo = (iso: string) => {
    if (!iso) return
    onChange({ from: iso < value.from ? iso : value.from, to: iso })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Scorciatoie">
        {DATE_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            aria-pressed={activePreset === p.key}
            className={chip(activePreset === p.key)}
            onClick={() => onChange(p.range())}
          >
            {p.label}
          </button>
        ))}
      </div>

      {!compact && (
        <ol
          aria-label="Giorni"
          className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-2 pt-1 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {days.map((iso, i) => {
            const p = dayParts(iso)
            const prev = i > 0 ? dayParts(days[i - 1]) : null
            const newMonth = i === 0 || (prev && prev.month !== p.month)
            const isFrom = iso === value.from
            const isTo = iso === value.to
            const inside = iso > value.from && iso < value.to
            const endpoint = isFrom || isTo
            const isToday = iso === today
            return (
              <li key={iso} className="flex shrink-0 items-end gap-1.5">
                {newMonth && (
                  <span
                    aria-hidden="true"
                    className={`label mb-3 w-7 shrink-0 self-center text-center ${dark ? 'text-white/60' : 'text-ink/45'} ${i === 0 ? '' : 'ml-1'}`}
                  >
                    {p.mon}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`${p.wdLong} ${p.day} ${p.monLong}`}
                  aria-pressed={endpoint || inside}
                  onClick={() => pickDay(iso)}
                  className={`flex h-[62px] w-[50px] flex-col items-center justify-center rounded-2xl border-2 transition-[background-color,color,border-color,transform] duration-200 ease-out-quart ${
                    endpoint
                      ? 'border-ink bg-orange text-white shadow-hard-sm'
                      : inside
                        ? dark
                          ? 'border-transparent bg-white/25 text-white'
                          : 'border-transparent bg-cream text-ink'
                        : dark
                          ? 'border-transparent text-white hover:bg-white/15'
                          : 'border-transparent text-ink hover:bg-cream'
                  }`}
                >
                  <span className={`text-[11px] font-semibold uppercase ${endpoint ? 'text-white/85' : dark ? 'text-white/65' : 'text-ink/50'}`}>
                    {p.wd}
                  </span>
                  <span className="font-display text-xl leading-none">{p.day}</span>
                  <span
                    className={`mt-1 h-1 w-1 rounded-full ${isToday ? (endpoint ? 'bg-white' : 'bg-orange') : 'bg-transparent'}`}
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}
        </ol>
      )}

      <div className={`flex flex-wrap items-center gap-2 text-sm ${dark ? 'text-white/80' : 'text-ink/60'}`}>
        <label className="inline-flex items-center gap-2">
          dal
          <input type="date" className={input} value={value.from} min={today} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="inline-flex items-center gap-2">
          al
          <input type="date" className={input} value={value.to} min={value.from} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>
    </div>
  )
}
