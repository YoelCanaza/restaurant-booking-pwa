import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  Plato,
  Mesa,
  Reserva,
  Pedido,
  CartItem,
  EstadoPedido,
  EstadoMesa,
} from '../types'

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
    imageUrl: 'https://placehold.co/400x300/E05936/FFFFFF?text=Caldo+Cabeza',
    disponible: true,
    tiempoPreparacion: 25,
  },
  {
    id: 'plato_02',
    nombre: 'Sopa de Quinua',
    descripcion: 'Sopa espesa de quinua andina con verduras frescas, queso y hierbas aromáticas. El sabor del altiplano en cada cucharada.',
    precio: 10.0,
    categoria: 'sopas',
    imageUrl: 'https://placehold.co/400x300/E05936/FFFFFF?text=Sopa+Quinua',
    disponible: true,
    tiempoPreparacion: 20,
  },
  {
    id: 'plato_03',
    nombre: 'Chupe de Camarones',
    descripcion: 'Chupe cremoso de camarones de río con leche, queso, papas amarillas y ají colorado. Plato festivo de Puno.',
    precio: 22.0,
    categoria: 'sopas',
    imageUrl: 'https://placehold.co/400x300/E05936/FFFFFF?text=Chupe+Camarones',
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
    imageUrl: 'https://placehold.co/400x300/D4A853/FFFFFF?text=Trucha+Plancha',
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
    imageUrl: 'https://placehold.co/400x300/D4A853/FFFFFF?text=Chicharron+Alpaca',
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
    imageUrl: 'https://placehold.co/400x300/D4A853/FFFFFF?text=Cancacho',
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
    imageUrl: 'https://placehold.co/400x300/D4A853/FFFFFF?text=Cuy+Frito',
    disponible: false,
    tiempoPreparacion: 50,
  },
  {
    id: 'plato_08',
    nombre: 'Watia de Papa',
    descripcion: 'Papa nativa cocinada en horno de tierra con queso fresco derretido y hierbas aromáticas del altiplano. Técnica ancestral inca.',
    precio: 18.0,
    categoria: 'segundos',
    imageUrl: 'https://placehold.co/400x300/D4A853/FFFFFF?text=Watia',
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
    imageUrl: 'https://placehold.co/400x300/2D2A26/FFFFFF?text=Ocopa',
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
    imageUrl: 'https://placehold.co/400x300/F9F6F0/2D2A26?text=Mazamorra',
    disponible: true,
    tiempoPreparacion: 15,
  },
  {
    id: 'plato_11',
    nombre: 'Arroz con Leche Andino',
    descripcion: 'Arroz cocido en leche de vaca fresca con canela, clavo, azúcar y una pizca de sal. Servido tibio o frío según preferencia.',
    precio: 8.0,
    categoria: 'postres',
    imageUrl: 'https://placehold.co/400x300/F9F6F0/2D2A26?text=Arroz+Leche',
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
    imageUrl: 'https://placehold.co/400x300/4C1D95/FFFFFF?text=Chicha+Morada',
    disponible: true,
    tiempoPreparacion: 5,
  },
]

// ─── 8 MESAS DEL RESTAURANTE ─────────────────────────────────
export const MOCK_MESAS: Mesa[] = [
  { id: 'mesa_01', numero: 1, capacidad: 2, estado: 'libre' },
  { id: 'mesa_02', numero: 2, capacidad: 2, estado: 'ocupada' },
  { id: 'mesa_03', numero: 3, capacidad: 4, estado: 'reservada', reservaId: 'res_01' },
  { id: 'mesa_04', numero: 4, capacidad: 4, estado: 'libre' },
  { id: 'mesa_05', numero: 5, capacidad: 6, estado: 'libre' },
  { id: 'mesa_06', numero: 6, capacidad: 6, estado: 'ocupada' },
  { id: 'mesa_07', numero: 7, capacidad: 8, estado: 'libre' },
  { id: 'mesa_08', numero: 8, capacidad: 8, estado: 'reservada', reservaId: 'res_02' },
]

// ─── 3 RESERVAS DE EJEMPLO ────────────────────────────────────
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

// ─── 2 PEDIDOS DELIVERY DE EJEMPLO ───────────────────────────
export const MOCK_PEDIDOS: Pedido[] = [
  {
    id: 'ped_01',
    clienteNombre: 'Ana Flores',
    clienteTelefono: '955667788',
    items: [
      { platoId: 'plato_04', nombre: 'Trucha a la Plancha', precio: 28.0, cantidad: 2 },
      { platoId: 'plato_12', nombre: 'Chicha Morada de Ollantay', precio: 12.0, cantidad: 1 },
    ],
    total: 68.0,
    direccion: 'Jr. Lima 345, Puno',
    estado: 'preparando',
    deliveryId: 'usr_delivery_01',
    createdAt: new Date(today.getTime() - 1800000).toISOString(),
  },
  {
    id: 'ped_02',
    clienteNombre: 'Roberto Huanca',
    clienteTelefono: '956778899',
    items: [
      { platoId: 'plato_05', nombre: 'Chicharrón de Alpaca', precio: 32.0, cantidad: 1 },
      { platoId: 'plato_10', nombre: 'Mazamorra de Cañihua', precio: 9.0, cantidad: 2 },
    ],
    total: 50.0,
    direccion: 'Av. El Sol 789, Puno',
    estado: 'nuevo',
    createdAt: new Date(today.getTime() - 600000).toISOString(),
  },
]

// ═══════════════════════════════════════════════════════════════
// TIPOS DEL STORE
// ═══════════════════════════════════════════════════════════════

interface AppState {
  // ── Datos ───────────────────────────────────────────────────
  platos: Plato[]
  mesas: Mesa[]
  reservas: Reserva[]
  pedidos: Pedido[]

  // ── Carrito ─────────────────────────────────────────────────
  cart: CartItem[]
  addToCart: (plato: Plato) => void
  removeFromCart: (platoId: string) => void
  updateCartItemQty: (platoId: string, cantidad: number) => void
  clearCart: () => void

  // ── Acciones de dominio ──────────────────────────────────────
  addReserva: (reserva: Reserva) => void
  updateReservaEstado: (reservaId: string, estado: Reserva['estado']) => void
  addPedido: (pedido: Pedido) => void
  updatePedidoEstado: (pedidoId: string, estado: EstadoPedido) => void
  updateMesaEstado: (mesaId: string, estado: EstadoMesa, reservaId?: string) => void
  asignarPedido: (pedidoId: string, deliveryId: string) => void
  getPedidosByDelivery: (deliveryId: string) => Pedido[]
  togglePlatoDisponible: (platoId: string) => void
  updatePlatoPrecio: (platoId: string, precio: number) => void
  addPlato: (plato: Plato) => void
}

// ═══════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    // ── Estado inicial ────────────────────────────────────────
    platos: MOCK_PLATOS,
    mesas: MOCK_MESAS,
    reservas: MOCK_RESERVAS,
    pedidos: MOCK_PEDIDOS,
    cart: [],

    // ── Carrito ───────────────────────────────────────────────
    addToCart: (plato) =>
      set((state) => {
        const existing = state.cart.find((i) => i.plato.id === plato.id)
        if (existing) {
          existing.cantidad += 1
        } else {
          state.cart.push({ plato, cantidad: 1 })
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

    // ── Reservas ──────────────────────────────────────────────
    addReserva: (reserva) =>
      set((state) => { state.reservas.push(reserva) }),

    updateReservaEstado: (reservaId, estado) =>
      set((state) => {
        const r = state.reservas.find((r) => r.id === reservaId)
        if (r) r.estado = estado
      }),

    // ── Pedidos ───────────────────────────────────────────────
    addPedido: (pedido) =>
      set((state) => { state.pedidos.push(pedido) }),

    updatePedidoEstado: (pedidoId, estado) =>
      set((state) => {
        const p = state.pedidos.find((p) => p.id === pedidoId)
        if (p) p.estado = estado
      }),

    asignarPedido: (pedidoId, deliveryId) =>
      set((state) => {
        const p = state.pedidos.find((p) => p.id === pedidoId)
        if (p) {
          p.deliveryId = deliveryId
          // keep existing estado or set to 'nuevo'
          if (!p.estado) p.estado = 'nuevo'
        }
      }),

    // Selector – get pedidos by delivery id
    getPedidosByDelivery: (deliveryId) => {
      return get().pedidos.filter((p) => p.deliveryId === deliveryId)
    },

    // ── Mesas ─────────────────────────────────────────────────
    updateMesaEstado: (mesaId, estado, reservaId) =>
      set((state) => {
        const m = state.mesas.find((m) => m.id === mesaId)
        if (m) {
          m.estado = estado
          m.reservaId = reservaId
        }
      }),

    // ── Menú (admin) ──────────────────────────────────────────
    togglePlatoDisponible: (platoId) =>
      set((state) => {
        const p = state.platos.find((p) => p.id === platoId)
        if (p) p.disponible = !p.disponible
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
  }))
)

// ─── HELPER FUNCIONS ─────────────────────────────────────────

/**
 * Calcula el estado de cada mesa para una fecha y hora específicas.
 * Combina el estado físico real (si es "hoy") con las reservas programadas.
 */
export function getDisponibilidadMesas(state: AppState, fecha: string, hora?: string): Record<string, EstadoMesa> {
  const result: Record<string, EstadoMesa> = {}
  
  // Base: todas libres
  for (const m of state.mesas) {
    result[m.id] = 'libre'
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = fecha === todayStr

  // Si es hoy, superponemos las mesas físicamente ocupadas
  if (isToday) {
    for (const m of state.mesas) {
      if (m.estado === 'ocupada') {
        result[m.id] = 'ocupada'
      }
    }
  }

  // Superponemos las reservas
  for (const r of state.reservas) {
    if (r.estado === 'cancelada') continue
    if (r.fecha === fecha) {
      if (hora && r.hora !== hora) continue
      if (r.mesaId) {
        result[r.mesaId] = 'reservada'
      }
    }
  }

  return result
}
