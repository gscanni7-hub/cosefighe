import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, Instagram, Mail, MapPin, Send } from 'lucide-react'
import { Page } from '../components/Page'
import { Band } from '../components/Band'
import { PageHero } from '../components/ui/PageHero'
import { Button, ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { createLead } from '../lib/db'
import { isSupabaseConfigured } from '../lib/supabase'
import { usePageMeta } from '../hooks/usePageMeta'

const topics = ["Voglio prenotare un'esperienza", 'Voglio diventare creator', 'Partnership', 'Altro']

const contacts = [
  { icon: Mail, label: 'Email', value: 'ciao@cosefighe.it', href: 'mailto:ciao@cosefighe.it' },
  { icon: Instagram, label: 'Instagram', value: '@cosefighe', href: 'https://instagram.com/cosefighe' },
  { icon: MapPin, label: 'Sede', value: 'Napoli, Campania' },
]

const inputClass =
  'w-full min-h-[48px] rounded-2xl border-2 border-ink bg-white px-4 py-3 font-sans text-base text-ink placeholder:text-ink/40 transition-colors focus:border-orange focus:outline-none'
const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-widest text-ink/55'

type Status = 'idle' | 'sending' | 'done' | 'error'

export default function ContactPage() {
  usePageMeta({
    title: 'Contatti · Cose Fighe',
    description: 'Scrivici per prenotare un’esperienza, diventare creator o proporre una partnership. Rispondiamo entro 24 ore nei giorni feriali.',
  })

  const [topic, setTopic] = useState('')
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Partial<typeof fields>>({})
  const [status, setStatus] = useState<Status>('idle')

  const set = (k: keyof typeof fields, v: string) => {
    setFields((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = () => {
    const e: Partial<typeof fields> = {}
    if (!fields.name.trim()) e.name = 'Inserisci il tuo nome'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) e.email = 'Controlla l’indirizzo email'
    if (fields.message.trim().length < 10) e.message = 'Scrivi almeno una riga'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (!isSupabaseConfigured) {
      const subject = encodeURIComponent(topic ? `${topic} (${fields.name.trim()})` : `Messaggio da ${fields.name.trim()}`)
      const body = encodeURIComponent(`${fields.message.trim()}\n\n${fields.name.trim()}\n${fields.email.trim()}`)
      window.location.href = `mailto:ciao@cosefighe.it?subject=${subject}&body=${body}`
      setStatus('done')
      return
    }
    setStatus('sending')
    const ok = await createLead({
      name: fields.name.trim(),
      email: fields.email.trim(),
      topic,
      message: fields.message.trim(),
      source: 'contatti',
    })
    setStatus(ok ? 'done' : 'error')
  }

  return (
    <Page>
      <PageHero
        tone="ink"
        kicker="Parliamo"
        title={
          <>
            Scrivici
            <br />
            <span className="text-orange">sul serio</span>
          </>
        }
        subtitle="Domande, idee, partnership o solo voglia di raccontarci la tua Napoli. Rispondiamo entro 24 ore nei giorni feriali."
      />

      <Band text="CONTATTI • NAPOLI • SCRIVICI • COSE FIGHE • " tone="orange" tilt={1} />

      <section className="section-y">
        <div className="container-x grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <Reveal>
            <h2 className="font-display text-display-lg uppercase">
              Siamo pronti <span className="text-orange">ad ascoltarti</span>
            </h2>
            <ul className="mt-10 space-y-6">
              {contacts.map((c) => (
                <li key={c.label} className="flex items-center gap-4">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-ink bg-ink text-white">
                    <c.icon size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-ink/50">{c.label}</p>
                    {c.href ? (
                      <a
                        href={c.href}
                        target={c.href.startsWith('http') ? '_blank' : undefined}
                        rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-lg font-medium underline-offset-4 hover:underline"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-lg font-medium">{c.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-12 rounded-[2rem] border-4 border-ink bg-orange p-8 text-white shadow-hard-lg">
              <p className="font-display text-2xl uppercase">Rispondiamo entro</p>
              <p className="font-display text-7xl leading-none">24h</p>
              <p className="mt-2 text-sm text-white/85">Nei giorni feriali. Il weekend siamo in giro per Napoli.</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {status === 'done' ? (
              <div
                role="status"
                className="flex h-full flex-col items-center justify-center rounded-[2rem] border-4 border-ink bg-blue p-10 text-center text-white shadow-hard-xl md:p-12"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-ink bg-white text-blue shadow-hard-sm">
                  <Check size={28} />
                </span>
                <h3 className="mt-6 font-display text-4xl uppercase">
                  {isSupabaseConfigured ? 'Messaggio inviato' : 'Quasi fatto'}
                </h3>
                <p className="mt-3 max-w-sm text-white/85">
                  {isSupabaseConfigured
                    ? 'Ti rispondiamo entro 24 ore. Nel frattempo esplora le esperienze.'
                    : 'Si apre la tua app di posta con il messaggio già scritto: invialo e ti rispondiamo entro 24 ore.'}
                </p>
                <ButtonLink to="/esperienze" variant="white" className="mt-8">
                  Esplora <ArrowRight size={14} />
                </ButtonLink>
              </div>
            ) : (
              <form
                onSubmit={submit}
                noValidate
                className="space-y-6 rounded-[2rem] border-4 border-ink bg-white p-6 shadow-hard-xl md:p-8"
              >
                <h3 className="font-display text-display-md uppercase">Il tuo messaggio</h3>
                <fieldset>
                  <legend className={labelClass}>Di cosa si tratta?</legend>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopic(t)}
                        aria-pressed={topic === t}
                        className={`min-h-[40px] rounded-full border-2 border-ink px-4 text-sm font-bold transition-colors ${
                          topic === t ? 'bg-orange text-white' : 'bg-white text-ink hover:bg-ink hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="ct-name" className={labelClass}>
                    Nome
                  </label>
                  <input
                    id="ct-name"
                    autoComplete="name"
                    value={fields.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Il tuo nome"
                    aria-invalid={!!errors.name}
                    className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="ct-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="ct-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={fields.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="la-tua@email.it"
                    aria-invalid={!!errors.email}
                    className={`${inputClass} ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="ct-message" className={labelClass}>
                    Messaggio
                  </label>
                  <textarea
                    id="ct-message"
                    rows={5}
                    value={fields.message}
                    onChange={(e) => set('message', e.target.value)}
                    placeholder="Raccontaci tutto..."
                    aria-invalid={!!errors.message}
                    className={`${inputClass} resize-none ${errors.message ? 'border-red-500' : ''}`}
                  />
                  {errors.message && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.message}</p>}
                </div>
                {status === 'error' && (
                  <p role="alert" className="rounded-2xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    Non siamo riusciti a inviare il messaggio. Riprova tra poco oppure scrivici a{' '}
                    <a href="mailto:ciao@cosefighe.it" className="underline">
                      ciao@cosefighe.it
                    </a>
                    .
                  </p>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Invio in corso...' : 'Invia messaggio'} <Send size={16} />
                </Button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </Page>
  )
}
