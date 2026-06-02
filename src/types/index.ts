/**
 * ============================================================
 * RINCÓN ANDINO — Tipos e Interfaces Globales
 * ============================================================
 */

// ─── ROL DE USUARIO ─────────────────────────────────────────
export type UserRole = 'cliente' | 'admin' | 'delivery' | 'mesero' | 'cocina' | 'caja'

// ─── USUARIO ─────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  role: UserRole
  phone: string             // Identificador principal de login
  email?: string
  avatarInitials?: string
  activo: boolean           // El admin puede desactivar cuentas de empleados
  createdAt: string         // ISO datetime string
  creadoPorAdminId?: string // null/undefined = cliente auto-registrado; string = empleado creado por admin
}

// ─── MÉTODO DE PAGO ──────────────────────────────────────────
export type MetodoPago = 'efectivo' | 'tarjeta' | 'yape' | 'plin'

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
  notas?: string            // Nota especial para ese ítem (ej. "sin picante")
}

// ─── ESTADO DE RESERVA ───────────────────────────────────────
export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'no_show'

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
  mesaId?: string          // Asignada al confirmar
  createdAt: string        // ISO datetime string
  canceladoAt?: string     // ISO datetime (si fue cancelada)
  motivoCancelacion?: string
}

// ─── TIPO DE PEDIDO ──────────────────────────────────────────
/**
 * 'salon'    → Pedido tomado por un mesero para una mesa física.
 *             El cliente no lo genera directamente.
 * 'delivery' → Pedido hecho por el cliente desde la app, para entrega a domicilio.
 */
export type TipoPedido = 'salon' | 'delivery'

// ─── ESTADO DE PEDIDO ────────────────────────────────────────
/**
 * Máquina de estados compartida para ambos tipos de pedido.
 *
 * Flujo Delivery:
 *   nuevo → preparando → listo → en_camino → entregado
 *   cualquiera → cancelado (solo si está en 'nuevo', o con aprobación del admin)
 *
 * Flujo Salón:
 *   nuevo → preparando → listo → servido → pagado
 *   cualquiera → cancelado (solo mesero/admin)
 */
export type EstadoPedido =
  | 'nuevo'       // Recibido, en espera de ser tomado por cocina
  | 'preparando'  // Cocina lo tomó, está en preparación
  | 'listo'       // Listo para servir (salón) o despachar (delivery)
  | 'en_camino'   // Solo delivery: el repartidor salió con el pedido
  | 'entregado'   // Solo delivery: entrega confirmada por el repartidor
  | 'servido'     // Solo salón: el mesero lo llevó a la mesa
  | 'pagado'      // Solo salón: el cajero procesó el pago, mesa liberada
  | 'cancelado'   // Cancelado (por cliente, mesero o admin)

// ─── ÍTEM DE PEDIDO ──────────────────────────────────────────
export interface PedidoItem {
  platoId: string
  nombre: string
  precio: number
  cantidad: number
  notas?: string           // Modificadores: "sin cebolla", "término medio", etc.
}

// ─── PEDIDO (Salón y Delivery) ────────────────────────────────
export interface Pedido {
  id: string
  tipo: TipoPedido

  // ── Campos de Salón (solo cuando tipo === 'salon') ───────
  mesaId?: string          // Mesa física asociada
  meseroId?: string        // Mesero que tomó el pedido

  // ── Campos de Delivery (solo cuando tipo === 'delivery') ─
  clienteId?: string       // userId del cliente que hizo el pedido
  direccion?: string       // Dirección de entrega
  deliveryId?: string      // userId del repartidor asignado
  metodoPago?: MetodoPago  // Declarado por el cliente al pedir

  // ── Campos Comunes ────────────────────────────────────────
  clienteNombre: string    // Nombre para mostrar (de la cuenta o ingresado por mesero)
  clienteTelefono: string
  items: PedidoItem[]
  total: number
  estado: EstadoPedido
  notas?: string           // Nota general del pedido

  createdAt: string        // ISO datetime string
  updatedAt?: string       // ISO datetime — última vez que cambió de estado
}

// ─── MESA DEL RESTAURANTE ────────────────────────────────────
export type EstadoMesa =
  | 'libre'
  | 'ocupada'              // Comensales presentes, sin pedido activo aún
  | 'reservada'            // Tiene reserva futura confirmada
  | 'pidiendo'             // Mesero está tomando la comanda
  | 'esperando'            // Pedido enviado a cocina, esperando comida
  | 'comiendo'             // Platos servidos, comensales comiendo
  | 'pagando'              // Cuenta solicitada, esperando pago del cajero

export interface Mesa {
  id: string
  numero: number
  capacidad: number
  estado: EstadoMesa
  piso?: number            // 1 = planta baja, 2 = rooftop/terraza (undefined = 1)
  reservaId?: string       // Referencia si tiene reserva activa
  pedidoId?: string        // Referencia al pedido de salón activo
}

// ─── REGISTRO DE ACTIVIDAD ───────────────────────────────────
/**
 * Los eventos de negocio críticos se persisten en localStorage (buffer circular 500).
 * Los eventos de UI de alta frecuencia (vistas de platos) se mantienen solo en memoria.
 */
export type TipoEvento =
  | 'pedido_creado'
  | 'pedido_cancelado'
  | 'pedido_estado_cambiado'
  | 'reserva_creada'
  | 'reserva_confirmada'
  | 'reserva_cancelada'
  | 'no_show_registrado'
  | 'pago_procesado'
  | 'plato_disponibilidad_cambiada'
  | 'mesa_estado_cambiado'
  | 'empleado_creado'
  | 'empleado_desactivado'
  | 'login'

/** Indica si el evento debe ser persistido en localStorage */
export const EVENTOS_PERSISTENTES: Set<TipoEvento> = new Set([
  'pedido_creado',
  'pedido_cancelado',
  'pedido_estado_cambiado',
  'reserva_creada',
  'reserva_confirmada',
  'reserva_cancelada',
  'no_show_registrado',
  'pago_procesado',
  'empleado_creado',
  'empleado_desactivado',
])

export interface ActivityLog {
  id: string
  tipo: TipoEvento
  actorId: string                       // userId quien realizó la acción
  actorRole: UserRole
  entidadId?: string                    // ID del pedido/reserva/plato/mesa afectado
  datos?: Record<string, unknown>       // Metadata adicional (total, estado anterior, etc.)
  timestamp: string                     // ISO datetime
  persistido: boolean                   // true = guardado en localStorage
}
