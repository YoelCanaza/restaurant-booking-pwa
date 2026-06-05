import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PackageOpen } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useToastStore } from '../../store/useToastStore'
import { useCurrentUser } from '../../hooks'
import { visualPedido } from '../../lib/estados'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import StatusPill from '../../components/ui/StatusPill'
import OrderTracker from '../../components/cliente/OrderTracker'

export default function MyOrdersPage() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const cancelarPedidoDelivery = useAppStore((s) => s.cancelarPedidoDelivery)
  const addToast = useToastStore((s) => s.addToast)

  // Pedidos de delivery del cliente logueado (por clienteId).
  const pedidos = useAppStore((s) => s.pedidos).filter(
    (p) => p.tipo === 'delivery' && p.clienteId === user?.id
  )

  const handleCancelar = (pedidoId: string) => {
    const r = cancelarPedidoDelivery(pedidoId, user?.id ?? '', 'cliente')
    addToast(r.ok ? 'Pedido cancelado' : r.error ?? 'No se pudo cancelar', r.ok ? 'warning' : 'error')
  }

  // Ordenar los más recientes primero
  const pedidosOrdenados = [...pedidos].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="flex flex-col min-h-full bg-bone px-6 pt-6 pb-24">
      <PageHeader title="Mis Pedidos" subtitle="Sigue tus delivery en tiempo real" eyebrow="Cliente" className="mb-6" />

      {pedidosOrdenados.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="Aún no tienes pedidos"
          description="¿Se te antoja un Chupe de Camarones o una Trucha a la plancha?"
          action={
            <Button size="lg" onClick={() => navigate('/cliente/menu')}>
              Pedir Delivery Ahora
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {pedidosOrdenados.map((pedido, i) => (
            <motion.div 
              key={pedido.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-carbon/[0.08]"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-bold text-carbon/50 uppercase tracking-wider mb-1">
                    {new Date(pedido.createdAt).toLocaleDateString()}
                  </p>
                  <p className="font-display font-bold text-carbon text-lg">Pedido {pedido.id.replace('ped_', '#')}</p>
                </div>
                <StatusPill visual={visualPedido(pedido.estado)} />
              </div>

              {/* Order Tracker for active orders */}
              {pedido.estado !== 'entregado' && (
                <div className="mb-4 -mx-2">
                  <OrderTracker estado={pedido.estado as any} />
                </div>
              )}

              <div className="py-3 border-y border-border/40 my-3 flex flex-col gap-2.5">
                {pedido.items.map((item) => (
                  <div key={item.platoId} className="flex justify-between text-sm">
                    <span className="text-carbon/80">
                      <span className="font-bold mr-2 text-carbon">{item.cantidad}x</span>
                      {item.nombre}
                    </span>
                    <span className="font-bold text-carbon">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-bold text-carbon/60">Total</span>
                <span className="text-xl font-extrabold text-terracotta">S/ {pedido.total.toFixed(2)}</span>
              </div>

              {pedido.estado === 'nuevo' && (
                <button
                  onClick={() => handleCancelar(pedido.id)}
                  className="mt-3 w-full h-10 rounded-xl border border-error/30 text-error text-sm font-semibold hover:bg-error hover:text-white transition-colors"
                >
                  Cancelar pedido
                </button>
              )}
              {pedido.estado === 'preparando' && (
                <p className="mt-3 text-[11px] text-carbon/45 text-center">
                  Ya está en preparación; para cancelar, contacta al restaurante.
                </p>
              )}
            </motion.div>
          ))}
          
          <Button 
            variant="ghost" 
            className="mt-2 h-14 border border-border/60" 
            onClick={() => navigate('/cliente/menu')}
          >
            Hacer Nuevo Pedido
          </Button>
        </div>
      )}
    </div>
  )
}
