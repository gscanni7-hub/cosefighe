import { useId, useState, type FormEvent } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from './Button'
import { createLead } from '../../lib/db'
import { isSupabaseConfigured } from '../../lib/supabase'

interface WaitlistFormProps {
  source?: string
  tone?: 'light' | 'dark'
  className?: string
}

type Status = 'idle' | 'sending' | 'done' | 'invalid' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Campo email per la lista d'attesa. Salva in Supabase; senza database prepara una mail pronta da inviare. */
export function WaitlistForm({ source = 'waitlist', tone = 'light', className = '' }: WaitlistFormProps) {
  const id = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const dark = tone === 'dark'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const value = email.trim()
    if (!EMAIL_RE.test(value)) {
      setStatus('invalid')
      return
    }
    if (!isSupabaseConfigured) {
      const subject = encodeURIComponent("Lista d'attesa Cose Fighe")
      const body = encodeURIComponent(`Avvisatemi quando aprono le prenotazioni.\nEmail: ${value}`)
      window.location.href = `mailto:ciao@cosefighe.it?subject=${subject}&body=${body}`
      setStatus('done')
      return
    }
    setStatus('sending')
    const ok = await createLead({ name: '', email: value, topic: "Lista d'attesa", message: `Iscrizione dalla sezione: ${source}`, source })
    setStatus(ok ? 'done' : 'error')
  }

  if (status === 'done') {
    return (
      <div
        role="status"
        className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium ${dark ? 'bg-white/10 text-white' : 'bg-cream text-ink'} ${className}`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange text-white">
          <Check size={16} />
        </span>
        {isSupabaseConfigured
          ? 'Sei in lista. Ti scriviamo appena aprono le prenotazioni.'
          : 'Si apre la tua app di posta con il messaggio pronto: inviala e sei in lista.'}
      </div>
    )
  }

  const invalid = status === 'invalid'
  return (
    <form onSubmit={submit} noValidate className={className}>
      <label htmlFor={id} className="sr-only">
        La tua email
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (invalid) setStatus('idle')
          }}
          placeholder="la-tua@email.it"
          aria-invalid={invalid}
          aria-describedby={invalid || status === 'error' ? `${id}-msg` : undefined}
          className={`min-h-[48px] flex-1 rounded-full border bg-white px-5 text-[15px] text-ink placeholder:text-ink/40 transition-colors focus:border-ink focus:outline-none ${
            invalid ? 'border-error' : 'border-line'
          }`}
        />
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Un attimo...' : 'Avvisami'} <ArrowRight size={16} />
        </Button>
      </div>
      {invalid && (
        <p id={`${id}-msg`} className={`mt-2 text-sm ${dark ? 'text-white/80' : 'text-error'}`}>
          Controlla l'indirizzo email: sembra incompleto.
        </p>
      )}
      {status === 'error' && (
        <p id={`${id}-msg`} className={`mt-2 text-sm ${dark ? 'text-white/80' : 'text-error'}`}>
          Non siamo riusciti a salvare l'iscrizione. Scrivici a{' '}
          <a href="mailto:ciao@cosefighe.it" className="underline">
            ciao@cosefighe.it
          </a>
          .
        </p>
      )}
    </form>
  )
}
