import { motion } from 'framer-motion'
import { Plus, Clock } from 'lucide-react'
import type { Plato } from '../../types'

interface DishCardProps {
  plato: Plato
  onAdd: (plato: Plato) => void
}

/**
 * DishCard
 * Tarjeta individual para platos en el catálogo.
 * Imágenes prominentes y botón de añadir optimizado para el pulgar.
 */
export default function DishCard({ plato, onAdd }: DishCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden flex flex-col relative"
    >
      <div className="relative h-[160px] w-full bg-bone">
        <img 
          src={plato.imageUrl} 
          alt={plato.nombre} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <Clock size={12} className="text-carbon/80" />
          <span className="text-[11px] font-bold text-carbon">{plato.tiempoPreparacion} min</span>
        </div>
      </div>
      
      <div className="p-3.5 flex flex-col flex-1 relative">
        <h4 className="font-bold text-carbon text-sm leading-snug mb-1 pr-1">
          {plato.nombre}
        </h4>
        <p className="text-xs text-carbon/60 line-clamp-2 mb-3 leading-snug flex-1 pr-1">
          {plato.descripcion}
        </p>
        <span className="font-extrabold text-terracotta text-lg mt-auto">
          S/ {plato.precio.toFixed(2)}
        </span>

        {plato.disponible && (
          <motion.button
            whileTap={{ scale: 0.7 }}
            onClick={() => onAdd(plato)}
            className="absolute bottom-3 right-3 w-11 h-11 bg-terracotta text-white rounded-full flex items-center justify-center shadow-lg shadow-terracotta/40 z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta"
            aria-label="Añadir al carrito"
          >
            <Plus size={22} strokeWidth={3} />
          </motion.button>
        )}
      </div>
      
      {!plato.disponible && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-20">
          <span className="bg-carbon text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
            Agotado
          </span>
        </div>
      )}
    </motion.div>
  )
}
