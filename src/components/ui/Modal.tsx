import { type ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

/**
 * Modal — diálogo centrado con backdrop difuminado y animación sutil.
 * Reemplaza los modales inline de POSView/KitchenKDS/WaiterDashboard.
 * Cierra con Escape y con click en el backdrop.
 */
export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-carbon/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white w-full ${sizes[size]} rounded-3xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden`}
          >
            {(title || subtitle) && (
              <div className="flex items-start justify-between gap-4 p-6 border-b border-border/60 shrink-0">
                <div className="min-w-0">
                  {title && <h3 className="font-display text-xl font-bold text-carbon m-0">{title}</h3>}
                  {subtitle && <p className="text-sm text-carbon/50 font-medium mt-0.5">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="w-9 h-9 rounded-full bg-bone flex items-center justify-center text-carbon/60 hover:bg-border/60 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="overflow-y-auto p-6 flex-1">{children}</div>
            {footer && <div className="p-4 border-t border-border/60 shrink-0">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
