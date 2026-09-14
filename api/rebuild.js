/**
 * Rigenerazione quotidiana del sito.
 * Vercel chiama questo indirizzo ogni mattina (vedi "crons" in vercel.json) con
 * l'intestazione Authorization: Bearer CRON_SECRET. Se dal pannello la rigenerazione
 * è accesa, avvia una nuova build: così /cosa-fare, /cosa-fare/oggi e /cosa-fare/weekend
 * escono con la data e il programma del giorno.
 *
 * Non scrive né inventa contenuti: ricostruisce il sito con quello che c'è nel database.
 *
 * Variabili d'ambiente su Vercel (Settings → Environment Variables):
 *   DEPLOY_HOOK_URL       l'hook "Rigenerazione quotidiana" del progetto
 *   CRON_SECRET           una stringa casuale, la mette Vercel nell'intestazione
 *   SUPABASE_SERVICE_KEY  per leggere l'interruttore nel pannello (site_settings)
 */
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false, error: 'Non autorizzato' })
  }
  const hook = process.env.DEPLOY_HOOK_URL
  if (!hook) return res.status(500).json({ ok: false, error: 'Manca DEPLOY_HOOK_URL' })

  // Interruttore nel pannello admin (Agenti → Rigenerazione quotidiana). Assente = accesa.
  const url = process.env.VITE_SUPABASE_URL || 'https://uayjzwdbcfyinhzwwdje.supabase.co'
  const key = process.env.SUPABASE_SERVICE_KEY
  let enabled = true
  if (key) {
    try {
      const r = await fetch(`${url}/rest/v1/site_settings?key=eq.rebuild_enabled&select=value`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      })
      if (r.ok) {
        const rows = await r.json()
        enabled = rows[0]?.value !== 'false'
      }
    } catch {
      /* database non raggiungibile: si rigenera comunque, non costa nulla */
    }
  }
  if (!enabled) return res.status(200).json({ ok: true, skipped: 'Rigenerazione in pausa dal pannello' })

  const r = await fetch(hook, { method: 'POST' })
  return res.status(200).json({ ok: r.ok, status: r.status })
}
