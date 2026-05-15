import { motion } from 'framer-motion'
import { Bike, CheckCircle2, Clock, ChefHat, Check } from 'lucide-react'

export type OrderTrackerState = 'nuevo' | 'preparando' | 'en_camino' | 'entregado'

interface OrderTrackerProps {
  estado: OrderTrackerState
  eta?: string
}

const STAGES = [
  { id: 'nuevo', label: 'Recibido', icon: Clock },
  { id: 'preparando', label: 'Preparando', icon: ChefHat },
  { id: 'en_camino', label: 'En Camino', icon: Bike },
  { id: 'entregado', label: 'Entregado', icon: CheckCircle2 }
]

export default function OrderTracker({ estado, eta = '19:30 - 19:45' }: OrderTrackerProps) {
  const currentIndex = STAGES.findIndex(s => s.id === estado)
  const safeIndex = currentIndex >= 0 ? currentIndex : 0
  const progressPercent = (safeIndex / (STAGES.length - 1)) * 100

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-border/40">
      {/* ETA Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-xs font-bold text-carbon/50 uppercase tracking-wider">
            Llegada Estimada
          </p>
          <p className="text-2xl font-extrabold text-carbon">{eta}</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-terracotta/10 flex items-center justify-center">
          <Clock className="text-terracotta" size={24} />
        </div>
      </div>

      {/* Progress Bar & Nodes */}
      <div className="relative pt-4 pb-6">
        {/* Background Line */}
        <div className="absolute top-8 left-0 right-0 h-1.5 bg-bone rounded-full" />
        
        {/* Active Line */}
        <motion.div 
          className="absolute top-8 left-0 h-1.5 bg-terracotta rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        />

        {/* Nodes */}
        <div className="relative flex justify-between">
          {STAGES.map((stage, index) => {
            const isCompleted = index < safeIndex
            const isActive = index === safeIndex
            const Icon = stage.icon

            return (
              <div key={stage.id} className="flex flex-col items-center gap-2 relative z-10 w-1/4">
                {/* Node circle */}
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted ? '#D4A853' : isActive ? '#de6a4c' : '#ffffff',
                    borderColor: isCompleted || isActive ? 'transparent' : '#e5e7eb',
                    scale: isActive ? 1.2 : 1
                  }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm
                    ${isCompleted ? 'text-white' : isActive ? 'text-white' : 'text-carbon/30'}`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : <Icon size={14} strokeWidth={2.5} />}
                </motion.div>
                
                {/* Label */}
                <span className={`text-[10px] font-bold text-center tracking-wide
                  ${isActive ? 'text-terracotta' : isCompleted ? 'text-carbon' : 'text-carbon/40'}`}
                >
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Moving Vehicle Icon */}
        <motion.div
          className="absolute top-2 -ml-4" // -ml-4 centers the 8-width div
          initial={false}
          animate={{ left: `${progressPercent}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        >
          <div className="w-8 h-8 bg-white rounded-full shadow-md border border-border/40 flex items-center justify-center text-terracotta">
            <Bike size={16} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
