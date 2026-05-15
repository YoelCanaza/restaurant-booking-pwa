import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PackageOpen } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useCurrentUser } from '../../hooks'
import Button from '../../components/ui/Button'
import Chip from '../../components/ui/Chip'
import OrderTracker from '../../components/cliente/OrderTracker'

export default function MyOrdersPage() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  
  // En una BD real filtraríamos por user.id. 
  // En nuestro mock filtramos por nombre para que coincida con los de prueba.
  const pedidos = useAppStore((s) => s.pedidos).filter((p) => p.clienteNombre === user?.name)

  // Ordenar los más recientes primero
  const pedidosOrdenados = [...pedidos].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="flex flex-col min-h-full bg-bone px-6 pt-6 pb-24">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[1.75rem] font-extrabold text-carbon tracking-tight mb-6"
      >
        Mis Pedidos 🛵
      </motion.h2>

      {pedidosOrdenados.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center flex-1 py-12 text-center"
        >
          <div className="w-24 h-24 bg-carbon/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <PackageOpen size={48} className="text-carbon/30" />
          </div>
          <h3 className="text-xl font-bold text-carbon mb-2">Aún no tienes pedidos</h3>
          <p className="text-carbon/60 mb-8 max-w-[260px] leading-relaxed">
            ¿Se te antoja un Chupe de Camarones o una Trucha a la plancha?
          </p>
          <Button size="lg" onClick={() => navigate('/cliente/menu')}>
            Pedir Delivery Ahora
          </Button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-5">
          {pedidosOrdenados.map((pedido, i) => (
            <motion.div 
              key={pedido.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-border/40"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-bold text-carbon/50 uppercase tracking-wider mb-1">
                    {new Date(pedido.createdAt).toLocaleDateString()}
                  </p>
                  <p className="font-extrabold text-carbon text-lg">Pedido {pedido.id.replace('ped_', '#')}</p>
                </div>
                <Chip 
                  label={pedido.estado.replace('_', ' ')} 
                  selected={pedido.estado !== 'entregado'}
                />
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
                <span className="text-sm font-bold text-carbon/60">Total Pagado</span>
                <span className="text-xl font-extrabold text-terracotta">S/ {pedido.total.toFixed(2)}</span>
              </div>
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
