import { motion } from 'framer-motion'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

/**
 * StepIndicator — Componente base
 * Barra de progreso visual para el flujo de la aplicación.
 */
export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center text-xs font-bold text-carbon/50 uppercase tracking-wider">
        <span>Paso {currentStep} de {totalSteps}</span>
      </div>
      <div className="h-2 w-full bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-terracotta"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  )
}
