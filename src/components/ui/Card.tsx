import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

/**
 * Card — Componente base
 * Contenedor visual estandarizado.
 */
export default function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-sm border border-border/60 
        overflow-hidden ${noPadding ? '' : 'p-5'} 
        ${className}
      `}
    >
      {children}
    </div>
  )
}
