import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Slot a la derecha (acciones, KPI, etc.) */
  action?: ReactNode
  /** Emoji o icono opcional antes del título */
  eyebrow?: string
  className?: string
}

/**
 * PageHeader — encabezado de pantalla consistente.
 * Título en tipografía display (Fraunces) para dar carácter andino.
 */
export default function PageHeader({ title, subtitle, action, eyebrow, className = '' }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 ${className}`}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-terracotta mb-1">{eyebrow}</p>
        )}
        <h1 className="font-display text-3xl md:text-4xl font-black text-carbon leading-tight tracking-tight m-0">
          {title}
        </h1>
        {subtitle && <p className="text-carbon/55 mt-1.5 text-sm md:text-base font-medium">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.header>
  )
}
