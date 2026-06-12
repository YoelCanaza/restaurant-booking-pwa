/**
 * ============================================================
 * Sincronización Supabase ↔ stores (hidratación + realtime)
 * ============================================================
 * - hidratarDesdeSupabase(): carga el estado completo de la DB a
 *   los stores al arrancar la app (reemplaza los MOCK_*).
 * - suscribirRealtime(): aplica al store los cambios hechos desde
 *   otros dispositivos (mesero → cocina → caja en vivo).
 * - Escucha 'rincon:syncerror' (emitido por db.ts): muestra toast
 *   y re-hidrata para volver al estado real del servidor.
 */
import { supabase } from './supabase'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'
import { useToastStore } from '../store/useToastStore'
import {
  rowToUser,
  rowToPlato,
  rowToMesa,
  rowToReserva,
  rowToPedido,
  rowToLog,
  type UsuarioRow,
  type PlatoRow,
  type MesaRow,
  type ReservaRow,
  type PedidoRow,
  type ActivityLogRow,
} from './adapters'

const SELECT_PEDIDO = '*, pedido_items(*)'

// ─── Hidratación inicial ─────────────────────────────────────
export async function hidratarDesdeSupabase(): Promise<boolean> {
  const [usuarios, platos, mesas, reservas, pedidos, logs] = await Promise.all([
    supabase.from('usuarios').select('*'),
    supabase.from('platos').select('*'),
    supabase.from('mesas').select('*').order('numero'),
    supabase.from('reservas').select('*'),
    supabase.from('pedidos').select(SELECT_PEDIDO).order('created_at'),
    supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(200),
  ])

  const errores = [usuarios, platos, mesas, reservas, pedidos, logs].filter((r) => r.error)
  if (errores.length > 0) {
    console.error('[sync] Error al hidratar:', errores.map((e) => e.error?.message).join(' · '))
    return false
  }

  useAppStore.setState({
    platos: (platos.data as PlatoRow[]).map(rowToPlato),
    mesas: (mesas.data as MesaRow[]).map(rowToMesa),
    reservas: (reservas.data as ReservaRow[]).map(rowToReserva),
    pedidos: (pedidos.data as PedidoRow[]).map(rowToPedido),
    activityLogs: (logs.data as ActivityLogRow[]).map(rowToLog).reverse(),
  })
  useAuthStore.setState({ users: (usuarios.data as UsuarioRow[]).map(rowToUser) })
  return true
}

// ─── Helpers de upsert al store ──────────────────────────────
function upsertById<T extends { id: string }>(lista: T[], item: T): T[] {
  const idx = lista.findIndex((x) => x.id === item.id)
  if (idx === -1) return [...lista, item]
  const copia = [...lista]
  copia[idx] = item
  return copia
}

async function refetchPedido(pedidoId: string) {
  const { data, error } = await supabase
    .from('pedidos')
    .select(SELECT_PEDIDO)
    .eq('id', pedidoId)
    .single()
  if (error || !data) return
  useAppStore.setState((s) => ({ pedidos: upsertById(s.pedidos, rowToPedido(data as PedidoRow)) }))
}

// ─── Realtime ────────────────────────────────────────────────
export function suscribirRealtime() {
  const canal = supabase
    .channel('rincon-andino')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
      if (payload.eventType === 'DELETE') return // el dominio no borra pedidos
      // Refetch con items (el payload no trae la relación)
      void refetchPedido((payload.new as PedidoRow).id)
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedido_items' }, (payload) => {
      const pedidoId = (payload.new as { pedido_id: string }).pedido_id
      void refetchPedido(pedidoId)
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mesas' }, (payload) => {
      if (payload.eventType === 'DELETE') return
      const mesa = rowToMesa(payload.new as MesaRow)
      useAppStore.setState((s) => ({ mesas: upsertById(s.mesas, mesa) }))
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas' }, (payload) => {
      if (payload.eventType === 'DELETE') return
      const reserva = rowToReserva(payload.new as ReservaRow)
      useAppStore.setState((s) => ({ reservas: upsertById(s.reservas, reserva) }))
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'platos' }, (payload) => {
      if (payload.eventType === 'DELETE') {
        const id = (payload.old as { id: string }).id
        useAppStore.setState((s) => ({ platos: s.platos.filter((p) => p.id !== id) }))
        return
      }
      const plato = rowToPlato(payload.new as PlatoRow)
      useAppStore.setState((s) => ({ platos: upsertById(s.platos, plato) }))
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios' }, (payload) => {
      if (payload.eventType === 'DELETE') return // el dominio no borra usuarios
      const usuario = rowToUser(payload.new as UsuarioRow)
      useAuthStore.setState((s) => ({ users: upsertById(s.users, usuario) }))
    })
    .subscribe()

  return () => {
    void supabase.removeChannel(canal)
  }
}

// ─── Corrección ante errores de escritura ────────────────────
let escuchandoErrores = false
export function escucharErroresDeSync() {
  if (escuchandoErrores) return
  escuchandoErrores = true
  window.addEventListener('rincon:syncerror', (e) => {
    const detail = (e as CustomEvent).detail as { op: string; error: string }
    console.warn('[sync] Escritura fallida, re-hidratando:', detail)
    useToastStore
      .getState()
      .addToast('No se pudo guardar un cambio. Sincronizando con el servidor…', 'error')
    void hidratarDesdeSupabase()
  })
}
