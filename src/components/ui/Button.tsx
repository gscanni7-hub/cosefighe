import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

export type ButtonVariant = 'primary' | 'dark' | 'white' | 'blue' | 'ghost-light' | 'ghost-dark'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2.5 rounded-full border-2 font-sans font-bold uppercase tracking-wider whitespace-nowrap select-none transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out-quart hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary: 'border-ink bg-orange text-white shadow-hard hover:shadow-[6px_6px_0_0_#111111]',
  dark: 'border-ink bg-ink text-white shadow-[4px_4px_0_0_#ff5500] hover:shadow-[6px_6px_0_0_#ff5500]',
  white: 'border-ink bg-white text-ink shadow-hard hover:shadow-[6px_6px_0_0_#111111]',
  blue: 'border-ink bg-blue text-white shadow-hard hover:shadow-[6px_6px_0_0_#111111]',
  'ghost-light':
    'border-white bg-transparent text-white shadow-[4px_4px_0_0_rgba(255,255,255,0.35)] hover:bg-white/10 hover:shadow-[6px_6px_0_0_rgba(255,255,255,0.35)]',
  'ghost-dark': 'border-ink bg-transparent text-ink shadow-hard hover:bg-ink hover:text-white hover:shadow-[6px_6px_0_0_#111111]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-5 py-2 text-xs',
  md: 'min-h-[48px] px-7 py-3 text-sm',
  lg: 'min-h-[56px] px-9 py-4 text-sm md:text-base',
}

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`
}

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: CommonProps & LinkProps) {
  return (
    <Link viewTransition className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  )
}

export function ButtonAnchor({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </a>
  )
}
