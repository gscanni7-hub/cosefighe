import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { BarChart3, ExternalLink, FileText, Inbox, LayoutDashboard, LogOut, Sparkles, Users } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

/*
 * Pannello: interfaccia calma, superfici bianche su fondo carta, bordi sottili,
 * arancio solo per l'azione principale e lo stato attivo. Rubik ovunque.
 */

const groups = [
  { label: 'Panoramica', items: [{ to: '/admin', label: 'Home', icon: LayoutDashboard, exact: true }, { to: '/admin/dati', label: 'Dati', icon: BarChart3 }] },
  {
    label: 'Contenuti',
    items: [
      { to: '/admin/bozze', label: 'Bozze', icon: Inbox },
      { to: '/admin/esperienze', label: 'Esperienze', icon: Sparkles },
      { to: '/admin/articoli', label: 'Articoli', icon: FileText },
    ],
  },
  { label: 'Persone', items: [{ to: '/admin/lead', label: 'Lead', icon: Users }] },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, ready, logout } = useAdmin()
  const location = useLocation()

  if (!ready) return null
  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return (
    <div className="flex min-h-screen bg-paper font-sans text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-white md:flex">
        <Link to="/admin" className="flex items-center gap-3 px-5 pb-4 pt-6">
          <img src="/logo-mark.webp" alt="" width={407} height={329} className="h-8 w-auto" />
          <span className="text-sm font-semibold text-ink/70">Pannello</span>
        </Link>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="label mb-1.5 px-3 text-[11px] text-ink/40">{g.label}</p>
              <ul className="space-y-0.5">
                {g.items.map((item) => {
                  const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                          active ? 'bg-cream font-semibold text-ink' : 'text-ink/70 hover:bg-paper hover:text-ink'
                        }`}
                      >
                        <item.icon size={16} className={active ? 'text-orange' : 'text-ink/45'} />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="space-y-0.5 border-t border-line px-3 py-3">
          <Link to="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink/70 transition-colors hover:bg-paper hover:text-ink">
            <ExternalLink size={16} className="text-ink/45" /> Vai al sito
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink/70 transition-colors hover:bg-paper hover:text-ink"
          >
            <LogOut size={16} className="text-ink/45" /> Esci
          </button>
        </div>
      </aside>

      {/* Barra compatta su telefono */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 overflow-x-auto border-b border-line bg-white/95 px-4 backdrop-blur md:hidden [scrollbar-width:none]">
        {groups.flatMap((g) => g.items).map((item) => {
          const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
          return (
            <Link key={item.to} to={item.to} className={`chip shrink-0 ${active ? 'chip-on' : ''}`}>
              {item.label}
            </Link>
          )
        })}
      </header>

      <main className="min-h-screen flex-1 pt-14 md:ml-60 md:pt-0">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.02em]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink/55">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  const padded = /(^|\s)p-\d/.test(className) ? '' : 'p-6'
  return <div className={`card ${padded} ${className}`}>{children}</div>
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  title?: string
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-orange text-white hover:bg-[#e64d00]',
  secondary: 'border border-line bg-white text-ink hover:bg-paper',
  danger: 'bg-error/10 text-error hover:bg-error/15',
  ghost: 'text-ink/60 hover:bg-paper hover:text-ink',
}

export function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '', title }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

const labelClass = 'mb-1.5 block text-sm font-medium text-ink/70'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', ...rest }: InputProps) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input {...rest} aria-invalid={!!error} className={`field ${className}`} />
      {error && <p className="mt-1 text-xs font-medium text-error">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function Textarea({ label, className = '', ...rest }: TextareaProps) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <textarea {...rest} className={`field resize-none ${className}`} />
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  children: ReactNode
}

export function Select({ label, children, className = '', ...rest }: SelectProps) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select {...rest} className={`field ${className}`}>
        {children}
      </select>
    </div>
  )
}

/** Etichetta di stato. */
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'orange' | 'blue' }) {
  const tones = {
    neutral: 'bg-paper text-ink/70',
    success: 'bg-success/10 text-success',
    warning: 'bg-[#b45309]/10 text-[#b45309]',
    orange: 'bg-orange/10 text-orange',
    blue: 'bg-blue/10 text-blue',
  }
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

/** Interruttore. */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-success' : 'bg-ink/15'}`}
    >
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(17,17,17,0.25)] transition-transform ${checked ? 'left-0.5 translate-x-5' : 'left-0.5'}`} />
    </button>
  )
}

/** Avviso calmo: quando manca il database o un'azione non è disponibile. */
export function Notice({ title, children, tone = 'info' }: { title: string; children?: ReactNode; tone?: 'info' | 'error' }) {
  return (
    <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${tone === 'error' ? 'border-error/30 bg-error/5 text-error' : 'border-blue/20 bg-blue/5 text-ink/80'}`}>
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 text-ink/65">{children}</div>}
    </div>
  )
}

/** Numero grande con etichetta. */
export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink/55">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-[-0.02em] tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
    </div>
  )
}

export function AdminEmpty({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card px-6 py-14 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-md text-sm text-ink/55">{text}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}

export const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink/45 first:pl-6 last:pr-6'
export const td = 'px-4 py-3.5 align-middle text-sm first:pl-6 last:pr-6'
