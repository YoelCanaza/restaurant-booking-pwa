import { motion } from 'framer-motion'

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Chip — Componente base
 * Elemento seleccionable con transición de color animada.
 */
export default function Chip({ label, selected = false, onClick, className = '' }: ChipProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      animate={{
        backgroundColor: selected ? 'var(--color-terracotta)' : '#ffffff',
        color: selected ? '#ffffff' : 'var(--color-carbon)',
        borderColor: selected ? 'var(--color-terracotta)' : 'var(--color-border)'
      }}
      initial={false}
      transition={{ duration: 0.2 }}
      style={{
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
      className={`px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-terracotta flex-shrink-0 ${!onClick ? 'cursor-default pointer-events-none' : ''} ${className}`}
    >
      {label}
    </motion.button>
  )
}
