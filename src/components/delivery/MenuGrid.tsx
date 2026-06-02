import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, Star } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import type { CategoriaPlato, Plato } from '../../types'

export const CATEGORIAS: { id: CategoriaPlato | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'entradas', label: 'Entradas' },
  { id: 'sopas', label: 'Sopas' },
  { id: 'segundos', label: 'Segundos' },
  { id: 'postres', label: 'Postres' },
  { id: 'bebidas', label: 'Bebidas' },
]

const ORDEN: CategoriaPlato[] = ['entradas', 'sopas', 'segundos', 'postres', 'bebidas']
const LABEL: Record<CategoriaPlato, string> = {
  entradas: 'Entradas', sopas: 'Sopas', segundos: 'Segundos', postres: 'Postres', bebidas: 'Bebidas',
}

interface MenuGridProps {
  categoriaActiva: CategoriaPlato | 'todos'
}

/**
 * MenuGrid — carta editorial por secciones (inspirado en menús de
 * restaurante: encabezado de categoría + filas con foto, nombre,
 * descripción, precio a la derecha y botón de añadir).
 */
export default function MenuGrid({ categoriaActiva }: MenuGridProps) {
  const platos = useAppStore((s) => s.platos)
  const addToCart = useAppStore((s) => s.addToCart)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [categoriaActiva])

  const cats = categoriaActiva === 'todos' ? ORDEN : [categoriaActiva]
  const grupos = cats
    .map((cat) => ({
      cat,
      label: LABEL[cat],
      items: platos
        .filter((p) => p.categoria === cat)
        .sort((a, b) => (b.popularidad ?? 0) - (a.popularidad ?? 0)),
    }))
    .filter((g) => g.items.length > 0)

  if (loading) {
    return (
      <div className="flex flex-col gap-4 pt-4 pb-28">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-4">
            <div className="w-20 h-20 rounded-xl bg-surface-muted animate-shimmer shrink-0" />
            <div className="flex-1 flex flex-col gap-2 py-1">
              <div className="h-4 w-2/3 rounded bg-surface-muted animate-shimmer" />
              <div className="h-3 w-full rounded bg-surface-muted animate-shimmer" />
              <div className="h-3 w-1/3 rounded bg-surface-muted animate-shimmer mt-1" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-9 pt-4 pb-28">
      {grupos.map((g) => (
        <section key={g.cat}>
          {/* Encabezado de sección */}
          <div className="flex items-center gap-4 mb-1">
            <h3 className="font-display text-xl font-black text-carbon tracking-tight">{g.label}</h3>
            <span className="text-xs text-carbon/35 font-bold">{g.items.length}</span>
            <div className="flex-1 h-px bg-carbon/10" />
          </div>

          {/* Filas de platos */}
          <div className="divide-y divide-carbon/[0.07]">
            {g.items.map((plato, i) => (
              <DishRow key={plato.id} plato={plato} index={i} onAdd={() => addToCart(plato)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function DishRow({ plato, index, onAdd }: { plato: Plato; index: number; onAdd: () => void }) {
  const popular = (plato.popularidad ?? 0) >= 90
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="flex gap-4 py-4"
    >
      {/* Foto */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 bg-bone shadow-sm">
        <img
          src={plato.imageUrl}
          alt={plato.nombre}
          loading="lazy"
          className={`w-full h-full object-cover ${!plato.disponible ? 'grayscale opacity-50' : ''}`}
        />
        {!plato.disponible && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-carbon/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Agotado</span>
          </span>
        )}
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-display font-bold text-carbon leading-tight">{plato.nombre}</h4>
          <span className="font-bold text-carbon shrink-0 tabular-nums">S/ {plato.precio.toFixed(2)}</span>
        </div>
        <p className="text-sm text-carbon/55 leading-snug mt-1 line-clamp-2">{plato.descripcion}</p>

        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-3 text-xs font-medium text-carbon/45">
            <span className="inline-flex items-center gap-1"><Clock size={12} /> {plato.tiempoPreparacion} min</span>
            {popular && (
              <span className="inline-flex items-center gap-1 text-terracotta font-semibold">
                <Star size={12} className="fill-terracotta" /> Popular
              </span>
            )}
          </div>

          {plato.disponible ? (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onAdd}
              aria-label={`Añadir ${plato.nombre} al carrito`}
              className="w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center shadow-md shadow-terracotta/30 hover:bg-terracotta/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta transition-colors shrink-0"
            >
              <Plus size={20} strokeWidth={3} />
            </motion.button>
          ) : (
            <span className="text-xs font-semibold text-carbon/35">No disponible</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
