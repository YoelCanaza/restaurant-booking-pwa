import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users, Grid3X3, Package, DollarSign,
  TrendingUp, Clock, ChevronRight,
  Check, X
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useToastStore } from '../../store/useToastStore'
import { useCurrentUser } from '../../hooks'
import Chip from '../../components/ui/Chip'
import Button from '../../components/ui/Button'

export default function AdminDashboard() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const updateReservaEstado = useAppStore((s) => s.updateReservaEstado)
  const addToast = useToastStore((s) => s.addToast)

  // ─── LÓGICA DE DATOS ───────────────────────────────────────
  const reservas = useAppStore((s) => s.reservas)
  const pedidos = useAppStore((s) => s.pedidos)
  const mesas = useAppStore((s) => s.mesas)

  const todayStr = new Date().toISOString().split('T')[0]

  // KPIs
  const reservasHoy = reservas.filter((r) => r.fecha === todayStr).length
  const mesasOcupadas = mesas.filter((m) => m.estado === 'ocupada').length
  const pedidosActivos = pedidos.filter((p) => p.estado === 'nuevo' || p.estado === 'preparando' || p.estado === 'en_camino').length
  
  // Ingresos del día (pedidos de hoy, independientemente de si están entregados o en camino)
  const ingresosHoy = pedidos
    .filter((p) => p.createdAt.startsWith(todayStr))
    .reduce((sum, p) => sum + p.total, 0)

  // Listas resumidas
  const ultimosPedidos = [...pedidos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  const ultimasReservas = [...reservas]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  // ─── RENDER ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-bone pb-24">
      {/* Header */}
      <div className="px-6 py-8 bg-carbon text-white rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold tracking-tight"
          >
            Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 font-medium text-sm mt-1"
          >
            Hola, {user?.name.split(' ')[0]}
          </motion.p>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            icon={DollarSign} 
            title="Ingresos Hoy" 
            value={`S/ ${ingresosHoy.toFixed(2)}`} 
            color="text-[#22c55e]" 
            delay={0.1}
          />
          <StatCard 
            icon={Package} 
            title="Delivery Activo" 
            value={pedidosActivos.toString()} 
            color="text-amber-500" 
            delay={0.2}
          />
          <StatCard 
            icon={Users} 
            title="Reservas Hoy" 
            value={reservasHoy.toString()} 
            color="text-terracotta" 
            delay={0.3}
          />
          <StatCard 
            icon={Grid3X3} 
            title="Mesas Ocupadas" 
            value={`${mesasOcupadas}/${mesas.length}`} 
            color="text-blue-500" 
            delay={0.4}
          />
        </div>
      </div>

      {/* Pedidos Recientes */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-carbon">Últimos Pedidos</h3>
        </div>
        <div className="flex flex-col gap-3">
          {ultimosPedidos.length > 0 ? ultimosPedidos.map((pedido, i) => (
            <motion.div
              key={pedido.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-border/40 flex justify-between items-center"
            >
              <div className="flex flex-col">
                <span className="font-bold text-carbon text-sm">{pedido.clienteNombre}</span>
                <span className="text-xs text-carbon/50 font-medium">S/ {pedido.total.toFixed(2)} • {pedido.items.length} ítems</span>
              </div>
              <Chip 
                label={pedido.estado.replace('_', ' ')} 
                selected={pedido.estado === 'nuevo' || pedido.estado === 'preparando'}
              />
            </motion.div>
          )) : (
            <p className="text-sm text-carbon/50 text-center py-4 bg-white rounded-2xl border border-border/40">No hay pedidos recientes</p>
          )}
        </div>
      </div>

      {/* Reservas Recientes */}
      <div className="px-6 mt-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-carbon">Últimas Reservas</h3>
          <button 
            onClick={() => navigate('/admin/mesas')}
            className="text-sm font-bold text-terracotta flex items-center gap-1"
          >
            Ver plano <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {ultimasReservas.length > 0 ? ultimasReservas.map((res, i) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-border/40 flex justify-between items-center"
            >
              <div className="flex flex-col">
                <span className="font-bold text-carbon text-sm">{res.nombre}</span>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-carbon/50 font-medium">
                  <Clock size={12} /> {res.fecha} • {res.hora} • {res.personas} pax
                </div>
              </div>
              
              {res.estado === 'pendiente' ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      updateReservaEstado(res.id, 'cancelada')
                      addToast('Reserva rechazada', 'warning')
                    }}
                    className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center text-carbon/60 hover:bg-[#ef4444] hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      updateReservaEstado(res.id, 'confirmada')
                      addToast('Reserva confirmada', 'success')
                    }}
                    className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta hover:bg-terracotta hover:text-white transition-colors"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <Chip 
                  label={res.estado} 
                  selected={false}
                />
              )}
            </motion.div>
          )) : (
            <p className="text-sm text-carbon/50 text-center py-4 bg-white rounded-2xl border border-border/40">No hay reservas recientes</p>
          )}
        </div>
      </div>

      {/* Historial Completo */}
      <div className="px-6 mt-8">
        <Button variant="secondary" fullWidth className="h-14 font-bold">
          Ver Historial Completo
        </Button>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, title, value, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-4 rounded-2xl shadow-sm border border-border/40 flex flex-col"
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-bone ${color}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <TrendingUp size={16} className="text-carbon/20" />
      </div>
      <p className="text-2xl font-extrabold text-carbon leading-tight tracking-tight">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wider text-carbon/50 mt-1">{title}</p>
    </motion.div>
  )
}
