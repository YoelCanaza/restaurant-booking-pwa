import { useAppStore } from '../../store/useAppStore'
import { useToastStore } from '../../store/useToastStore'
import { useCurrentUser } from '../../hooks'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import Chip from '../ui/Chip'
import SwipeToConfirm from '../ui/SwipeToConfirm'
import Button from '../ui/Button'
import { useState } from 'react'

// Helper to get next state in the delivery flow
const nextEstado = (estado: string) => {
  const order = ['nuevo', 'preparando', 'en_camino', 'entregado']
  const idx = order.indexOf(estado)
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : estado
}

export default function OrderCard({ pedido }: { pedido: any }) {
  const updateEstado = useAppStore((s) => s.updatePedidoEstado)
  const addToast = useToastStore((s) => s.addToast)
  const user = useCurrentUser()
  const [expanded, setExpanded] = useState(false)

  const handleConfirm = () => {
    const newEstado = nextEstado(pedido.estado)
    updateEstado(pedido.id, newEstado as any, user?.id ?? '', user?.role ?? 'delivery')
  }

  // Badge color & animation
  const badgeColor =
    pedido.estado === 'en_camino'
      ? 'bg-emerald-500/10 text-emerald-500 animate-pulse'
      : pedido.estado === 'preparando'
      ? 'bg-amber-500/10 text-amber-500'
      : pedido.estado === 'entregado'
      ? 'bg-terracotta/10 text-terracotta'
      : 'bg-blue-500/10 text-blue-500'

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-sm border border-border/40 p-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-bold text-carbon text-sm">
            {pedido.clienteNombre}
          </span>
          <span className="text-xs text-carbon/60">{pedido.direccion}</span>
        </div>
        <Chip label={pedido.estado} className={badgeColor} />
        <button onClick={() => setExpanded(!expanded)} className="p-1">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expandable details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <ul className="list-disc pl-5 space-y-1 mb-4">
              {pedido.items.map((it: any, i: number) => (
                <li key={i} className="text-sm text-carbon/80">
                  {it.cantidad}× {it.nombre} – S/ {it.precio.toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center font-bold text-carbon">
              <span>Total</span>
              <span>S/ {pedido.total.toFixed(2)}</span>
            </div>
            {/* Google Maps Button – only show when en_camino */}
            {pedido.estado === 'en_camino' && (
              <div className="my-4">
                <Button 
                  fullWidth 
                  variant="secondary" 
                  className="flex items-center gap-2 border-blue-500/30 bg-blue-50/50 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors"
                  onClick={() => {
                    // Simular abrir Google Maps con la dirección
                    addToast?.('Abriendo Google Maps...', 'success')
                  }}
                >
                  <MapPin size={18} /> Abrir en Google Maps
                </Button>
              </div>
            )}
            {/* Swipe to confirm next step */}
            {pedido.estado !== 'entregado' && (
              <SwipeToConfirm onConfirm={handleConfirm} label="Desliza para confirmar →" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
