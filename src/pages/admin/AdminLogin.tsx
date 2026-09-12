import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

export default function AdminLogin() {
  const { isAdmin, ready, mode, login } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Accesso · Pannello Cose Fighe'
  }, [])

  if (!ready) return null
  if (isAdmin) return <Navigate to="/admin" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const err = await login({ email, password })
    setBusy(false)
    if (err) setError(err)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 font-sans text-ink">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="mb-6 flex justify-center">
          <img src="/logo-mark.webp" alt="Cose Fighe" width={407} height={329} className="h-12 w-auto" />
        </Link>
        <form onSubmit={submit} className="card p-8">
          <h1 className="text-xl font-bold tracking-[-0.02em]">Pannello</h1>
          <p className="mt-1 text-sm text-ink/55">Solo per il team di Cose Fighe.</p>

          {mode === 'none' ? (
            <div className="mt-6 rounded-2xl bg-paper px-4 py-3 text-sm text-ink/70">
              <p className="font-semibold text-ink">Accesso non configurato.</p>
              <p className="mt-1">
                Imposta <code>VITE_ADMIN_PASSWORD</code> (almeno 8 caratteri) oppure collega Supabase e crea un utente in Authentication.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {mode === 'supabase' && (
                <div>
                  <label htmlFor="adm-email" className="mb-1.5 block text-sm font-medium text-ink/70">
                    Email
                  </label>
                  <input id="adm-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required className="field" />
                </div>
              )}
              <div>
                <label htmlFor="adm-password" className="mb-1.5 block text-sm font-medium text-ink/70">
                  Password
                </label>
                <input
                  id="adm-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="field"
                />
              </div>
              {error && (
                <p role="alert" className="rounded-2xl bg-error/5 px-4 py-3 text-sm font-medium text-error">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-orange text-[15px] font-semibold text-white transition-colors hover:bg-[#e64d00] disabled:opacity-60"
              >
                {busy ? 'Un attimo...' : 'Entra'} <ArrowRight size={16} />
              </button>
              {mode === 'password' && <p className="text-center text-xs text-ink/45">Password condivisa. Con Supabase Auth ognuno ha il suo accesso.</p>}
            </div>
          )}
        </form>
      </motion.div>
    </div>
  )
}
