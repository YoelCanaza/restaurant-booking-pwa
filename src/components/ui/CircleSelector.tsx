import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'

interface CircleSelectorProps {
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  label?: string
  /** Unidad en singular (ej. "persona") — se muestra bajo el número y se pluraliza. */
  unit?: string
}

/**
 * CircleSelector — Componente base
 * Selector numérico +/- con validación de límites.
 */
export default function CircleSelector({ 
  value, 
  onChange, 
  min = 1,
  max = 10,
  label,
  unit,
}: CircleSelectorProps) {
  const handleDec = () => { if (value > min) onChange(value - 1) }
  const handleInc = () => { if (value < max) onChange(value + 1) }

  return (
    <div className="flex flex-col items-center gap-3">
      {label && <span className="text-sm text-carbon/70 font-semibold uppercase tracking-wider">{label}</span>}
      <div className="flex items-center gap-6">
        <motion.button
          type="button"
          whileTap={value <= min ? {} : { scale: 0.9 }}
          onClick={handleDec}
          disabled={value <= min}
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-carbon bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          aria-label="Disminuir"
        >
          <Minus size={22} strokeWidth={2.5} />
        </motion.button>
        
        <div className="min-w-20 text-center">
          <motion.span
            key={value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display text-5xl font-black text-carbon block leading-none"
          >
            {value}
          </motion.span>
          {unit && (
            <span className="block text-xs font-semibold uppercase tracking-wider text-carbon/45 mt-1.5">
              {value === 1 ? unit : `${unit}s`}
            </span>
          )}
        </div>
        
        <motion.button
          type="button"
          whileTap={value >= max ? {} : { scale: 0.9 }}
          onClick={handleInc}
          disabled={value >= max}
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-carbon bg-white disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          aria-label="Aumentar"
        >
          <Plus size={22} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  )
}
