import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, ShoppingBag } from 'lucide-react'
import { useCurrentUser } from '../../hooks'
import Button from '../../components/ui/Button'

export default function ClientHome() {
  const user = useCurrentUser()
  const navigate = useNavigate()

  return (
    <div className="p-6 flex flex-col gap-8 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        <h2 className="text-[1.75rem] font-extrabold text-carbon leading-tight tracking-tight">
          Hola, <span className="text-terracotta">{user?.name?.split(' ')[0] || 'Cliente'}</span> 👋
        </h2>
        <p className="text-carbon/60 mt-1.5 text-base font-medium">¿Qué te apetece hoy?</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col gap-5 mt-2"
      >
        {/* Botón Reservar */}
        <Button 
          variant="primary" 
          fullWidth 
          onClick={() => navigate('/cliente/reserva')}
          style={{ height: 80 }}
          className="rounded-2xl shadow-lg shadow-terracotta/25 flex flex-col items-center justify-center gap-1.5"
        >
          <div className="flex items-center gap-2">
            <Calendar size={22} strokeWidth={2.5} />
            <span className="text-lg">Reservar Mesa</span>
          </div>
        </Button>

        {/* Botón Delivery */}
        <Button 
          variant="secondary" 
          fullWidth 
          onClick={() => navigate('/cliente/menu')}
          style={{ height: 80 }}
          className="rounded-2xl shadow-lg shadow-carbon/10 flex flex-col items-center justify-center gap-1.5"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={22} strokeWidth={2.5} />
            <span className="text-lg">Pedir Delivery</span>
          </div>
        </Button>

        {/* Accesos Rápidos a Historial */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/cliente/reservas')}
            className="h-14 border border-border/60 bg-white shadow-sm flex gap-2 rounded-xl"
          >
            <Calendar size={18} className="text-terracotta" />
            Mis Reservas
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/cliente/pedidos')}
            className="h-14 border border-border/60 bg-white shadow-sm flex gap-2 rounded-xl"
          >
            <ShoppingBag size={18} className="text-terracotta" />
            Mis Pedidos
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
