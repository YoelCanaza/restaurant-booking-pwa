import { useState, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '../../store/useAppStore'
import { useCurrentUser } from '../../hooks'
import OrderCard from '../../components/delivery/OrderCard'
import { WifiOff, Banknote, Package } from 'lucide-react'

function useNetworkStatus() {
  const [isOnline, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  return isOnline
}

export default function DeliveryView() {
  const isOnline = useNetworkStatus()
  const user = useCurrentUser()
  const deliveryId = user?.id ?? 'usr_delivery_01'
  const pedidos = useAppStore(
    useShallow((state) => state.pedidos.filter((p) => p.deliveryId === deliveryId))
  )

  const hasPedidos = pedidos.length > 0

  // Billetera Mock
  const cashCollected = pedidos
    .filter(p => p.estado === 'entregado')
    .reduce((acc, p) => acc + p.total, 0)

  return (
    <div className="flex flex-col min-h-full bg-bone pb-8">
      {/* Indicador Offline */}
      {!isOnline && (
        <div className="bg-red-500 text-white text-sm font-bold flex justify-center items-center gap-2 py-1.5 px-4 shadow-sm z-50">
          <WifiOff size={16} /> Modo sin conexión - Cambios guardados localmente
        </div>
      )}

      {/* Header Container */}
      <div className="bg-terracotta text-white shadow-lg rounded-b-3xl mb-4 md:mb-8">
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-black tracking-tight m-0">Mis Pedidos</h1>
            <p className="text-white/70 mt-1 md:mt-2 text-sm md:text-base font-medium">Repartidor: {user?.name ?? 'Invitado'}</p>
          </div>
          
          {/* Driver Wallet */}
          <div className="bg-white/10 px-4 py-3 rounded-xl flex flex-col items-end md:items-start md:min-w-[180px] border border-white/10 shadow-inner">
            <div className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
              <Banknote size={14} /> Caja del Turno
            </div>
            <div className="text-2xl font-black mt-1">S/ {cashCollected.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <div className="max-w-7xl mx-auto">
          {hasPedidos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="h-full">
                  <OrderCard pedido={pedido} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-carbon/40">
              <Package size={64} strokeWidth={1} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No tienes pedidos asignados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
