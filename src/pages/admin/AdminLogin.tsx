import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight, Lock } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

const inputClass =
  'w-full min-h-[48px] rounded-xl border-2 border-black bg-white px-4 py-3 font-sans text-sm focus:border-[#FF5500] focus:outline-none'

export default function AdminLogin() {
  const { isAdmin, ready, mode, login } = useAdmin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Admin Login — Cose Fighe'
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
    <div className="relative flex min-h-screen items-center justify-center bg-[#111111] px-6 selection:bg-[#FF5500] selection:text-white">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #FF5500 0, #FF5500 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <form
          onSubmit={submit}
          className="rounded-[2rem] border-4 border-black bg-white p-10 shadow-[12px_12px_0px_0px_rgba(255,85,0,1)]"
        >
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-[#FF5500] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Lock size={24} className="text-white" />
            </div>
            <div className="font-display text-3xl uppercase text-[#FF5500]">Cose Fighe</div>
            <div className="mt-1 font-sans text-xs uppercase tracking-widest text-black/40">Area amministrazione</div>
          </div>

          {mode === 'none' ? (
            <div className="rounded-xl border-2 border-black bg-[#f5f5f5] p-4 text-sm text-black/70">
              <p className="font-bold text-black">Accesso non configurato.</p>
              <p className="mt-2">
                Imposta <code>VITE_ADMIN_PASSWORD</code> (almeno 8 caratteri) nel file <code>.env</code>, oppure collega
                Supabase e crea un utente in Authentication.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mode === 'supabase' && (
                <div>
                  <label htmlFor="adm-email" className="mb-2 block text-xs font-bold uppercase tracking-widest text-black/50">
                    Email
                  </label>
                  <input
                    id="adm-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              )}
              <div>
                <label htmlFor="adm-password" className="mb-2 block text-xs font-bold uppercase tracking-widest text-black/50">
                  Password
                </label>
                <input
                  id="adm-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              {error && (
                <p role="alert" className="rounded-xl border-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-black bg-[#FF5500] py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60"
              >
                {busy ? 'Accesso...' : 'Entra nel pannello'} <ArrowRight size={16} />
              </button>
              {mode === 'password' && (
                <p className="text-center text-xs text-black/40">
                  Accesso con password condivisa. Per un accesso per utente collega Supabase Auth.
                </p>
              )}
            </div>
          )}
        </form>
      </motion.div>
    </div>
  )
}
