import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'ghost-light' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold whitespace-nowrap select-none transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out-quart disabled:pointer-events-none disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-2 border-ink bg-orange text-white shadow-hard-sm hover:-translate-y-0.5 hover:shadow-hard active:translate-x-px active:translate-y-px active:shadow-none',
  secondary: 'border-2 border-ink bg-white text-ink hover:bg-cream',
  dark: 'border-2 border-ink bg-ink text-white hover:bg-ink/85',
  'ghost-light': 'border-2 border-white/80 bg-transparent text-white hover:bg-white/10',
  link: 'rounded-none px-0 text-ink underline decoration-ink/25 underline-offset-[6px] hover:text-orange hover:decoration-orange',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-4 text-sm',
  md: 'min-h-[48px] px-6 text-[15px]',
  lg: 'min-h-[54px] px-7 text-base',
}

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className = '') {
  const sizeClass = variant === 'link' ? 'min-h-0 text-[15px]' : sizes[size]
  return `${base} ${variants[variant]} ${sizeClass} ${className}`
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

export function ButtonLink({ variant = 'primary', size = 'md', className = '', children, ...rest }: CommonProps & LinkProps) {
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
