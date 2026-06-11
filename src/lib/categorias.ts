import type { CategoriaPlato } from '../types'

/** Categorías de la carta con etiqueta visible (incluye el filtro "Todos"). */
export const CATEGORIAS: { id: CategoriaPlato | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'entradas', label: 'Entradas' },
  { id: 'sopas', label: 'Sopas' },
  { id: 'segundos', label: 'Segundos' },
  { id: 'postres', label: 'Postres' },
  { id: 'bebidas', label: 'Bebidas' },
]
