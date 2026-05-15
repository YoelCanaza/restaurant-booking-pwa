import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'full'

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "className"> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  className?: string
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-terracotta text-white',
  secondary: 'bg-carbon text-white',
  ghost: 'bg-transparent text-carbon hover:bg-black/5',
  danger: 'bg-error text-white',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
  full: 'h-14 px-6 text-base w-full', // 56px height
}

/**
 * Button — Componente base
 * Implementa las variantes y tamaños requeridos, junto con 
 * el efecto whileTap de framer-motion para reducir la fricción táctil.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={disabled || loading ? {} : { scale: 0.96 }}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center
        font-bold rounded-xl transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <Loader2 className="absolute left-1/2 -translate-x-1/2 w-5 h-5 animate-spin" />
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {children as React.ReactNode}
      </span>
    </motion.button>
  )
}
