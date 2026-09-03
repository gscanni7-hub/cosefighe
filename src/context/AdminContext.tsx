import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'

export type AdminMode = 'supabase' | 'password' | 'none'

interface AdminContextValue {
  isAdmin: boolean
  ready: boolean
  mode: AdminMode
  login: (credentials: { email?: string; password: string }) => Promise<string | null>
  logout: () => Promise<void>
}

const PASSWORD: string = import.meta.env.VITE_ADMIN_PASSWORD ?? ''
const SESSION_KEY = 'cf_admin_session'

const mode: AdminMode = isSupabaseConfigured ? 'supabase' : PASSWORD.length >= 8 ? 'password' : 'none'

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  ready: true,
  mode: 'none',
  login: async () => 'Accesso non configurato',
  logout: async () => {},
})

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => mode === 'password' && sessionStorage.getItem(SESSION_KEY) === '1')
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
    if (mode === 'supabase') {
      const supabase = await getSupabase()
      if (!supabase) return 'Supabase non disponibile.'
      const { error } = await supabase.auth.signInWithPassword({ email: email ?? '', password })
      return error ? 'Email o password non corretti.' : null
    }
    if (mode === 'password') {
      if (password === PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, '1')
        setIsAdmin(true)
        return null
      }
      return 'Password non corretta.'
    }
    return 'Accesso non configurato: imposta VITE_ADMIN_PASSWORD oppure collega Supabase.'
  }

  const logout = async () => {
    if (mode === 'supabase') {
      const supabase = await getSupabase()
      await supabase?.auth.signOut()
    }
    sessionStorage.removeItem(SESSION_KEY)
    setIsAdmin(false)
  }

  return <AdminContext.Provider value={{ isAdmin, ready, mode, login, logout }}>{children}</AdminContext.Provider>
}

export const useAdmin = () => useContext(AdminContext)
