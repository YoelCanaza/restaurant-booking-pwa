import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  /** Color de acento (token o hex). Default terracota. */
  accent?: string
  hint?: string
  index?: number
}

/**
 * StatCard — tarjeta de KPI para el dashboard del admin.
 * Valor en tipografía display, icono en chip con tinte del acento.
 */
export default function StatCard({ label, value, icon: Icon, accent = 'var(--color-terracotta)', hint, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="bg-white rounded-2xl border border-border/60 p-5 flex flex-col gap-3 shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-carbon/45">{label}</span>
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}
        >
          <Icon size={18} />
        </span>
      </div>
      <div className="font-display text-3xl font-black text-carbon leading-none">{value}</div>
      {hint && <span className="text-xs text-carbon/45 font-medium">{hint}</span>}
    </motion.div>
  )
}
