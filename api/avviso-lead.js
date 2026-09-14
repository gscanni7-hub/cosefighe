/**
 * Avviso via email a ogni nuovo messaggio dal sito (modulo Contatti, lista d'attesa).
 * Il sito salva il messaggio nel database e poi chiama questo indirizzo; qui inoltriamo
 * un'email al proprietario tramite FormSubmit (servizio gratuito di inoltro, senza account):
 * la prima volta FormSubmit manda un'email di conferma al destinatario, che deve cliccare «Activate».
 *
 * Il destinatario sta nel database (site_settings, chiave lead_notify_email), così si cambia
 * dal pannello senza toccare il codice.
 */
const URL_BASE = process.env.VITE_SUPABASE_URL || 'https://uayjzwdbcfyinhzwwdje.supabase.co'

async function recipient() {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) return ''
  try {
    const r = await fetch(`${URL_BASE}/rest/v1/site_settings?key=eq.lead_notify_email&select=value`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    if (!r.ok) return ''
    const rows = await r.json()
    return (rows[0]?.value || '').trim()
  } catch {
    return ''
  }
}

const clean = (v, max) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false })
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const email = clean(body.email, 200)
  const message = String(body.message ?? '').trim().slice(0, 4000)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !message) return res.status(400).json({ ok: false, error: 'Dati mancanti' })

  const to = await recipient()
  if (!to) return res.status(200).json({ ok: false, skipped: 'Nessun destinatario impostato (lead_notify_email)' })

  const name = clean(body.name, 120) || 'Senza nome'
  const topic = clean(body.topic, 120) || 'Messaggio'
  const source = clean(body.source, 60) || 'contatti'
  try {
    const r = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: 'POST',
      // FormSubmit accetta solo richieste che sembrano arrivare da un sito: origine e user agent servono.
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: 'https://www.cosefighenapoli.it',
        Referer: 'https://www.cosefighenapoli.it/contatti',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({
        _subject: `Cose Fighe · ${topic} da ${name}`,
        _template: 'table',
        _replyto: email,
        Nome: name,
        Email: email,
        Argomento: topic,
        Messaggio: message,
        Da: source,
        Pannello: 'https://www.cosefighenapoli.it/admin/lead',
      }),
    })
    const out = await r.json().catch(() => ({}))
    return res.status(200).json({ ok: r.ok, detail: out.message ?? out.success ?? r.status })
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message })
  }
}
