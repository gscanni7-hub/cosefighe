import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'

/** L'accesso al pannello passa solo da Supabase Auth (email e password dell'amministratore). */
export type AdminMode = 'supabase' | 'none'

interface AdminContextValue {
  isAdmin: boolean
  ready: boolean
  mode: AdminMode
  login: (credentials: { email?: string; password: string }) => Promise<string | null>
  logout: () => Promise<void>
}

const mode: AdminMode = isSupabaseConfigured ? 'supabase' : 'none'

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  ready: true,
  mode: 'none',
  login: async () => 'Accesso non configurato',
  logout: async () => {},
})

/** Vero se in questo browser c'è una sessione di Supabase salvata (cioè qualcuno è entrato nel pannello). */
function hasStoredSession(): boolean {
  try {
    return Object.keys(localStorage).some((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
  } catch {
    return false
  }
}

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [ready, setReady] = useState(mode !== 'supabase')

  useEffect(() => {
    if (mode !== 'supabase') return
    // Chi non è mai entrato nel pannello non scarica la libreria di Supabase: il login la carica quando serve.
    if (!hasStoredSession()) {
      setReady(true)
      return
    }
    let unsubscribe: (() => void) | undefined
    getSupabase().then((supabase) => {
      if (!supabase) return
      supabase.auth.getSession().then(({ data }) => {
        setIsAdmin(!!data.session)
        setReady(true)
      })
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setIsAdmin(!!session))
      unsubscribe = () => sub.subscription.unsubscribe()
    })
    return () => unsubscribe?.()
  }, [])

  const login: AdminContextValue['login'] = async ({ email, password }) => {
    if (mode !== 'supabase') return 'Accesso non configurato: collega Supabase.'
    const supabase = await getSupabase()
    if (!supabase) return 'Supabase non disponibile.'
    const { error } = await supabase.auth.signInWithPassword({ email: email ?? '', password })
    if (error) return 'Email o password non corretti.'
    setIsAdmin(true)
    return null
  }

  const logout = async () => {
    const supabase = await getSupabase()
    await supabase?.auth.signOut()
    setIsAdmin(false)
  }

  return <AdminContext.Provider value={{ isAdmin, ready, mode, login, logout }}>{children}</AdminContext.Provider>
}

export const useAdmin = () => useContext(AdminContext)
