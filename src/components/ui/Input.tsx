import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  /** Icono opcional a la izquierda */
  icon?: ReactNode
}

/**
 * Input — campo de texto consistente y accesible.
 * Reemplaza los <input> crudos repartidos por las pantallas.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, className = '', id, ...props },
  ref
) {
  const inputId = id || (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-carbon/60 uppercase tracking-wider pl-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3.5 text-carbon/40 pointer-events-none">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-12 bg-white rounded-xl border-2 px-4 text-carbon font-medium outline-none transition-colors
            placeholder:text-carbon/35
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-error' : 'border-border focus:border-terracotta'}
            ${className}`}
          aria-invalid={!!error}
          {...props}
        />
      </div>
      {error && <span className="text-error text-xs font-semibold pl-1">{error}</span>}
    </div>
  )
})

export default Input
