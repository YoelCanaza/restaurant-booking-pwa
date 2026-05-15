import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

interface SuccessScreenProps {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  returnPath?: string
}

/**
 * SuccessScreen
 * Pantalla reutilizable para indicar éxito (reserva confirmada, pedido enviado, etc.)
 */
export default function SuccessScreen({ 
  title, 
  message, 
  actionLabel = "Volver al Inicio", 
  onAction,
  returnPath = "/" 
}: SuccessScreenProps) {
  const navigate = useNavigate()

  const handleAction = () => {
    if (onAction) onAction()
    else navigate(returnPath)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-24 h-24 rounded-full bg-success/15 flex items-center justify-center mb-6 text-success shadow-lg shadow-success/20"
      >
        <svg 
          className="w-12 h-12 text-[#4CAF50]" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={3} 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            d="M20 6L9 17l-5-5"
          />
        </svg>
      </motion.div>

      <motion.h2 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-carbon mb-3"
      >
        {title}
      </motion.h2>
      
      <motion.p 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-carbon/60 mb-10 leading-relaxed max-w-[260px]"
      >
        {message}
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        className="w-full"
      >
        <Button fullWidth variant="primary" onClick={handleAction} size="lg">
          {actionLabel}
        </Button>
      </motion.div>
    </div>
  )
}
