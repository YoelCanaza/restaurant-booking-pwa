import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CalendarX2, Users, Clock, Calendar as CalendarIcon } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useToastStore } from '../../store/useToastStore'
import { useCurrentUser } from '../../hooks'
import { visualReserva } from '../../lib/estados'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import StatusPill from '../../components/ui/StatusPill'

export default function MyReservationsPage() {
  const user = useCurrentUser()
  const navigate = useNavigate()

  const reservas = useAppStore((s) => s.reservas).filter((r) => r.userId === user?.id)
  const cancelarReservaCliente = useAppStore((s) => s.cancelarReservaCliente)
  const addToast = useToastStore((s) => s.addToast)

  const handleCancelar = (reservaId: string) => {
    if (!user) return
    const result = cancelarReservaCliente(reservaId, user.id)
    if (result.ok) {
      addToast('Reserva cancelada', 'success')
    } else {
      addToast(result.error ?? 'No se pudo cancelar la reserva', 'error')
    }
  }

  const reservasOrdenadas = [...reservas].sort((a, b) => 
    new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime()
  )

  return (
    <div className="flex flex-col min-h-full bg-bone px-6 pt-6 pb-24">
      <PageHeader title="Mis Reservas" subtitle="Tus mesas reservadas en Rincón Andino" eyebrow="Cliente" className="mb-6" />

      {reservasOrdenadas.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="No tienes reservas"
          description="Asegura tu mesa para disfrutar de la mejor gastronomía puneña sin hacer filas."
          action={
            <Button size="lg" onClick={() => navigate('/cliente/reserva')}>
              Hacer una Reserva
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {reservasOrdenadas.map((reserva, i) => (
            <motion.div 
              key={reserva.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-carbon/[0.08]"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-display font-bold text-carbon text-lg">Reserva {reserva.id.replace('res_', '#')}</p>
                  {reserva.estado === 'pendiente' && (
                    <p className="text-[11px] text-carbon/60 font-bold uppercase tracking-wider mt-0.5">Esperando confirmación del local</p>
                  )}
                  {reserva.estado === 'confirmada' && (
                    <p className="text-[11px] text-terracotta font-bold uppercase tracking-wider mt-0.5">¡Mesa separada para ti!</p>
                  )}
                </div>
                <StatusPill visual={visualReserva(reserva.estado)} />
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
                    onClick={() => handleCancelar(reserva.id)}
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
