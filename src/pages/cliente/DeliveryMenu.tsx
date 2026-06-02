import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, PhoneCall, CheckCircle2, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MenuGrid, { CATEGORIAS } from '../../components/delivery/MenuGrid'
import CartDrawer from '../../components/delivery/CartDrawer'
import Button from '../../components/ui/Button'
import Chip from '../../components/ui/Chip'
import { useToastStore } from '../../store/useToastStore'
import type { CategoriaPlato } from '../../types'

/**
 * DeliveryMenu
 * Página principal del flujo de delivery.
 * Contiene el catálogo de platos (MenuGrid) y el carrito flotante (CartDrawer).
 */
export default function DeliveryMenu() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaPlato | 'todos'>('todos')
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-full bg-bone px-6 py-12 items-center justify-center relative overflow-hidden pb-24">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 bg-terracotta/10 rounded-full flex items-center justify-center mb-6 shadow-inner"
        >
          <CheckCircle2 size={48} className="text-terracotta" />
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-2xl font-black text-carbon text-center mb-2"
        >
          ¡Pedido en camino!
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-carbon/60 text-center mb-8 font-medium leading-relaxed"
        >
          Hemos recibido tu orden. Nuestros cocineros ya están preparando tus deliciosos platos.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 w-full shadow-sm border border-border/40 mb-8"
        >
          <div className="flex items-center gap-4 mb-5 border-b border-border/40 pb-5">
            <div className="w-12 h-12 bg-carbon/5 rounded-full flex items-center justify-center">
              <Clock size={24} className="text-carbon" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-carbon/50 uppercase tracking-wider mb-0.5">Tiempo Estimado</p>
              <p className="text-xl font-extrabold text-carbon">35 - 45 min</p>
            </div>
          </div>
          
          <Button
            variant="secondary"
            fullWidth
            onClick={() => addToast('Función de contacto disponible próximamente (demo)', 'warning')}
            className="h-12"
          >
            <PhoneCall size={18} />
            Contactar Repartidor
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full mt-auto pt-6"
        >
          <Button fullWidth size="lg" onClick={() => navigate('/cliente')}>
            Volver al Inicio
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-bone pb-20">
      <div className="sticky top-0 z-30 bg-bone/95 backdrop-blur-md px-6 pt-6 pb-4 border-b border-border/40 shadow-sm">
        <button 
          onClick={() => navigate('/cliente')}
          className="flex items-center gap-1 text-terracotta font-bold text-sm mb-4 hover:opacity-80 transition-opacity -ml-1"
        >
          <ChevronLeft size={20} /> Volver a Inicio
        </button>
        
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[1.85rem] font-black text-carbon tracking-tight mb-3"
        >
          Menú Delivery
        </motion.h2>

        {/* ── Chips de Categorías ────────────────────────── */}
        <div className="flex overflow-x-auto gap-2.5 no-scrollbar pb-2 -mx-2 px-2">
          {CATEGORIAS.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              selected={categoriaActiva === cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6">
        <MenuGrid categoriaActiva={categoriaActiva} />
      </div>

      <CartDrawer onSuccess={() => setIsSuccess(true)} />
    </div>
  )
}
