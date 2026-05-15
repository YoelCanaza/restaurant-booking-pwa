import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'

import DishCard from './DishCard'
import SkeletonCard from '../ui/SkeletonCard'
import type { CategoriaPlato } from '../../types'

export const CATEGORIAS: { id: CategoriaPlato | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'sopas', label: 'Sopas' },
  { id: 'segundos', label: 'Segundos' },
  { id: 'entradas', label: 'Entradas' },
  { id: 'postres', label: 'Postres' },
  { id: 'bebidas', label: 'Bebidas' },
]

interface MenuGridProps {
  categoriaActiva: CategoriaPlato | 'todos'
}

/**
 * MenuGrid
 * Grilla interactiva del menú con filtrado por categorías.
 * Simula tiempos de carga con Skeletons para dar feedback de actividad.
 */
export default function MenuGrid({ categoriaActiva }: MenuGridProps) {
  const platos = useAppStore((s) => s.platos)
  const addToCart = useAppStore((s) => s.addToCart)
  
  const [loading, setLoading] = useState(false)

  // Efecto de carga simulada al cambiar categoría
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 800) // 800ms
    return () => clearTimeout(t)
  }, [categoriaActiva])

  const platosFiltrados = platos
    .filter((p) => categoriaActiva === 'todos' ? true : p.categoria === categoriaActiva)
    .sort((a, b) => {
      // Si estamos en 'todos', ordena por popularidad descendente.
      // Si no tienen popularidad, asume 0.
      if (categoriaActiva === 'todos') {
        const popA = a.popularidad || 0
        const popB = b.popularidad || 0
        return popB - popA
      }
      return 0 // Mantén el orden original si están en una categoría específica
    })

  return (
    <div className="flex flex-col gap-5 pt-4">

      {/* ── Grilla de Platos ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 pb-28 px-1">
        <AnimatePresence mode="popLayout">
          {loading ? (
            // Skeletons de carga
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`skel-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-2 sm:col-span-1"
              >
                <SkeletonCard variant="dish-grid" />
              </motion.div>
            ))
          ) : (
            platosFiltrados.map((plato) => (
              <div key={plato.id} className="col-span-2 sm:col-span-1 flex">
                <DishCard 
                  plato={plato} 
                  onAdd={addToCart} 
                />
              </div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
