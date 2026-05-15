import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CalendarX2, Users, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useCurrentUser } from '../../hooks'
import Button from '../../components/ui/Button'
import Chip from '../../components/ui/Chip'

export default function MyReservationsPage() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  
  const reservas = useAppStore((s) => s.reservas).filter((r) => r.userId === user?.id)
  const updateReservaEstado = useAppStore((s) => s.updateReservaEstado)

  const reservasOrdenadas = [...reservas].sort((a, b) => 
    new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime()
  )

  return (
    <div className="flex flex-col min-h-full bg-bone px-6 pt-6 pb-24">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[1.75rem] font-extrabold text-carbon tracking-tight mb-6"
      >
        Mis Reservas 📅
      </motion.h2>

      {reservasOrdenadas.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center flex-1 py-12 text-center"
        >
          <div className="w-24 h-24 bg-carbon/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <CalendarX2 size={48} className="text-carbon/30" />
          </div>
          <h3 className="text-xl font-bold text-carbon mb-2">No tienes reservas</h3>
          <p className="text-carbon/60 mb-8 max-w-[260px] leading-relaxed">
            Asegura tu mesa para disfrutar de la mejor gastronomía puneña sin hacer filas.
          </p>
          <Button size="lg" onClick={() => navigate('/cliente/reserva')}>
            Hacer una Reserva
          </Button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-5">
          {reservasOrdenadas.map((reserva, i) => (
            <motion.div 
              key={reserva.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-border/40"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-extrabold text-carbon text-lg">Reserva {reserva.id.replace('res_', '#')}</p>
                  {reserva.estado === 'pendiente' && (
                    <p className="text-[11px] text-carbon/60 font-bold uppercase tracking-wider mt-0.5">Esperando confirmación del local</p>
                  )}
                  {reserva.estado === 'confirmada' && (
                    <p className="text-[11px] text-terracotta font-bold uppercase tracking-wider mt-0.5">¡Mesa separada para ti!</p>
                  )}
                </div>
                <Chip 
                  label={reserva.estado.replace('_', ' ')} 
                  selected={reserva.estado === 'confirmada'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-bone/50 p-4 rounded-xl mb-4">
                <div className="flex items-center gap-2 text-carbon">
                  <CalendarIcon size={16} className="text-terracotta" />
                  <span className="font-bold text-sm">{new Date(reserva.fecha).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-carbon">
                  <Clock size={16} className="text-terracotta" />
                  <span className="font-bold text-sm">{reserva.hora}</span>
                </div>
                <div className="flex items-center gap-2 text-carbon col-span-2">
                  <Users size={16} className="text-terracotta" />
                  <span className="font-bold text-sm">{reserva.personas} personas</span>
                </div>
              </div>

              {reserva.estado === 'pendiente' && (
                <div className="flex justify-end border-t border-border/40 pt-3 mt-1">
                  <button 
                    onClick={() => updateReservaEstado(reserva.id, 'cancelada')}
                    className="text-sm font-bold text-error/80 hover:text-error transition-colors"
                  >
                    Cancelar Reserva
                  </button>
                </div>
              )}
            </motion.div>
          ))}
          
          <Button 
            variant="ghost" 
            className="mt-2 h-14 border border-border/60" 
            onClick={() => navigate('/cliente/reserva')}
          >
            Hacer Nueva Reserva
          </Button>
        </div>
      )}
    </div>
  )
}
