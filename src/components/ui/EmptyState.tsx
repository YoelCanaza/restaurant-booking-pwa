import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * EmptyState — estado vacío consistente (sin datos / sin resultados).
 * Icono en círculo con motivo andino sutil + mensaje guía + acción opcional.
 */
export default function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center text-center py-14 px-6 ${className}`}
    >
      <div className="w-20 h-20 rounded-full bg-carbon/[0.04] flex items-center justify-center mb-5 shadow-inner">
        <Icon size={38} strokeWidth={1.5} className="text-carbon/30" />
      </div>
      <h3 className="font-display text-xl font-bold text-carbon mb-1.5">{title}</h3>
      {description && <p className="text-carbon/55 max-w-[280px] leading-relaxed mb-6">{description}</p>}
      {action}
    </motion.div>
  )
}
