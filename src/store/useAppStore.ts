import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  Plato,
  Mesa,
  Reserva,
  Pedido,
  CartItem,
  EstadoPedido,
  EstadoMesa,
  ActivityLog,
  TipoEvento,
  MetodoPago,
  UserRole,
} from '../types'
import { EVENTOS_PERSISTENTES } from '../types'

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function nowISO(): string {
  return new Date().toISOString()
}

/** Circular buffer: mantiene solo los últimos N logs */
const MAX_LOGS = 500

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

// ─── 12 PLATOS DE GASTRONOMÍA PUNEÑA ─────────────────────────
export const MOCK_PLATOS: Plato[] = [
  // SOPAS
  {
    id: 'plato_01',
    nombre: 'Caldo de Cabeza de Cordero',
    descripcion: 'Caldo tradicional puneño preparado con cabeza de cordero, hierbabuena y papas nativas. Reconfortante y nutritivo.',
    precio: 12.0,
    categoria: 'sopas',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=70&auto=format&fit=crop',
    disponible: true,
    tiempoPreparacion: 25,
  },
  {
    id: 'plato_02',
    nombre: 'Sopa de Quinua',
    descripcion: 'Sopa espesa de quinua andina con verduras frescas, queso y hierbas aromáticas. El sabor del altiplano en cada cucharada.',
    precio: 10.0,
    categoria: 'sopas',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=70&auto=format&fit=crop',
    disponible: true,
    tiempoPreparacion: 20,
  },
  {
    id: 'plato_03',
    nombre: 'Chupe de Camarones',
    descripcion: 'Chupe cremoso de camarones de río con leche, queso, papas amarillas y ají colorado. Plato festivo de Puno.',
    precio: 22.0,
    categoria: 'sopas',
    imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&q=70&auto=format&fit=crop',
    disponible: true,
    tiempoPreparacion: 30,
    popularidad: 95,
  },
  // SEGUNDOS
  {
    id: 'plato_04',
    nombre: 'Trucha a la Plancha',
    descripcion: 'Trucha fresca del lago Titicaca, cocinada a la plancha con limón, ajo y hierbas. Servida con arroz y ensalada.',
    precio: 28.0,
    categoria: 'segundos',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=70&auto=format&fit=crop',
    disponible: true,
    tiempoPreparacion: 20,
    popularidad: 100,
  },
  {
    id: 'plato_05',
    nombre: 'Chicharrón de Alpaca',
    descripcion: 'Trozos de carne de alpaca fritos hasta lograr una corteza dorada y crujiente. Acompañado de mote, zarza criolla y uchucuta.',
    precio: 32.0,
    categoria: 'segundos',
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=70&auto=format&fit=crop',
    disponible: true,
    tiempoPreparacion: 35,
    popularidad: 90,
  },
  {
    id: 'plato_06',
    nombre: 'Cancacho al Horno',
    descripcion: 'Pierna de cordero marinada en especias andinas y horneada lentamente. Jugosa por dentro, dorada por fuera. Incluye papas al horno.',
    precio: 38.0,
    categoria: 'segundos',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=70&auto=format&fit=crop',
    disponible: true,
    tiempoPreparacion: 45,
    popularidad: 85,
  },
  {
    id: 'plato_07',
    nombre: 'Cuy Frito al Estilo Puneño',
    descripcion: 'Cuy entero frito en su punto exacto, adobado con ají panca, comino y ajo. Servido con papas nativas y salsa de maní.',
    precio: 42.0,
    categoria: 'segundos',
    imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=70&auto=format&fit=crop',
    disponible: false,
    tiempoPreparacion: 50,
  },
  {
    id: 'plato_08',
    nombre: 'Watia de Papa',
    descripcion: 'Papa nativa cocinada en horno de tierra con queso fresco derretido y hierbas aromáticas del altiplano. Técnica ancestral inca.',
    precio: 18.0,
    categoria: 'segundos',
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=70&auto=format&fit=crop',
    disponible: true,
    tiempoPreparacion: 40,
  },
  // ENTRADAS
  {
    id: 'plato_09',
    nombre: 'Ocopa Arequipeña',
    descripcion: 'Papas amarillas bañadas en salsa de ají mirasol, maní tostado, queso fresco y huacatay. Entrada clásica de los Andes.',
    precio: 14.0,
    categoria: 'entradas',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=70&auto=format&fit=crop',
    disponible: true,
    tiempoPreparacion: 10,
  },
  // POSTRES
  {
    id: 'plato_10',
    nombre: 'Mazamorra de Cañihua',
    descripcion: 'Postre cremoso elaborado con cañihua andina, leche fresca, canela y clavo de olor. Dulce tradicional del altiplano.',
    precio: 9.0,
    categoria: 'postres',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=70&auto=format&fit=crop',
    disponible: true,
    tiempoPreparacion: 15,
  },
  {
    id: 'plato_11',
    nombre: 'Arroz con Leche Andino',
    descripcion: 'Arroz cocido en leche de vaca fresca con canela, clavo, azúcar y una pizca de sal. Servido tibio o frío según preferencia.',
    precio: 8.0,
    categoria: 'postres',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=70&auto=format&fit=crop',
    disponible: true,
    tiempoPreparacion: 10,
  },
  // BEBIDAS
  {
    id: 'plato_12',
    nombre: 'Chicha Morada de Ollantay',
    descripcion: 'Bebida tradicional de maíz morado cocido con piña, membrillo, canela y clavo. Refrescante y antioxidante. Jarra de 1 litro.',
    precio: 12.0,
    categoria: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=70&auto=format&fit=crop',
    disponible: true,
    tiempoPreparacion: 5,
  },
]

// ─── 8 MESAS DEL RESTAURANTE ─────────────────────────────────
export const MOCK_MESAS: Mesa[] = [
  // ── Planta baja ──
  { id: 'mesa_01', numero: 1, capacidad: 2, estado: 'libre', piso: 1 },
  { id: 'mesa_02', numero: 2, capacidad: 2, estado: 'comiendo', piso: 1 },
  { id: 'mesa_03', numero: 3, capacidad: 4, estado: 'reservada', reservaId: 'res_01', piso: 1 },
  { id: 'mesa_04', numero: 4, capacidad: 4, estado: 'libre', piso: 1 },
  { id: 'mesa_05', numero: 5, capacidad: 6, estado: 'libre', piso: 1 },
  { id: 'mesa_06', numero: 6, capacidad: 6, estado: 'esperando', pedidoId: 'ped_salon_01', piso: 1 },
  { id: 'mesa_07', numero: 7, capacidad: 8, estado: 'libre', piso: 1 },
  { id: 'mesa_08', numero: 8, capacidad: 8, estado: 'reservada', reservaId: 'res_02', piso: 1 },
  // ── Rooftop / terraza ──
  { id: 'mesa_09', numero: 9, capacidad: 2, estado: 'libre', piso: 2 },
  { id: 'mesa_10', numero: 10, capacidad: 4, estado: 'libre', piso: 2 },
  { id: 'mesa_11', numero: 11, capacidad: 4, estado: 'ocupada', piso: 2 },
  { id: 'mesa_12', numero: 12, capacidad: 6, estado: 'libre', piso: 2 },
  { id: 'mesa_13', numero: 13, capacidad: 8, estado: 'reservada', piso: 2 },
]

// ─── RESERVAS DE EJEMPLO ─────────────────────────────────────
const today = new Date()
const fmt = (d: Date) => d.toISOString().split('T')[0]
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000)

export const MOCK_RESERVAS: Reserva[] = [
  {
    id: 'res_01',
    userId: 'usr_cliente_01',
    fecha: fmt(today),
    hora: '13:00',
    personas: 4,
    nombre: 'María Quispe',
    telefono: '951234567',
    estado: 'confirmada',
    mesaId: 'mesa_03',
    createdAt: new Date(today.getTime() - 3600000).toISOString(),
  },
  {
    id: 'res_02',
    userId: 'usr_cliente_01',
    fecha: fmt(addDays(today, 2)),
    hora: '20:00',
    personas: 8,
    nombre: 'María Quispe',
    telefono: '951234567',
    estado: 'pendiente',
    mesaId: 'mesa_08',
    createdAt: new Date(today.getTime() - 7200000).toISOString(),
  },
  {
    id: 'res_03',
    userId: 'usr_cliente_02',
    fecha: fmt(addDays(today, -1)),
    hora: '19:00',
    personas: 2,
    nombre: 'Pedro Condori',
    telefono: '954321098',
    estado: 'cancelada',
    createdAt: new Date(today.getTime() - 86400000).toISOString(),
  },
]

// ─── PEDIDOS DE EJEMPLO ──────────────────────────────────────
export const MOCK_PEDIDOS: Pedido[] = [
  // Pedido Delivery activo
  {
    id: 'ped_01',
    tipo: 'delivery',
    clienteId: 'usr_cliente_01',
    clienteNombre: 'Ana Flores',
    clienteTelefono: '955667788',
    items: [
      { platoId: 'plato_04', nombre: 'Trucha a la Plancha', precio: 28.0, cantidad: 2 },
      { platoId: 'plato_12', nombre: 'Chicha Morada de Ollantay', precio: 12.0, cantidad: 1 },
    ],
    total: 68.0,
    direccion: 'Jr. Lima 345, Puno',
    metodoPago: 'yape',
    estado: 'preparando',
    deliveryId: 'usr_delivery_01',
    createdAt: new Date(today.getTime() - 1800000).toISOString(),
    updatedAt: new Date(today.getTime() - 900000).toISOString(),
  },
  // Pedido Delivery nuevo (sin asignar)
  {
    id: 'ped_02',
    tipo: 'delivery',
    clienteNombre: 'Roberto Huanca',
    clienteTelefono: '956778899',
    items: [
      { platoId: 'plato_05', nombre: 'Chicharrón de Alpaca', precio: 32.0, cantidad: 1 },
      { platoId: 'plato_10', nombre: 'Mazamorra de Cañihua', precio: 9.0, cantidad: 2 },
    ],
    total: 50.0,
    direccion: 'Av. El Sol 789, Puno',
    metodoPago: 'efectivo',
    estado: 'nuevo',
    createdAt: new Date(today.getTime() - 600000).toISOString(),
  },
  // Pedido de Salón — mesa 6, esperando de cocina
  {
    id: 'ped_salon_01',
    tipo: 'salon',
    mesaId: 'mesa_06',
    meseroId: 'usr_mesero_01',
    clienteNombre: 'Mesa 6',
    clienteTelefono: '',
    items: [
      { platoId: 'plato_04', nombre: 'Trucha a la Plancha', precio: 28.0, cantidad: 2, notas: 'Sin limón' },
      { platoId: 'plato_03', nombre: 'Chupe de Camarones', precio: 22.0, cantidad: 1 },
      { platoId: 'plato_12', nombre: 'Chicha Morada de Ollantay', precio: 12.0, cantidad: 2 },
    ],
    total: 102.0,
    estado: 'preparando',
    createdAt: new Date(today.getTime() - 900000).toISOString(),
    updatedAt: new Date(today.getTime() - 600000).toISOString(),
  },
]

// ═══════════════════════════════════════════════════════════════
// TIPOS DEL STORE
// ═══════════════════════════════════════════════════════════════

/** Resultado de una operación con posible error de validación */
export interface OperationResult {
  ok: boolean
  error?: string
}

interface AppState {
  // ── Datos ───────────────────────────────────────────────────
  platos: Plato[]
  mesas: Mesa[]
  reservas: Reserva[]
  pedidos: Pedido[]
  activityLogs: ActivityLog[]

  // ── Carrito (Delivery) ───────────────────────────────────────
  cart: CartItem[]
  addToCart: (plato: Plato, notas?: string) => void
  removeFromCart: (platoId: string) => void
  updateCartItemQty: (platoId: string, cantidad: number) => void
  clearCart: () => void

  // ── Actividad ────────────────────────────────────────────────
  logActivity: (
    tipo: TipoEvento,
    actorId: string,
    actorRole: UserRole,
    entidadId?: string,
    datos?: Record<string, unknown>
  ) => void

  // ── Reservas ─────────────────────────────────────────────────
  /**
   * Crea una nueva reserva validando que el cliente no exceda 2 reservas activas.
   * Retorna { ok: false, error } si la validación falla.
   */
  addReserva: (reserva: Omit<Reserva, 'createdAt' | 'estado'>, actorId: string) => OperationResult

  /** Actualiza el estado de una reserva (admin: confirmar/cancelar) */
  updateReservaEstado: (
    reservaId: string,
    estado: Reserva['estado'],
    actorId: string,
    actorRole: string,
    motivo?: string
  ) => void

  /**
   * Cancela la reserva de un cliente. Valida la ventana de 2 horas.
   * Retorna { ok: false, error } si está fuera del plazo.
   */
  cancelarReservaCliente: (reservaId: string, clienteId: string) => OperationResult

  /** Registra un no-show: el cliente tenía reserva y no llegó */
  marcarNoShow: (reservaId: string, adminId: string) => void

  // ── Pedidos (Delivery) ────────────────────────────────────────
  /**
   * Crea un pedido de delivery. Valida que el cliente no tenga
   * otro pedido activo (estado ≠ 'entregado' | 'cancelado').
   */
  addPedidoDelivery: (
    pedido: Omit<Pedido, 'id' | 'createdAt' | 'estado' | 'tipo'>,
    actorId: string
  ) => OperationResult

  /** Actualiza el estado de cualquier pedido (cocina, delivery, admin) */
  updatePedidoEstado: (
    pedidoId: string,
    estado: EstadoPedido,
    actorId: string,
    actorRole: string
  ) => void

  /** Asigna un repartidor a un pedido delivery */
  asignarDelivery: (pedidoId: string, deliveryId: string, adminId: string) => void

  /** Cancela un pedido delivery. Solo si está en 'nuevo', o con flag de forzar (admin). */
  cancelarPedidoDelivery: (
    pedidoId: string,
    actorId: string,
    actorRole: string,
    forzar?: boolean
  ) => OperationResult

  // ── Pedidos (Salón) ───────────────────────────────────────────
  /**
   * El mesero crea una comanda para una mesa.
   * Actualiza automáticamente el estado de la mesa a 'pidiendo'.
   */
  crearComandaSalon: (
    mesaId: string,
    items: Pedido['items'],
    meseroId: string,
    clienteNombre?: string
  ) => OperationResult

  /**
   * El mesero solicita la cuenta: cambia el estado del pedido y la mesa.
   * La mesa pasa a 'pagando', el cajero verá el pedido en la cola de cobro.
   */
  solicitarCuenta: (pedidoId: string, meseroId: string) => void

  /**
   * El cajero procesa el pago. Cambia el pedido a 'pagado' y la mesa a 'libre'.
   */
  procesarPago: (
    pedidoId: string,
    metodoPago: MetodoPago,
    cajeroId: string
  ) => OperationResult

  // ── Mesas ─────────────────────────────────────────────────────
  updateMesaEstado: (mesaId: string, estado: EstadoMesa, extra?: { reservaId?: string; pedidoId?: string }) => void

  // ── Menú (admin) ──────────────────────────────────────────────
  togglePlatoDisponible: (platoId: string, actorId: string, actorRole: string) => void
  updatePlatoPrecio: (platoId: string, precio: number) => void
  addPlato: (plato: Plato) => void

  // ── Selectores ────────────────────────────────────────────────
  getPedidosByDelivery: (deliveryId: string) => Pedido[]
  getPedidosByMesa: (mesaId: string) => Pedido[]
  getPedidosPendientesCobro: () => Pedido[]
  getReservasByCliente: (userId: string) => Reserva[]
  getLogsRecientes: (limite?: number) => ActivityLog[]
}

// ═══════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════

export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      // ── Estado inicial ────────────────────────────────────────
      platos: MOCK_PLATOS,
      mesas: MOCK_MESAS,
      reservas: MOCK_RESERVAS,
      pedidos: MOCK_PEDIDOS,
      activityLogs: [],
      cart: [],

      // ─────────────────────────────────────────────────────────
      // REGISTRO DE ACTIVIDAD
      // ─────────────────────────────────────────────────────────
      logActivity: (tipo, actorId, actorRole, entidadId, datos) =>
        set((state) => {
          const persistido = EVENTOS_PERSISTENTES.has(tipo)
          const log: ActivityLog = {
            id: generateId('log'),
            tipo,
            actorId,
            actorRole,
            entidadId,
            datos,
            timestamp: nowISO(),
            persistido,
          }
          state.activityLogs.push(log)
          // Buffer circular: mantener solo los últimos MAX_LOGS
          if (state.activityLogs.length > MAX_LOGS) {
            state.activityLogs.splice(0, state.activityLogs.length - MAX_LOGS)
          }
        }),

      // ─────────────────────────────────────────────────────────
      // CARRITO (Delivery)
      // ─────────────────────────────────────────────────────────
      addToCart: (plato, notas) =>
        set((state) => {
          const existing = state.cart.find((i) => i.plato.id === plato.id)
          if (existing) {
            existing.cantidad += 1
            if (notas) existing.notas = notas
          } else {
            state.cart.push({ plato, cantidad: 1, notas })
          }
        }),

      removeFromCart: (platoId) =>
        set((state) => {
          state.cart = state.cart.filter((i) => i.plato.id !== platoId)
        }),

      updateCartItemQty: (platoId, cantidad) =>
        set((state) => {
          if (cantidad <= 0) {
            state.cart = state.cart.filter((i) => i.plato.id !== platoId)
          } else {
            const item = state.cart.find((i) => i.plato.id === platoId)
            if (item) item.cantidad = cantidad
          }
        }),

      clearCart: () => set((state) => { state.cart = [] }),

      // ─────────────────────────────────────────────────────────
      // RESERVAS
      // ─────────────────────────────────────────────────────────
      addReserva: (reservaData, actorId) => {
        const state = get()

        // Validar: máx 2 reservas activas por usuario
        const reservasActivas = state.reservas.filter(
          (r) =>
            r.userId === reservaData.userId &&
            (r.estado === 'pendiente' || r.estado === 'confirmada')
        )
        if (reservasActivas.length >= 2) {
          return {
            ok: false,
            error: 'Ya tienes 2 reservas activas. Cancela una para hacer una nueva.',
          }
        }

        // Validar: la fecha/hora no es en el pasado
        const ahora = new Date()
        const fechaReserva = new Date(`${reservaData.fecha}T${reservaData.hora}:00`)
        if (fechaReserva <= ahora) {
          return { ok: false, error: 'No puedes reservar para una fecha/hora pasada.' }
        }

        const nuevaReserva: Reserva = {
          ...reservaData,
          id: generateId('res'),
          estado: 'pendiente',
          createdAt: nowISO(),
        }

        set((s) => { s.reservas.push(nuevaReserva) })
        get().logActivity('reserva_creada', actorId, 'cliente', nuevaReserva.id, {
          fecha: nuevaReserva.fecha,
          hora: nuevaReserva.hora,
          personas: nuevaReserva.personas,
        })

        return { ok: true }
      },

      updateReservaEstado: (reservaId, estado, actorId, actorRole, motivo) =>
        set((state) => {
          const r = state.reservas.find((r) => r.id === reservaId)
          if (!r) return
          const estadoAnterior = r.estado
          r.estado = estado
          if (estado === 'cancelada') {
            r.canceladoAt = nowISO()
            r.motivoCancelacion = motivo
          }
          get().logActivity(
            estado === 'confirmada' ? 'reserva_confirmada' : 'reserva_cancelada',
            actorId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            actorRole as any,
            reservaId,
            { estadoAnterior, motivo }
          )
        }),

      cancelarReservaCliente: (reservaId, clienteId) => {
        const state = get()
        const reserva = state.reservas.find((r) => r.id === reservaId)

        if (!reserva) return { ok: false, error: 'Reserva no encontrada.' }
        if (reserva.userId !== clienteId) return { ok: false, error: 'No tienes permiso para cancelar esta reserva.' }
        if (reserva.estado === 'cancelada') return { ok: false, error: 'Esta reserva ya está cancelada.' }

        // Validar ventana de 2 horas
        const ahora = new Date()
        const fechaReserva = new Date(`${reserva.fecha}T${reserva.hora}:00`)
        const diffMs = fechaReserva.getTime() - ahora.getTime()
        const diffHoras = diffMs / (1000 * 60 * 60)

        if (diffHoras < 2) {
          return {
            ok: false,
            error: `Solo puedes cancelar hasta 2 horas antes. Faltan ${Math.round(diffHoras * 60)} minutos para tu reserva. Contacta al restaurante.`,
          }
        }

        set((s) => {
          const r = s.reservas.find((r) => r.id === reservaId)
          if (r) {
            r.estado = 'cancelada'
            r.canceladoAt = nowISO()
            r.motivoCancelacion = 'Cancelado por el cliente'
            // Liberar mesa si estaba asignada
            if (r.mesaId) {
              const mesa = s.mesas.find((m) => m.id === r.mesaId)
              if (mesa && mesa.reservaId === reservaId) {
                mesa.estado = 'libre'
                mesa.reservaId = undefined
              }
            }
          }
        })

        get().logActivity('reserva_cancelada', clienteId, 'cliente', reservaId, {
          horasDeAntelacion: diffHoras.toFixed(2),
        })

        return { ok: true }
      },

      marcarNoShow: (reservaId, adminId) =>
        set((state) => {
          const r = state.reservas.find((r) => r.id === reservaId)
          if (!r) return
          r.estado = 'no_show'
          r.canceladoAt = nowISO()
          r.motivoCancelacion = 'No-show: cliente no se presentó'
          // Liberar mesa
          if (r.mesaId) {
            const mesa = state.mesas.find((m) => m.id === r.mesaId)
            if (mesa) {
              mesa.estado = 'libre'
              mesa.reservaId = undefined
            }
          }
          get().logActivity('no_show_registrado', adminId, 'admin', reservaId, {
            userId: r.userId,
            fecha: r.fecha,
            hora: r.hora,
          })
        }),

      // ─────────────────────────────────────────────────────────
      // PEDIDOS DELIVERY
      // ─────────────────────────────────────────────────────────
      addPedidoDelivery: (pedidoData, actorId) => {
        const state = get()

        // Validar: el cliente no puede tener más de 1 pedido activo
        if (pedidoData.clienteId) {
          const pedidoActivo = state.pedidos.find(
            (p) =>
              p.tipo === 'delivery' &&
              p.clienteId === pedidoData.clienteId &&
              p.estado !== 'entregado' &&
              p.estado !== 'cancelado'
          )
          if (pedidoActivo) {
            return {
              ok: false,
              error: 'Ya tienes un pedido activo. Espera a que sea entregado para hacer uno nuevo.',
            }
          }
        }

        // Validar que los platos del carrito siguen disponibles
        const platosNoDisponibles = pedidoData.items.filter((item) => {
          const plato = state.platos.find((p) => p.id === item.platoId)
          return plato && !plato.disponible
        })
        if (platosNoDisponibles.length > 0) {
          const nombres = platosNoDisponibles.map((i) => i.nombre).join(', ')
          return {
            ok: false,
            error: `Los siguientes platos ya no están disponibles: ${nombres}. Por favor actualiza tu carrito.`,
          }
        }

        const nuevoPedido: Pedido = {
          ...pedidoData,
          id: generateId('ped'),
          tipo: 'delivery',
          estado: 'nuevo',
          createdAt: nowISO(),
          updatedAt: nowISO(),
        }

        set((s) => { s.pedidos.push(nuevoPedido) })
        get().logActivity('pedido_creado', actorId, 'cliente', nuevoPedido.id, {
          tipo: 'delivery',
          total: nuevoPedido.total,
          items: nuevoPedido.items.length,
        })

        return { ok: true }
      },

      updatePedidoEstado: (pedidoId, estado, actorId, actorRole) =>
        set((state) => {
          const p = state.pedidos.find((p) => p.id === pedidoId)
          if (!p) return
          const estadoAnterior = p.estado
          p.estado = estado
          p.updatedAt = nowISO()

          // Sincronizar estado de mesa para pedidos de salón
          if (p.tipo === 'salon' && p.mesaId) {
            const mesa = state.mesas.find((m) => m.id === p.mesaId)
            if (mesa) {
              if (estado === 'preparando') mesa.estado = 'esperando'
              else if (estado === 'listo') mesa.estado = 'esperando' // cocina lista, mesero va a buscar
              else if (estado === 'servido') mesa.estado = 'comiendo'
            }
          }

          get().logActivity(
            'pedido_estado_cambiado',
            actorId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            actorRole as any,
            pedidoId,
            { estadoAnterior, estadoNuevo: estado }
          )
        }),

      asignarDelivery: (pedidoId, deliveryId) =>
        set((state) => {
          const p = state.pedidos.find((p) => p.id === pedidoId)
          if (p) {
            p.deliveryId = deliveryId
            p.updatedAt = nowISO()
          }
        }),

      cancelarPedidoDelivery: (pedidoId, actorId, actorRole, forzar = false) => {
        const state = get()
        const pedido = state.pedidos.find((p) => p.id === pedidoId)

        if (!pedido) return { ok: false, error: 'Pedido no encontrado.' }
        if (pedido.estado === 'cancelado') return { ok: false, error: 'El pedido ya está cancelado.' }

        // Solo se puede cancelar si está 'nuevo', a menos que sea admin forzando
        if (pedido.estado !== 'nuevo' && !forzar) {
          return {
            ok: false,
            error: `Tu pedido ya está en "${pedido.estado}". No se puede cancelar. Contacta al restaurante.`,
          }
        }

        set((s) => {
          const p = s.pedidos.find((p) => p.id === pedidoId)
          if (p) {
            p.estado = 'cancelado'
            p.updatedAt = nowISO()
          }
        })

        get().logActivity(
          'pedido_cancelado',
          actorId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actorRole as any,
          pedidoId,
          { estadoAlCancelar: pedido.estado, forzado: forzar }
        )

        return { ok: true }
      },

      // ─────────────────────────────────────────────────────────
      // PEDIDOS SALÓN
      // ─────────────────────────────────────────────────────────
      crearComandaSalon: (mesaId, items, meseroId, clienteNombre) => {
        const state = get()
        const mesa = state.mesas.find((m) => m.id === mesaId)

        if (!mesa) return { ok: false, error: 'Mesa no encontrada.' }

        // Validar que no hay ya un pedido activo en esa mesa
        const pedidoActivoEnMesa = state.pedidos.find(
          (p) =>
            p.tipo === 'salon' &&
            p.mesaId === mesaId &&
            p.estado !== 'pagado' &&
            p.estado !== 'cancelado'
        )
        if (pedidoActivoEnMesa) {
          return {
            ok: false,
            error: `La mesa ${mesa.numero} ya tiene una comanda activa.`,
          }
        }

        // Validar que los platos existen y están disponibles
        const platosNoDisponibles = items.filter((item) => {
          const plato = state.platos.find((p) => p.id === item.platoId)
          return !plato || !plato.disponible
        })
        if (platosNoDisponibles.length > 0) {
          return {
            ok: false,
            error: `Algunos platos no están disponibles: ${platosNoDisponibles.map((i) => i.nombre).join(', ')}`,
          }
        }

        const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

        const nuevoPedido: Pedido = {
          id: generateId('ped'),
          tipo: 'salon',
          mesaId,
          meseroId,
          clienteNombre: clienteNombre || `Mesa ${mesa.numero}`,
          clienteTelefono: '',
          items,
          total,
          estado: 'nuevo',
          createdAt: nowISO(),
          updatedAt: nowISO(),
        }

        set((s) => {
          s.pedidos.push(nuevoPedido)
          // Actualizar estado de la mesa
          const m = s.mesas.find((m) => m.id === mesaId)
          if (m) {
            m.estado = 'pidiendo'
            m.pedidoId = nuevoPedido.id
          }
        })

        get().logActivity('pedido_creado', meseroId, 'mesero', nuevoPedido.id, {
          tipo: 'salon',
          mesaId,
          total,
          items: items.length,
        })

        return { ok: true }
      },

      solicitarCuenta: (pedidoId) =>
        set((state) => {
          const p = state.pedidos.find((p) => p.id === pedidoId)
          if (!p) return
          // El pedido no cambia de estado aquí (aún está 'servido')
          // Solo la mesa cambia a 'pagando' para que el cajero lo vea
          if (p.mesaId) {
            const mesa = state.mesas.find((m) => m.id === p.mesaId)
            if (mesa) mesa.estado = 'pagando'
          }
          p.updatedAt = nowISO()
        }),

      procesarPago: (pedidoId, metodoPago, cajeroId) => {
        const state = get()
        const pedido = state.pedidos.find((p) => p.id === pedidoId)

        if (!pedido) return { ok: false, error: 'Pedido no encontrado.' }
        if (pedido.tipo !== 'salon') return { ok: false, error: 'Este pedido no es de salón.' }

        set((s) => {
          const p = s.pedidos.find((p) => p.id === pedidoId)
          if (!p) return

          p.estado = 'pagado'
          p.metodoPago = metodoPago
          p.updatedAt = nowISO()

          // Liberar la mesa
          if (p.mesaId) {
            const mesa = s.mesas.find((m) => m.id === p.mesaId)
            if (mesa) {
              mesa.estado = 'libre'
              mesa.pedidoId = undefined
            }
          }
        })

        get().logActivity('pago_procesado', cajeroId, 'caja', pedidoId, {
          total: pedido.total,
          metodoPago,
          mesaId: pedido.mesaId,
        })

        return { ok: true }
      },

      // ─────────────────────────────────────────────────────────
      // MESAS
      // ─────────────────────────────────────────────────────────
      updateMesaEstado: (mesaId, estado, extra) =>
        set((state) => {
          const m = state.mesas.find((m) => m.id === mesaId)
          if (!m) return
          m.estado = estado
          if (extra?.reservaId !== undefined) m.reservaId = extra.reservaId
          if (extra?.pedidoId !== undefined) m.pedidoId = extra.pedidoId
        }),

      // ─────────────────────────────────────────────────────────
      // MENÚ (ADMIN)
      // ─────────────────────────────────────────────────────────
      togglePlatoDisponible: (platoId, actorId, actorRole) =>
        set((state) => {
          const p = state.platos.find((p) => p.id === platoId)
          if (!p) return
          p.disponible = !p.disponible
          get().logActivity(
            'plato_disponibilidad_cambiada',
            actorId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            actorRole as any,
            platoId,
            { disponible: p.disponible, nombre: p.nombre }
          )
        }),

      updatePlatoPrecio: (platoId, precio) =>
        set((state) => {
          const p = state.platos.find((x) => x.id === platoId)
          if (p) p.precio = precio
        }),

      addPlato: (plato) =>
        set((state) => {
          state.platos.push(plato)
        }),

      // ─────────────────────────────────────────────────────────
      // SELECTORES
      // ─────────────────────────────────────────────────────────
      getPedidosByDelivery: (deliveryId) =>
        get().pedidos.filter((p) => p.tipo === 'delivery' && p.deliveryId === deliveryId),

      getPedidosByMesa: (mesaId) =>
        get().pedidos.filter(
          (p) =>
            p.tipo === 'salon' &&
            p.mesaId === mesaId &&
            p.estado !== 'pagado' &&
            p.estado !== 'cancelado'
        ),

      /**
       * Cola de cobro del cajero (criterio único — Opción A).
       * - Salón: solo pedidos cuya MESA está en estado 'pagando' (el mesero ya
       *   pulsó "Pedir cuenta"). No basta con que el pedido esté 'servido'.
       * - Delivery: pedidos 'entregado' en efectivo, para reconciliación de caja.
       */
      getPedidosPendientesCobro: () => {
        const { pedidos, mesas } = get()
        const pedidosPagando = new Set(
          mesas
            .filter((m) => m.estado === 'pagando' && m.pedidoId)
            .map((m) => m.pedidoId)
        )
        const cuentasSalon = pedidos.filter(
          (p) =>
            p.tipo === 'salon' &&
            p.estado !== 'pagado' &&
            p.estado !== 'cancelado' &&
            pedidosPagando.has(p.id)
        )
        const reconciliacionDelivery = pedidos.filter(
          (p) =>
            p.tipo === 'delivery' &&
            p.estado === 'entregado' &&
            p.metodoPago === 'efectivo'
        )
        return [...cuentasSalon, ...reconciliacionDelivery]
      },

      getReservasByCliente: (userId) =>
        get().reservas.filter((r) => r.userId === userId),

      getLogsRecientes: (limite = 50) => {
        const logs = get().activityLogs
        return logs.slice(-limite).reverse()
      },
    })),
    {
      name: 'rincon-andino-app',
      // Subir la versión cuando cambian los datos semilla (p.ej. imágenes del
      // catálogo). La migración descarta el catálogo persistido para que se
      // tomen los MOCK_PLATOS frescos del código; conserva reservas/pedidos.
      version: 3,
      migrate: (persisted) => {
        // Descarta catálogo y mesas persistidos para tomar los MOCK_* frescos
        // (imágenes de platos + mesas con piso/rooftop). Conserva reservas/pedidos.
        const p = persisted as Record<string, unknown> | undefined
        if (p) {
          delete p.platos
          delete p.mesas
        }
        return p as unknown as AppState
      },
      // Solo persistir los eventos de negocio críticos y datos de dominio
      partialize: (state) => ({
        platos: state.platos,
        mesas: state.mesas,
        reservas: state.reservas,
        pedidos: state.pedidos,
        // Solo guardar los logs marcados como persistentes
        activityLogs: state.activityLogs.filter((l) => l.persistido),
      }),
    }
  )
)

// ─── HELPER: DISPONIBILIDAD DE MESAS ─────────────────────────

/**
 * Calcula el estado de cada mesa para una fecha y hora específicas.
 * Combina el estado físico real (si es "hoy") con las reservas programadas.
 */
export function getDisponibilidadMesas(
  state: { mesas: Mesa[]; reservas: Reserva[] },
  fecha: string,
  hora?: string
): Record<string, EstadoMesa> {
  const result: Record<string, EstadoMesa> = {}

  // Base: todas libres
  for (const m of state.mesas) {
    result[m.id] = 'libre'
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = fecha === todayStr

  // Si es hoy, superponemos el estado físico actual de las mesas
  if (isToday) {
    for (const m of state.mesas) {
      if (m.estado !== 'libre') {
        result[m.id] = m.estado
      }
    }
  }

  // Superponemos las reservas confirmadas de esa fecha
  for (const r of state.reservas) {
    if (r.estado === 'cancelada' || r.estado === 'no_show') continue
    if (r.fecha === fecha) {
      if (hora && r.hora !== hora) continue
      if (r.mesaId) {
        result[r.mesaId] = 'reservada'
      }
    }
  }

  return result
}
