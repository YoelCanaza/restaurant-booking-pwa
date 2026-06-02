import { useState } from 'react'
import { Package, Store, Bike, Ban, UserCheck } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useToastStore } from '../../store/useToastStore'
import { useCurrentUser } from '../../hooks'
import { visualPedido } from '../../lib/estados'
import type { EstadoPedido } from '../../types'
import PageHeader from '../../components/ui/PageHeader'
import Panel, { PanelRow } from '../../components/ui/Panel'
import StatusPill from '../../components/ui/StatusPill'
import EmptyState from '../../components/ui/EmptyState'
import Chip from '../../components/ui/Chip'

const FILTROS: { id: EstadoPedido | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'nuevo', label: 'Nuevos' },
  { id: 'preparando', label: 'Preparando' },
  { id: 'en_camino', label: 'En camino' },
  { id: 'entregado', label: 'Entregados' },
]

export default function OrdersAdminPage() {
  const user = useCurrentUser()
  const pedidos = useAppStore((s) => s.pedidos)
  const mesas = useAppStore((s) => s.mesas)
  const asignarDelivery = useAppStore((s) => s.asignarDelivery)
  const cancelarPedidoDelivery = useAppStore((s) => s.cancelarPedidoDelivery)
  const users = useAuthStore((s) => s.users)
  const addToast = useToastStore((s) => s.addToast)

  const [filtro, setFiltro] = useState<EstadoPedido | 'todos'>('todos')

  const adminId = user?.id ?? ''
  const repartidores = users.filter((u) => u.role === 'delivery' && u.activo)
  const sinAsignar = pedidos.filter((p) => p.tipo === 'delivery' && p.estado === 'nuevo' && !p.deliveryId).length

  const lista = pedidos
    .filter((p) => (filtro === 'todos' ? true : p.estado === filtro))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const nombreMesa = (mesaId?: string) => mesas.find((m) => m.id === mesaId)?.numero
  const nombreRepartidor = (id?: string) => users.find((u) => u.id === id)?.name

  const handleAsignar = (pedidoId: string, deliveryId: string) => {
    if (!deliveryId) return
    asignarDelivery(pedidoId, deliveryId, adminId)
    addToast(`Asignado a ${nombreRepartidor(deliveryId)}`, 'success')
  }
  const handleCancelar = (pedidoId: string) => {
    const r = cancelarPedidoDelivery(pedidoId, adminId, 'admin', true)
    addToast(r.ok ? 'Pedido cancelado' : r.error ?? 'No se pudo cancelar', r.ok ? 'warning' : 'error')
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Administración"
        title="Pedidos"
        subtitle={sinAsignar > 0 ? `${sinAsignar} delivery sin asignar` : 'Sin pedidos pendientes de asignación'}
      />

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Chip key={f.id} label={f.label} selected={filtro === f.id} onClick={() => setFiltro(f.id)} />
        ))}
      </div>

      <Panel flush>
        {lista.length === 0 ? (
          <EmptyState icon={Package} title="Sin pedidos" description="No hay pedidos para este filtro." />
        ) : (
          lista.map((p) => {
            const esDelivery = p.tipo === 'delivery'
            const cancelable = esDelivery && (p.estado === 'nuevo' || p.estado === 'preparando')
            return (
              <PanelRow key={p.id}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${esDelivery ? 'bg-amber/10 text-amber' : 'bg-terracotta/10 text-terracotta'}`}>
                    {esDelivery ? <Bike size={18} /> : <Store size={18} />}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-carbon truncate m-0">
                      {esDelivery ? p.clienteNombre : `Mesa ${nombreMesa(p.mesaId) ?? '—'}`}
                    </p>
                    <p className="text-sm text-carbon/45 m-0 mt-0.5">
                      {esDelivery ? 'Delivery' : 'Salón'} · {p.items.length} ítems · S/ {p.total.toFixed(2)}
                      {p.deliveryId && <span className="inline-flex items-center gap-1 ml-1 text-carbon/55"><UserCheck size={12} /> {nombreRepartidor(p.deliveryId)}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Asignar repartidor (delivery nuevo sin asignar) */}
                  {esDelivery && p.estado === 'nuevo' && !p.deliveryId && (
                    <select
                      defaultValue=""
                      onChange={(e) => handleAsignar(p.id, e.target.value)}
                      className="h-9 rounded-lg border border-carbon/[0.08] bg-white px-2.5 text-sm font-medium text-carbon focus:outline-none focus:border-terracotta"
                      aria-label="Asignar repartidor"
                    >
                      <option value="" disabled>Asignar repartidor…</option>
                      {repartidores.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  )}

                  <StatusPill visual={visualPedido(p.estado)} />

                  {cancelable && (
                    <button
                      aria-label="Cancelar pedido"
                      onClick={() => handleCancelar(p.id)}
                      className="w-9 h-9 rounded-lg border border-carbon/[0.08] flex items-center justify-center text-carbon/50 hover:bg-error hover:text-white hover:border-error transition-colors"
                    >
                      <Ban size={15} />
                    </button>
                  )}
                </div>
              </PanelRow>
            )
          })
        )}
      </Panel>
    </div>
  )
}
