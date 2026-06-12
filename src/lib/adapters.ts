/**
 * ============================================================
 * Adaptadores fila Postgres (snake_case) ↔ dominio (camelCase)
 * ============================================================
 * Mapeos puros, sin dependencias de stores. Las filas vienen de
 * las tablas creadas en supabase/schema.sql.
 */
import type {
  User,
  Plato,
  Mesa,
  Reserva,
  Pedido,
  PedidoItem,
  ActivityLog,
  UserRole,
  CategoriaPlato,
  EstadoMesa,
  EstadoReserva,
  EstadoPedido,
  TipoPedido,
  MetodoPago,
  TipoEvento,
} from '../types'

// ─── Tipos de fila (lo que devuelve PostgREST) ───────────────
export interface UsuarioRow {
  id: string
  name: string
  role: UserRole
  phone: string
  email: string | null
  avatar_initials: string | null
  activo: boolean
  creado_por_admin_id: string | null
  password: string | null
  debe_cambiar_password: boolean | null
  created_at: string
}

export interface PlatoRow {
  id: string
  nombre: string
  descripcion: string
  precio: number
  categoria: CategoriaPlato
  image_url: string
  disponible: boolean
  tiempo_preparacion: number
  popularidad: number | null
}

export interface MesaRow {
  id: string
  numero: number
  capacidad: number
  estado: EstadoMesa
  piso: number
  reserva_id: string | null
  pedido_id: string | null
}

export interface ReservaRow {
  id: string
  user_id: string
  fecha: string
  hora: string
  personas: number
  nombre: string
  telefono: string
  estado: EstadoReserva
  mesa_id: string | null
  cancelado_at: string | null
  motivo_cancelacion: string | null
  created_at: string
}

export interface PedidoItemRow {
  pedido_id?: string
  plato_id: string
  nombre: string
  precio: number
  cantidad: number
  notas: string | null
}

export interface PedidoRow {
  id: string
  tipo: TipoPedido
  mesa_id: string | null
  mesero_id: string | null
  cliente_id: string | null
  direccion: string | null
  delivery_id: string | null
  metodo_pago: MetodoPago | null
  cliente_nombre: string
  cliente_telefono: string
  total: number
  estado: EstadoPedido
  notas: string | null
  created_at: string
  updated_at: string
  pedido_items?: PedidoItemRow[]
}

export interface ActivityLogRow {
  id: string
  tipo: TipoEvento
  actor_id: string
  actor_role: UserRole
  entidad_id: string | null
  datos: Record<string, unknown> | null
  timestamp: string
}

// ─── Fila → dominio ──────────────────────────────────────────
export const rowToUser = (r: UsuarioRow): User => ({
  id: r.id,
  name: r.name,
  role: r.role,
  phone: r.phone,
  email: r.email ?? undefined,
  avatarInitials: r.avatar_initials ?? undefined,
  activo: r.activo,
  createdAt: r.created_at,
  creadoPorAdminId: r.creado_por_admin_id ?? undefined,
  password: r.password ?? undefined,
  debeCambiarPassword: r.debe_cambiar_password ?? undefined,
})

export const rowToPlato = (r: PlatoRow): Plato => ({
  id: r.id,
  nombre: r.nombre,
  descripcion: r.descripcion,
  precio: Number(r.precio),
  categoria: r.categoria,
  imageUrl: r.image_url,
  disponible: r.disponible,
  tiempoPreparacion: r.tiempo_preparacion,
  popularidad: r.popularidad ?? undefined,
})

export const rowToMesa = (r: MesaRow): Mesa => ({
  id: r.id,
  numero: r.numero,
  capacidad: r.capacidad,
  estado: r.estado,
  piso: r.piso,
  reservaId: r.reserva_id ?? undefined,
  pedidoId: r.pedido_id ?? undefined,
})

export const rowToReserva = (r: ReservaRow): Reserva => ({
  id: r.id,
  userId: r.user_id,
  fecha: r.fecha,
  hora: r.hora,
  personas: r.personas,
  nombre: r.nombre,
  telefono: r.telefono,
  estado: r.estado,
  mesaId: r.mesa_id ?? undefined,
  createdAt: r.created_at,
  canceladoAt: r.cancelado_at ?? undefined,
  motivoCancelacion: r.motivo_cancelacion ?? undefined,
})

export const rowToPedidoItem = (r: PedidoItemRow): PedidoItem => ({
  platoId: r.plato_id,
  nombre: r.nombre,
  precio: Number(r.precio),
  cantidad: r.cantidad,
  notas: r.notas ?? undefined,
})

export const rowToPedido = (r: PedidoRow): Pedido => ({
  id: r.id,
  tipo: r.tipo,
  mesaId: r.mesa_id ?? undefined,
  meseroId: r.mesero_id ?? undefined,
  clienteId: r.cliente_id ?? undefined,
  direccion: r.direccion ?? undefined,
  deliveryId: r.delivery_id ?? undefined,
  metodoPago: r.metodo_pago ?? undefined,
  clienteNombre: r.cliente_nombre,
  clienteTelefono: r.cliente_telefono,
  items: (r.pedido_items ?? []).map(rowToPedidoItem),
  total: Number(r.total),
  estado: r.estado,
  notas: r.notas ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

export const rowToLog = (r: ActivityLogRow): ActivityLog => ({
  id: r.id,
  tipo: r.tipo,
  actorId: r.actor_id,
  actorRole: r.actor_role,
  entidadId: r.entidad_id ?? undefined,
  datos: r.datos ?? undefined,
  timestamp: r.timestamp,
  persistido: true,
})

// ─── Dominio → fila (para INSERT/UPDATE) ─────────────────────
export const userToRow = (u: User): UsuarioRow => ({
  id: u.id,
  name: u.name,
  role: u.role,
  phone: u.phone,
  email: u.email ?? null,
  avatar_initials: u.avatarInitials ?? null,
  activo: u.activo,
  creado_por_admin_id: u.creadoPorAdminId ?? null,
  password: u.password ?? null,
  debe_cambiar_password: u.debeCambiarPassword ?? false,
  created_at: u.createdAt,
})

export const platoToRow = (p: Plato): PlatoRow => ({
  id: p.id,
  nombre: p.nombre,
  descripcion: p.descripcion,
  precio: p.precio,
  categoria: p.categoria,
  image_url: p.imageUrl,
  disponible: p.disponible,
  tiempo_preparacion: p.tiempoPreparacion,
  popularidad: p.popularidad ?? null,
})

export const reservaToRow = (r: Reserva): ReservaRow => ({
  id: r.id,
  user_id: r.userId,
  fecha: r.fecha,
  hora: r.hora,
  personas: r.personas,
  nombre: r.nombre,
  telefono: r.telefono,
  estado: r.estado,
  mesa_id: r.mesaId ?? null,
  cancelado_at: r.canceladoAt ?? null,
  motivo_cancelacion: r.motivoCancelacion ?? null,
  created_at: r.createdAt,
})

/** Pedido → fila (sin items; los items van a pedido_items aparte). */
export const pedidoToRow = (p: Pedido): Omit<PedidoRow, 'pedido_items'> => ({
  id: p.id,
  tipo: p.tipo,
  mesa_id: p.mesaId ?? null,
  mesero_id: p.meseroId ?? null,
  cliente_id: p.clienteId ?? null,
  direccion: p.direccion ?? null,
  delivery_id: p.deliveryId ?? null,
  metodo_pago: p.metodoPago ?? null,
  cliente_nombre: p.clienteNombre,
  cliente_telefono: p.clienteTelefono,
  total: p.total,
  estado: p.estado,
  notas: p.notas ?? null,
  created_at: p.createdAt,
  updated_at: p.updatedAt ?? p.createdAt,
})

export const pedidoItemToRow = (pedidoId: string, it: PedidoItem): PedidoItemRow => ({
  pedido_id: pedidoId,
  plato_id: it.platoId,
  nombre: it.nombre,
  precio: it.precio,
  cantidad: it.cantidad,
  notas: it.notas ?? null,
})

export const logToRow = (l: ActivityLog): ActivityLogRow => ({
  id: l.id,
  tipo: l.tipo,
  actor_id: l.actorId,
  actor_role: l.actorRole,
  entidad_id: l.entidadId ?? null,
  datos: l.datos ?? null,
  timestamp: l.timestamp,
})
