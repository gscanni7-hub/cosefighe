import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { nextCoseFigheEvent } from '../data/events'
import { formatLong } from '../lib/dates'
import { useToday } from '../hooks/useToday'
import { track } from '../lib/track'
import { useLang, useT } from '../i18n/lang'
import { hasEventEn, localizeEvent } from '../i18n/content'

const SESSION_KEY = 'cf_promo_seen'
const DISMISS_KEY = 'cf_promo_dismissed'
const DISMISS_DAYS = 3
const DELAY_MS = 3500
const SCROLL_SHARE = 0.25

const storage = {
  get(kind: 'session' | 'local', key: string): string | null {
    try {
      return (kind === 'session' ? sessionStorage : localStorage).getItem(key)
    } catch {
      return null
    }
  },
  set(kind: 'session' | 'local', key: string, value: string) {
    try {
      ;(kind === 'session' ? sessionStorage : localStorage).setItem(key, value)
    } catch {
      /* memoria del browser non disponibile: l'avviso si mostra lo stesso */
    }
  },
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/**
 * L'avviso del prossimo evento targato Cose Fighe: la scheda blu del programma, in piccolo, con la mascotte.
 * Compare dopo qualche secondo o a un quarto di pagina scorsa, una volta per visita; chi la chiude non la rivede per tre giorni.
 * L'evento è quello segnato "Evento Cose Fighe" nel pannello (source = cosefighe) con la data più vicina.
 */
export function PromoToast() {
  const today = useToday()
  const lang = useLang()
  const t = useT()
  // In inglese solo se l'evento è tradotto.
  const next = nextCoseFigheEvent(today)
  const event = useMemo(() => (next && (lang === 'it' || hasEventEn(next)) ? localizeEvent(next, lang) : undefined), [next, lang])
  const [stage, setStage] = useState<'hidden' | 'notice' | 'card'>('hidden')

  useEffect(() => {
    if (!event) return
    // La notifica arriva una volta per visita, e non se l'hanno chiusa negli ultimi giorni.
    const dismissed = Number(storage.get('local', DISMISS_KEY) || 0)
    if (dismissed && Date.now() - dismissed < DISMISS_DAYS * 86400000) return
    if (storage.get('session', SESSION_KEY) === event.slug) return
    let shown = false
    const show = () => {
      if (shown) return
      shown = true
      storage.set('session', SESSION_KEY, event.slug)
      setStage('notice')
      track('promo_vista', { event: event.slug })
    }
    const timer = window.setTimeout(show, DELAY_MS)
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= SCROLL_SHARE) show()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [event])

  if (!event || stage === 'hidden') return null

  const close = () => {
    setStage('hidden')
    storage.set('local', DISMISS_KEY, String(Date.now()))
    track('promo_chiusa', { event: event.slug })
  }
  const openCard = () => {
    setStage('card')
    track('promo_aperta', { event: event.slug })
  }
  const title = event.title.split(':')[0]
  const place = event.place.split(',')[0]
  const where = title.toLowerCase().includes(place.toLowerCase().replace(/^(il|la|lo|l’|i|gli|le|the)\s+/i, '')) ? '' : ` ${t('a {luogo}', { luogo: place })}`
  const message = t('Ciao! {quando} c’è {titolo}{dove}. Ti teniamo un posto?', { quando: capitalize(formatLong(event.start, lang)), titolo: title, dove: where })

  if (stage === 'notice') {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:justify-end sm:px-6 sm:pb-6">
        <div className="promo-in pointer-events-auto relative w-full max-w-[380px] rounded-2xl border border-white/70 bg-white/85 p-3 pr-10 shadow-[0_18px_40px_-18px_rgba(17,17,17,0.4)] backdrop-blur-xl">
          <button type="button" onClick={close} aria-label={t('Chiudi')} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-ink/45 transition-colors hover:bg-ink/[0.06] hover:text-ink">
            <X size={14} />
          </button>
          <button type="button" onClick={openCard} className="flex w-full items-start gap-3 text-left">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue">
              <img src="/cose-beve.webp" alt="" width={220} height={220} aria-hidden="true" className="promo-wave h-10 w-10 translate-y-0.5 object-contain" />
            </span>
            <span className="min-w-0">
              <span className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">Cose Fighe</span>
                <span className="flex items-center gap-1.5 text-xs text-ink/45">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="promo-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-orange" />
                  </span>
                  {t('adesso')}
                </span>
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-ink/75">{message}</span>
            </span>
          </button>
        </div>
      </div>
    )
  }
  const time = event.time ? event.time.replace(/\s*–.*$/, '').replace(/^(dalle|from)\s+/i, '') : ''
  const day = capitalize(formatLong(event.start, lang))
  const when = time ? t('{giorno}, dalle {ora}', { giorno: day, ora: time }) : day

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:justify-end sm:px-6 sm:pb-6" role="status" aria-live="polite">
      <div className="promo-in pointer-events-auto relative w-full max-w-[400px] overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 pr-[6.5rem] text-ink shadow-[0_24px_60px_-24px_rgba(17,17,17,0.35)] backdrop-blur-xl sm:pr-[7.5rem]">
        <button
          type="button"
          onClick={close}
          aria-label={t('Chiudi')}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.06] text-ink/60 transition-colors hover:bg-ink/10 hover:text-ink"
        >
          <X size={15} />
        </button>
        <span className="label inline-flex items-center rounded-full bg-blue px-2.5 py-1 text-white">{t('Evento Cose Fighe')}</span>
        <p className="label mt-3 text-ink/50">{when}</p>
        <p className="mt-1 font-display text-[1.6rem] uppercase leading-[0.95] tracking-tight">{event.title.split(':')[0]}</p>
        <p className="mt-2 text-sm text-ink/65">
          {event.place.split(',')[0]}
          {event.price ? ` · ${event.price.split(',')[0]}` : ''}
        </p>
        <div className="mt-4 flex items-center gap-3 sm:gap-4">
          {event.url ? (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('promo_prenota', { event: event.slug })}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-orange px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(255,85,0,0.55)] transition-transform hover:-translate-y-0.5"
            >
              {t('Prenota il posto')} <ArrowUpRight size={15} />
            </a>
          ) : null}
          <button type="button" onClick={close} className="whitespace-nowrap text-sm font-medium text-ink/55 hover:text-ink">
            {t('Non ora')}
          </button>
        </div>
        <img src="/cose-beve.webp" alt="" width={220} height={220} aria-hidden="true" className="pointer-events-none absolute -bottom-2 -right-3 w-[6.25rem] select-none sm:w-[7.5rem]" />
      </div>
    </div>
  )
}
