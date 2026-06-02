/**
 * ============================================================
 * RINCÓN ANDINO — Sistema único de color y etiquetas de estados
 * ============================================================
 * Fuente de verdad para cómo se ve cada estado de Pedido, Mesa y
 * Reserva en toda la app (StatusPill, plano de mesas, KDS, POS,
 * tracker). Evita los diccionarios de color duplicados que había
 * en FloorPlanSVG, WaiterDashboard, KitchenKDS, POSView, etc.
 *
 * `color` = tono sólido (texto/punto/borde). `bg` = tinte claro
 * para fondos de pill. `label` = etiqueta humana en español.
 */
import type { EstadoPedido, EstadoMesa, EstadoReserva } from '../types'

export interface EstadoVisual {
  label: string
  color: string
  bg: string
}

const tint = (hex: string, alpha = 0.12) => {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ─── PALETA BASE DE ESTADOS ──────────────────────────────────
const C = {
  azul: '#3B82F6',
  ambar: '#F59E0B',
  verde: '#10B981',
  esmeralda: '#22C55E',
  rojo: '#EF4444',
  violeta: '#8B5CF6',
  rosa: '#EC4899',
  terracota: '#E05936',
  oro: '#D4A853',
  gris: '#94908A',
} as const

// ─── PEDIDO ──────────────────────────────────────────────────
export const ESTADO_PEDIDO: Record<EstadoPedido, EstadoVisual> = {
  nuevo: { label: 'Nuevo', color: C.azul, bg: tint(C.azul) },
  preparando: { label: 'Preparando', color: C.ambar, bg: tint(C.ambar) },
  listo: { label: 'Listo', color: C.verde, bg: tint(C.verde) },
  en_camino: { label: 'En camino', color: C.terracota, bg: tint(C.terracota) },
  entregado: { label: 'Entregado', color: C.gris, bg: tint(C.gris) },
  servido: { label: 'Servido', color: C.violeta, bg: tint(C.violeta) },
  pagado: { label: 'Pagado', color: C.gris, bg: tint(C.gris) },
  cancelado: { label: 'Cancelado', color: C.rojo, bg: tint(C.rojo) },
}

// ─── MESA ────────────────────────────────────────────────────
export const ESTADO_MESA: Record<EstadoMesa, EstadoVisual> = {
  libre: { label: 'Libre', color: C.esmeralda, bg: tint(C.esmeralda) },
  ocupada: { label: 'Ocupada', color: C.rojo, bg: tint(C.rojo) },
  reservada: { label: 'Reservada', color: C.oro, bg: tint(C.oro) },
  pidiendo: { label: 'Pidiendo', color: C.azul, bg: tint(C.azul) },
  esperando: { label: 'Esperando', color: C.ambar, bg: tint(C.ambar) },
  comiendo: { label: 'Comiendo', color: C.violeta, bg: tint(C.violeta) },
  pagando: { label: 'Pagando', color: C.rosa, bg: tint(C.rosa) },
}

// ─── RESERVA ─────────────────────────────────────────────────
export const ESTADO_RESERVA: Record<EstadoReserva, EstadoVisual> = {
  pendiente: { label: 'Pendiente', color: C.ambar, bg: tint(C.ambar) },
  confirmada: { label: 'Confirmada', color: C.verde, bg: tint(C.verde) },
  cancelada: { label: 'Cancelada', color: C.rojo, bg: tint(C.rojo) },
  no_show: { label: 'No-show', color: C.gris, bg: tint(C.gris) },
}

// ─── HELPERS ─────────────────────────────────────────────────
export const visualPedido = (e: EstadoPedido): EstadoVisual => ESTADO_PEDIDO[e]
export const visualMesa = (e: EstadoMesa): EstadoVisual => ESTADO_MESA[e]
export const visualReserva = (e: EstadoReserva): EstadoVisual => ESTADO_RESERVA[e]
