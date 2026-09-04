import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, Instagram, Send } from 'lucide-react'
import { Page } from '../components/Page'
import { FloatingImage } from '../components/Decorations'
import { PageHero } from '../components/ui/PageHero'
import { Button, ButtonAnchor } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { createLead } from '../lib/db'
import { isSupabaseConfigured } from '../lib/supabase'
import { usePageMeta } from '../hooks/usePageMeta'

const specialties = [
  'Food & Street Food',
  'Natura & Trekking',
  'Arte & Cultura',
  'Musica & Nightlife',
  'Moda & Vintage',
  'Sport & Avventura',
  'Altro',
]

const perks = [
  'Proponi le esperienze che vuoi tu, con i tuoi tempi',
  'Guadagni a ogni prenotazione, pagamenti puntuali',
  'Raggiungi viaggiatori curiosi che cercano Napoli vera',
  'Ti aiutiamo con foto, testi e profilo',
]

const inputClass =
  'w-full min-h-[48px] rounded-2xl border border-ink/15 bg-white px-4 py-3 font-sans text-[15px] text-ink placeholder:text-ink/40 transition-colors focus:border-ink focus:outline-none'
const labelClass = 'mb-2 block text-sm font-medium text-ink/70'

type Status = 'idle' | 'sending' | 'done' | 'error'

function CreatorForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [specialty, setSpecialty] = useState('')
  const [fields, setFields] = useState({ name: '', surname: '', email: '', social: '', about: '' })
  const [errors, setErrors] = useState<Partial<typeof fields>>({})

  const set = (k: keyof typeof fields, v: string) => {
    setFields((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = () => {
    const e: Partial<typeof fields> = {}
    if (!fields.name.trim()) e.name = 'Inserisci il tuo nome'
    if (!fields.surname.trim()) e.surname = 'Inserisci il tuo cognome'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) e.email = 'Controlla l’indirizzo email'
    if (fields.about.trim().length < 20) e.about = 'Raccontaci qualcosa in più (almeno 20 caratteri)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const message = () =>
    [
      `Specialità: ${specialty || 'non indicata'}`,
      `Instagram / social: ${fields.social || 'non indicato'}`,
      '',
      fields.about,
    ].join('\n')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const name = `${fields.name.trim()} ${fields.surname.trim()}`
    if (!isSupabaseConfigured) {
      const subject = encodeURIComponent(`Candidatura creator: ${name}`)
      const body = encodeURIComponent(`${message()}\n\nEmail: ${fields.email.trim()}`)
      window.location.href = `mailto:ciao@cosefighe.it?subject=${subject}&body=${body}`
      setStatus('done')
      return
    }
    setStatus('sending')
    const ok = await createLead({
      name,
      email: fields.email.trim(),
      topic: 'Candidatura creator',
      message: message(),
      source: 'creator',
    })
    setStatus(ok ? 'done' : 'error')
  }

  if (status === 'done') {
    return (
      <div
        role="status"
        className="rounded-3xl border border-ink/10 bg-paper p-10 text-center md:p-12"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange text-white">
          <Check size={28} />
        </span>
        <h3 className="mt-6 heading-md">
          {isSupabaseConfigured ? 'Candidatura inviata' : 'Quasi fatto'}
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-ink/65">
          {isSupabaseConfigured
            ? 'Ti ricontattiamo entro 48 ore. Tieniti pronto a raccontarci la tua Napoli.'
            : 'Si apre la tua app di posta con la candidatura già scritta: inviala e ti rispondiamo entro 48 ore.'}
        </p>
        <Button variant="secondary" className="mt-8" onClick={() => setStatus('idle')}>
          Invia un’altra candidatura
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="overflow-hidden rounded-3xl border border-ink/10 bg-white"
    >
      <div className="border-b border-ink/10 bg-paper px-6 py-6 md:px-8">
        <p className="label text-orange">Candidatura creator</p>
        <h3 className="mt-2 heading-md">Raccontaci la tua Napoli</h3>
      </div>

      <div className="space-y-6 p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cr-name" className={labelClass}>
              Nome
            </label>
            <input
              id="cr-name"
              autoComplete="given-name"
              value={fields.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Il tuo nome"
              aria-invalid={!!errors.name}
              className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="cr-surname" className={labelClass}>
              Cognome
            </label>
            <input
              id="cr-surname"
              autoComplete="family-name"
              value={fields.surname}
              onChange={(e) => set('surname', e.target.value)}
              placeholder="Il tuo cognome"
              aria-invalid={!!errors.surname}
              className={`${inputClass} ${errors.surname ? 'border-red-500' : ''}`}
            />
            {errors.surname && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.surname}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cr-email" className={labelClass}>
              Email
            </label>
            <input
              id="cr-email"
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
            <label htmlFor="cr-social" className={labelClass}>
              <Instagram size={12} className="mr-1 inline" />
              Instagram o social
            </label>
            <input
              id="cr-social"
              value={fields.social}
              onChange={(e) => set('social', e.target.value)}
              placeholder="@tuohandle"
              className={inputClass}
            />
          </div>
        </div>

        <fieldset>
          <legend className={labelClass}>La tua specialità</legend>
          <div className="flex flex-wrap gap-2">
            {specialties.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpecialty(s)}
                aria-pressed={specialty === s}
                className={`min-h-[38px] rounded-full border px-4 text-sm font-medium transition-colors ${
                  specialty === s ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white text-ink/75 hover:border-ink hover:text-ink'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="cr-about" className={labelClass}>
            Raccontaci di te e della tua Napoli
          </label>
          <textarea
            id="cr-about"
            rows={4}
            value={fields.about}
            onChange={(e) => set('about', e.target.value)}
            placeholder="Cosa ami di Napoli? Cosa vorresti far vivere alle persone? Hai già esperienze da proporre?"
            aria-invalid={!!errors.about}
            className={`${inputClass} resize-none ${errors.about ? 'border-red-500' : ''}`}
          />
          {errors.about && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.about}</p>}
        </div>

        {status === 'error' && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Non siamo riusciti a inviare la candidatura. Riprova tra poco oppure scrivici a{' '}
            <a href="mailto:ciao@cosefighe.it" className="underline">
              ciao@cosefighe.it
            </a>
            .
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
          {status === 'sending' ? 'Invio in corso...' : 'Invia la candidatura'} <Send size={16} />
        </Button>
      </div>
    </form>
  )
}

export default function CreatorPage() {
  usePageMeta({
    title: 'Diventa creator · Cose Fighe',
    description:
      'Conosci Napoli meglio di una guida? Proponi la tua esperienza su Cose Fighe: decidi tu prezzo e date, guadagni a ogni prenotazione.',
  })

  return (
    <Page>
      <PageHero
        eyebrow="Le persone dietro le esperienze"
        title={
          <>
            Diventa <span className="text-orange">creator</span>
          </>
        }
        subtitle="Se hai una passione e vuoi condividerla con chi visita Napoli, vogliamo conoscerti. Niente burocrazia, solo autenticità."
        aside={
          <div className="relative mx-auto w-[180px] md:ml-auto md:w-[260px]" aria-hidden="true">
            <FloatingImage src="/mascotte-1.webp" amplitude={10} />
          </div>
        }
      />


      <section className="section-y">
        <div className="container-x grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <Reveal className="md:sticky md:top-32 md:self-start">
            <h2 className="heading-lg">Sei un creator?</h2>
            <p className="mt-4 max-w-md text-ink/60">
              Guide, cuochi, artigiani, artisti, sportivi. Chiunque abbia qualcosa di vero da far vivere.
            </p>
            <ul className="mt-8 space-y-4">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[15px]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange text-white">
                    <Check size={13} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-ink/55">
              Domande prima di candidarti?{' '}
              <ButtonAnchor href="mailto:ciao@cosefighe.it" variant="link" className="ml-1">
                Scrivici <ArrowRight size={14} />
              </ButtonAnchor>
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <CreatorForm />
          </Reveal>
        </div>
      </section>
    </Page>
  )
}
