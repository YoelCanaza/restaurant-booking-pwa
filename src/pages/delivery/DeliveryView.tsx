import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '../../store/useAppStore'
import OrderCard from '../../components/delivery/OrderCard'

// Mock current delivery ID – must match MOCK_USERS delivery id in useAuthStore
const CURRENT_DELIVERY_ID = 'usr_delivery_01'

export default function DeliveryView() {
  const pedidos = useAppStore(
    useShallow((state) =>
      state.pedidos.filter((p) => p.deliveryId === CURRENT_DELIVERY_ID)
    )
  )

  const hasPedidos = pedidos.length > 0

  return (
    <div className="flex flex-col min-h-full bg-bone pb-8">
      <div className="px-6 py-6 bg-terracotta text-white rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-extrabold tracking-tight">Mis Pedidos</h1>
        <p className="text-white/70 mt-1">Repartidor: {CURRENT_DELIVERY_ID}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {hasPedidos ? (
          <div className="flex flex-col gap-4">
            {pedidos.map((pedido) => (
              <OrderCard key={pedido.id} pedido={pedido} />
            ))}
          </div>
        ) : (
          <p className="text-center text-carbon/50 py-8">
            No tienes pedidos asignados.
          </p>
        )}
      </div>
    </div>
  )
}
