/**
 * ============================================================
 * RINCÓN ANDINO — Tipos e Interfaces Globales
 * ============================================================
 */

// ─── ROL DE USUARIO ─────────────────────────────────────────
export type UserRole = 'cliente' | 'admin' | 'delivery'

// ─── USUARIO ─────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  role: UserRole
  phone?: string
  avatarInitials?: string
}

// ─── CATEGORÍA DE PLATO ──────────────────────────────────────
export type CategoriaPlato =
  | 'sopas'
  | 'segundos'
  | 'postres'
  | 'bebidas'
  | 'entradas'

// ─── PLATO DEL MENÚ ──────────────────────────────────────────
export interface Plato {
  id: string
  nombre: string
  descripcion: string
  precio: number           // En soles (PEN)
  categoria: CategoriaPlato
  imageUrl: string
  disponible: boolean
  tiempoPreparacion: number // En minutos
  popularidad?: number      // Para ordenar los más apetecibles/vendidos primero
}

// ─── ÍTEM DE CARRITO ─────────────────────────────────────────
export interface CartItem {
  plato: Plato
  cantidad: number
}

// ─── ESTADO DE RESERVA ───────────────────────────────────────
export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada'

// ─── RESERVA DE MESA ─────────────────────────────────────────
export interface Reserva {
  id: string
  userId: string
  fecha: string            // ISO date string 'YYYY-MM-DD'
  hora: string             // 'HH:MM'
  personas: number
  nombre: string
  telefono: string
  estado: EstadoReserva
  mesaId?: string          // Opcional, asignada al reservar
  createdAt: string        // ISO datetime string
}

// ─── ESTADO DE PEDIDO DELIVERY ───────────────────────────────
export type EstadoPedido = 'nuevo' | 'preparando' | 'en_camino' | 'entregado'

// ─── ÍTEM DE PEDIDO ──────────────────────────────────────────
export interface PedidoItem {
  platoId: string
  nombre: string
  precio: number
  cantidad: number
}

// ─── PEDIDO DELIVERY ─────────────────────────────────────────
export interface Pedido {
  id: string
  clienteNombre: string
  clienteTelefono: string
  items: PedidoItem[]
  total: number
  direccion: string
  estado: EstadoPedido
  deliveryId?: string
  createdAt: string        // ISO datetime string
}

// ─── MESA DEL RESTAURANTE ────────────────────────────────────
export type EstadoMesa = 'libre' | 'ocupada' | 'reservada'

export interface Mesa {
  id: string
  numero: number
  capacidad: number
  estado: EstadoMesa
  reservaId?: string       // Referencia si tiene reserva activa
}
