import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Minus, Plus, MapPin, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { useCurrentUser } from '../../hooks'
import Button from '../ui/Button'

interface CartDrawerProps {
  onSuccess?: () => void
}

export default function CartDrawer({ onSuccess }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [direccion, setDireccion] = useState('')
  const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'yape'>('tarjeta')
  
  const user = useCurrentUser()
  const navigate = useNavigate()
  
  const cart = useAppStore((s) => s.cart)
  const clearCart = useAppStore((s) => s.clearCart)
  const updateQty = useAppStore((s) => s.updateCartItemQty)
  const addPedido = useAppStore((s) => s.addPedido)

  const cartTotal = cart.reduce((acc, item) => acc + item.plato.precio * item.cantidad, 0)
  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0)

  const handleOrder = () => {
    if (!direccion) return

    addPedido({
      id: `ped_${Date.now()}`,
      clienteNombre: user?.name || 'Cliente',
      clienteTelefono: user?.phone || '999999999',
      items: cart.map((item) => ({
        platoId: item.plato.id,
        nombre: item.plato.nombre,
        precio: item.plato.precio,
        cantidad: item.cantidad
      })),
      total: cartTotal,
      direccion,
      estado: 'nuevo',
      createdAt: new Date().toISOString()
    })

    clearCart()
    setIsOpen(false)
    if (onSuccess) {
      onSuccess()
    } else {
      navigate('/cliente/success-delivery')
    }
  }

  return (
    <>
      {/* ── FAB (Floating Action Button) ──────────────── */}
      <AnimatePresence>
        {cartCount > 0 && !isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[84px] right-6 w-14 h-14 bg-carbon text-white rounded-full flex items-center justify-center shadow-xl shadow-carbon/40 z-40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-carbon"
            aria-label="Ver carrito"
          >
            <ShoppingCart size={24} />
            <motion.div 
              key={cartCount}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-terracotta text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-bone shadow-sm"
            >
              {cartCount}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Bottom Sheet Backdrop ─────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-carbon/60 backdrop-blur-[2px] z-50"
          />
        )}
      </AnimatePresence>

      {/* ── Bottom Sheet Content ──────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) setIsOpen(false)
            }}
            className="fixed bottom-0 left-0 right-0 bg-bone z-50 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden"
            style={{ 
              maxWidth: 448, 
              margin: '0 auto',
              maxHeight: '85dvh' // Utiliza dynamic viewport height para móviles
            }}
          >
            {/* Grabber para indicar que se puede deslizar hacia abajo */}
            <div className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-border/60 rounded-full" />
            </div>

            <div className="px-6 pb-4 flex justify-between items-center border-b border-border/40">
              <h2 className="text-xl font-bold text-carbon flex items-center gap-2">
                <ShoppingCart size={22} className="text-terracotta" />
                Tu Pedido
              </h2>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button 
                    onClick={clearCart}
                    className="px-3 py-1.5 text-xs font-bold text-error/80 hover:text-error hover:bg-error/10 rounded-lg transition-colors mr-1"
                  >
                    Vaciar
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 bg-border/40 rounded-full text-carbon/60 hover:bg-border/60 transition-colors"
                  aria-label="Cerrar carrito"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="text-center text-carbon/40 py-12">
                  <ShoppingCart size={56} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No hay platos en tu pedido aún.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {cart.map((item) => (
                    <div key={item.plato.id} className="flex gap-4 items-center bg-white p-3 rounded-2xl shadow-sm border border-border/40">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-bone">
                        <img src={item.plato.imageUrl} alt={item.plato.nombre} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="font-bold text-carbon text-sm leading-tight line-clamp-2 mb-1">{item.plato.nombre}</span>
                        <span className="text-terracotta font-extrabold text-sm">S/ {(item.plato.precio * item.cantidad).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-bone border border-border/60 rounded-full p-1 shadow-inner">
                        <motion.button 
                          whileTap={{ scale: 0.8 }}
                          onClick={() => updateQty(item.plato.id, item.cantidad - 1)} 
                          className="text-carbon p-1.5 bg-white rounded-full shadow-sm"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </motion.button>
                        <span className="font-bold text-sm w-4 text-center text-carbon">{item.cantidad}</span>
                        <motion.button 
                          whileTap={{ scale: 0.8 }}
                          onClick={() => updateQty(item.plato.id, item.cantidad + 1)} 
                          className="text-carbon p-1.5 bg-white rounded-full shadow-sm"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario Dirección */}
              {cart.length > 0 && (
                <div className="mt-8 flex flex-col gap-2 relative">
                  <label className="text-xs font-bold text-carbon/60 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                    <MapPin size={14} /> Dirección de entrega
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej. Jr. Lima 123, Ref: Casa azul"
                    className="w-full h-14 bg-white border border-border/60 rounded-xl px-4 text-carbon focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors shadow-sm text-base"
                  />
                </div>
              )}

              {/* Método de Pago */}
              {cart.length > 0 && (
                <div className="mt-6 flex flex-col gap-3 relative">
                  <label className="text-xs font-bold text-carbon/60 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                    <Wallet size={14} /> Método de pago
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setMetodoPago('tarjeta')}
                      className={`h-12 rounded-xl text-sm font-bold border transition-colors ${
                        metodoPago === 'tarjeta' 
                          ? 'border-terracotta bg-terracotta/10 text-terracotta' 
                          : 'border-border/60 bg-white text-carbon/70'
                      }`}
                    >
                      Tarjeta
                    </button>
                    <button
                      onClick={() => setMetodoPago('yape')}
                      className={`h-12 rounded-xl text-sm font-bold border transition-colors ${
                        metodoPago === 'yape' 
                          ? 'border-terracotta bg-terracotta/10 text-terracotta' 
                          : 'border-border/60 bg-white text-carbon/70'
                      }`}
                    >
                      Yape / Plin
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Total y Botón */}
            {cart.length > 0 && (
              <div className="p-5 bg-white border-t border-border/40 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] flex-shrink-0 z-10 pb-8 relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-carbon/60 font-medium text-lg">Total a pagar</span>
                  <span className="text-2xl font-extrabold text-carbon">S/ {cartTotal.toFixed(2)}</span>
                </div>
                <Button 
                  fullWidth 
                  size="lg" 
                  onClick={handleOrder}
                  disabled={!direccion || direccion.length < 5}
                  className="h-14 text-lg shadow-lg shadow-terracotta/20 relative z-50 pointer-events-auto"
                >
                  Confirmar y Pagar
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
