/**
 * ============================================================
 * Capa de escritura a Supabase (write-through del store)
 * ============================================================
 * Las acciones del store mutan el estado local de forma síncrona
 * (UI instantánea) y llaman a estas funciones para persistir en
 * Supabase en segundo plano.
 *
 * - Cola serializada: las escrituras se ejecutan en orden de
 *   invocación (evita carreras de FK, ej. usuario invitado →
 *   reserva, o pedido → items).
 * - En error: se notifica vía evento 'rincon:syncerror' (el módulo
 *   sync.ts escucha, muestra toast y re-hidrata para corregir).
 * - Este módulo NO importa stores (evita ciclos de import).
 */
import { supabase } from './supabase'
import {
  userToRow,
  platoToRow,
  reservaToRow,
  pedidoToRow,
  pedidoItemToRow,
  logToRow,
} from './adapters'
import type { User, Plato, Mesa, Reserva, Pedido, ActivityLog } from '../types'

// ─── Cola serializada de escrituras ──────────────────────────
let cola: Promise<void> = Promise.resolve()

function encolar(nombre: string, op: () => PromiseLike<{ error: { message: string } | null }>) {
  cola = cola.then(async () => {
    try {
      const { error } = await op()
      if (error) {
        console.error(`[db] ${nombre}:`, error.message)
        window.dispatchEvent(new CustomEvent('rincon:syncerror', { detail: { op: nombre, error: error.message } }))
      }
    } catch (e) {
      console.error(`[db] ${nombre}:`, e)
      window.dispatchEvent(new CustomEvent('rincon:syncerror', { detail: { op: nombre, error: String(e) } }))
    }
  })
  return cola
}

// ─── Usuarios ────────────────────────────────────────────────
export const dbUpsertUsuario = (u: User) =>
  encolar('upsert usuario', () => supabase.from('usuarios').upsert(userToRow(u)))

export const dbUpdateUsuario = (id: string, patch: Partial<ReturnType<typeof userToRow>>) =>
  encolar('update usuario', () => supabase.from('usuarios').update(patch).eq('id', id))

// ─── Platos ──────────────────────────────────────────────────
export const dbUpsertPlato = (p: Plato) =>
  encolar('upsert plato', () => supabase.from('platos').upsert(platoToRow(p)))

export const dbUpdatePlato = (id: string, patch: Partial<ReturnType<typeof platoToRow>>) =>
  encolar('update plato', () => supabase.from('platos').update(patch).eq('id', id))

export const dbDeletePlato = (id: string) =>
  encolar('delete plato', () => supabase.from('platos').delete().eq('id', id))

// ─── Mesas ───────────────────────────────────────────────────
export const dbUpdateMesa = (m: Mesa) =>
  encolar('update mesa', () =>
    supabase
      .from('mesas')
      .update({
        estado: m.estado,
        reserva_id: m.reservaId ?? null,
        pedido_id: m.pedidoId ?? null,
      })
      .eq('id', m.id)
  )

// ─── Reservas ────────────────────────────────────────────────
export const dbInsertReserva = (r: Reserva) =>
  encolar('insert reserva', () => supabase.from('reservas').insert(reservaToRow(r)))

export const dbUpdateReserva = (r: Reserva) =>
  encolar('update reserva', () =>
    supabase
      .from('reservas')
      .update({
        estado: r.estado,
        mesa_id: r.mesaId ?? null,
        cancelado_at: r.canceladoAt ?? null,
        motivo_cancelacion: r.motivoCancelacion ?? null,
      })
      .eq('id', r.id)
  )

// ─── Pedidos ─────────────────────────────────────────────────
export const dbInsertPedido = (p: Pedido) => {
  encolar('insert pedido', () => supabase.from('pedidos').insert(pedidoToRow(p)))
  return encolar('insert items', () =>
    supabase.from('pedido_items').insert(p.items.map((it) => pedidoItemToRow(p.id, it)))
  )
}

export const dbUpdatePedido = (p: Pedido) =>
  encolar('update pedido', () =>
    supabase
      .from('pedidos')
      .update({
        estado: p.estado,
        metodo_pago: p.metodoPago ?? null,
        delivery_id: p.deliveryId ?? null,
        notas: p.notas ?? null,
        updated_at: p.updatedAt ?? new Date().toISOString(),
      })
      .eq('id', p.id)
  )

// ─── Activity log ────────────────────────────────────────────
export const dbInsertLog = (l: ActivityLog) =>
  encolar('insert log', () => supabase.from('activity_logs').insert(logToRow(l)))

/** Espera a que la cola de escrituras termine (útil en tests/debug). */
export const dbFlush = () => cola
