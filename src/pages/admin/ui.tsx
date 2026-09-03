import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { ChevronRight, ExternalLink, FileText, LayoutDashboard, LogOut, Users, Zap } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/esperienze', label: 'Esperienze', icon: Zap },
  { to: '/admin/articoli', label: 'Articoli', icon: FileText },
  { to: '/admin/lead', label: 'Lead', icon: Users },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, ready, logout } = useAdmin()
  const location = useLocation()

  if (!ready) return null
  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      <aside className="w-64 bg-[#111111] text-white flex flex-col flex-shrink-0 fixed inset-y-0 left-0 z-50">
        <div className="px-6 py-6 border-b border-white/10">
          <Link to="/" className="block">
            <div className="font-display text-2xl uppercase text-[#FF5500] leading-none">Cose Fighe</div>
            <div className="font-sans text-xs uppercase tracking-widest text-white/40 mt-1">Admin Panel</div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-bold text-sm uppercase tracking-wider transition-all ${
                  active
                    ? 'bg-[#FF5500] text-white shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon size={16} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 pb-6 space-y-1 border-t border-white/10 pt-4">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-bold uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <ExternalLink size={15} /> Vai al sito
          </Link>
          <button
            onClick={() => void logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-bold uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={15} /> Esci
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display text-4xl uppercase text-black">{title}</h1>
        {subtitle && <p className="font-sans text-black/50 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[1.5rem] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 ${className}`}>
      {children}
    </div>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-[#FF5500] text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5',
    secondary:
      'bg-white text-black border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5',
    danger:
      'bg-red-500 text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5',
    ghost: 'bg-transparent text-black/60 border-transparent hover:text-black',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold uppercase text-xs tracking-wider border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, ...rest }: InputProps) {
  return (
    <div>
      <label className="block font-sans text-xs font-bold uppercase tracking-widest mb-2 text-black/50">{label}</label>
      <input
        {...rest}
        className={`w-full border-2 rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#FF5500] transition-colors ${
          error ? 'border-red-500' : 'border-black'
        } ${rest.className ?? ''}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function Textarea({ label, ...rest }: TextareaProps) {
  return (
    <div>
      <label className="block font-sans text-xs font-bold uppercase tracking-widest mb-2 text-black/50">{label}</label>
      <textarea
        {...rest}
        className={`w-full border-2 border-black rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#FF5500] transition-colors resize-none ${rest.className ?? ''}`}
      />
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  children: ReactNode
}

export function Select({ label, children, ...rest }: SelectProps) {
  return (
    <div>
      <label className="block font-sans text-xs font-bold uppercase tracking-widest mb-2 text-black/50">{label}</label>
      <select
        {...rest}
        className={`w-full border-2 border-black rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#FF5500] transition-colors bg-white ${rest.className ?? ''}`}
      >
        {children}
      </select>
    </div>
  )
}
