import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '../../store/useToastStore'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info
          let colors = 'bg-carbon text-white'
          
          if (toast.type === 'success') {
            Icon = CheckCircle2
            colors = 'bg-[#22c55e] text-white shadow-[#22c55e]/20'
          } else if (toast.type === 'error') {
            Icon = AlertCircle
            colors = 'bg-[#ef4444] text-white shadow-[#ef4444]/20'
          } else if (toast.type === 'warning') {
            Icon = AlertCircle
            colors = 'bg-[#D4A853] text-white shadow-[#D4A853]/20'
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto w-auto max-w-xs ${colors}`}
            >
              <Icon size={20} className="flex-shrink-0" />
              <p className="text-sm font-bold flex-1 leading-tight">{toast.message}</p>
              <button 
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity p-1 -mr-1"
                aria-label="Cerrar notificación"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
