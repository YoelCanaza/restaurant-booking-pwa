/**
 * src/hooks/index.ts
 * ─────────────────────────────────────────────────────────────
 * Hooks selectores de Zustand con patrones de memoización.
 *
 * PATRÓN: Cada hook usa un selector específico para que el
 * componente solo se re-renderice cuando cambia ESE dato,
 * no cuando cambia cualquier parte del store.
 *
 * ✅ Correcto:  const role = useRole()
 * ❌ Incorrecto: const { user } = useAuthStore()  ← re-render total
 * ─────────────────────────────────────────────────────────────
 */

import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import type { UserRole, CartItem, Plato, Reserva } from '../types'

// ─── AUTH / ROL ───────────────────────────────────────────────

/** Rol del usuario actual. null si no hay sesión. */
export const useRole = (): UserRole | null =>
  useAuthStore((s) => s.user?.role ?? null)

/** Usuario completo actual. */
export const useCurrentUser = () =>
  useAuthStore((s) => s.user)

/** Verdadero si el usuario tiene un rol activo. */
export const useIsAuthenticated = (): boolean =>
  useAuthStore((s) => s.user !== null)

// ─── CARRITO ──────────────────────────────────────────────────

/** Items del carrito con sus acciones. */
export const useCart = () => {
  const cart = useAppStore((s) => s.cart)
  const addToCart = useAppStore((s) => s.addToCart)
  const removeFromCart = useAppStore((s) => s.removeFromCart)
  const updateCartItemQty = useAppStore((s) => s.updateCartItemQty)
  const clearCart = useAppStore((s) => s.clearCart)

  const totalItems = cart.reduce((acc, i) => acc + i.cantidad, 0)
  const totalPrice = cart.reduce((acc, i) => acc + i.plato.precio * i.cantidad, 0)

  return {
    cart,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateCartItemQty,
    clearCart,
  }
}

/** Cantidad de un plato específico en el carrito (para badges). */
export const useCartItemQty = (platoId: string): number =>
  useAppStore((s) => s.cart.find((i: CartItem) => i.plato.id === platoId)?.cantidad ?? 0)

// ─── PLATOS ───────────────────────────────────────────────────

/** Todos los platos del menú. */
export const usePlatos = (): Plato[] =>
  useAppStore((s) => s.platos)

/** Solo los platos disponibles. */
export const usePlatosDisponibles = (): Plato[] =>
  useAppStore(
    useShallow((s) => s.platos.filter((p: Plato) => p.disponible))
  )

/** Platos filtrados por categoría (undefined = todos). */
export const usePlatosByCategoria = (categoria?: string): Plato[] =>
  useAppStore(
    useShallow((s) =>
      categoria
        ? s.platos.filter((p: Plato) => p.categoria === categoria && p.disponible)
        : s.platos.filter((p: Plato) => p.disponible)
    )
  )

// ─── RESERVAS ─────────────────────────────────────────────────

/** Todas las reservas. */
export const useReservas = (): Reserva[] =>
  useAppStore((s) => s.reservas)

/** Reservas del usuario actualmente logueado. */
export const useMyReservas = (): Reserva[] => {
  const userId = useAuthStore((s) => s.user?.id)
  return useAppStore(
    useShallow((s) =>
      userId ? s.reservas.filter((r: Reserva) => r.userId === userId) : []
    )
  )
}

// ─── PEDIDOS ─────────────────────────────────────────────────

/** Todos los pedidos. */
export const usePedidos = () =>
  useAppStore((s) => s.pedidos)

/** Pedidos asignados al delivery activo. */
export const useMyPedidos = () => {
  const deliveryId = useAuthStore((s) => s.user?.id)
  return useAppStore(
    useShallow((s) =>
      deliveryId
        ? s.pedidos.filter((p) => p.deliveryId === deliveryId)
        : []
    )
  )
}

/** Pedidos sin asignar (estado 'nuevo' y sin deliveryId). */
export const usePedidosSinAsignar = () =>
  useAppStore(
    useShallow((s) => s.pedidos.filter((p) => p.estado === 'nuevo' && !p.deliveryId))
  )

// ─── MESAS ───────────────────────────────────────────────────

/** Todas las mesas del restaurante. */
export const useMesas = () =>
  useAppStore((s) => s.mesas)

/** Conteo de mesas por estado (para KPIs del admin). */
export const useMesasStats = () =>
  useAppStore(
    useShallow((s) => ({
      total: s.mesas.length,
      libres: s.mesas.filter((m) => m.estado === 'libre').length,
      ocupadas: s.mesas.filter((m) => m.estado === 'ocupada').length,
      reservadas: s.mesas.filter((m) => m.estado === 'reservada').length,
    }))
  )

