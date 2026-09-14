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

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [ready, setReady] = useState(mode !== 'supabase')

  useEffect(() => {
    if (mode !== 'supabase') return
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
    return error ? 'Email o password non corretti.' : null
  }

  const logout = async () => {
    const supabase = await getSupabase()
    await supabase?.auth.signOut()
    setIsAdmin(false)
  }

  return <AdminContext.Provider value={{ isAdmin, ready, mode, login, logout }}>{children}</AdminContext.Provider>
}

export const useAdmin = () => useContext(AdminContext)
