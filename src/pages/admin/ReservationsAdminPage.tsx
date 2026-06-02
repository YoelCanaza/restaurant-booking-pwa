import { useState } from 'react'
import { Check, X, UserX, Clock, Users, CalendarCheck } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useToastStore } from '../../store/useToastStore'
import { useCurrentUser } from '../../hooks'
import { visualReserva } from '../../lib/estados'
import type { EstadoReserva } from '../../types'
import PageHeader from '../../components/ui/PageHeader'
import Panel, { PanelRow } from '../../components/ui/Panel'
import StatusPill from '../../components/ui/StatusPill'
import EmptyState from '../../components/ui/EmptyState'
import Chip from '../../components/ui/Chip'

const FILTROS: { id: EstadoReserva | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'confirmada', label: 'Confirmadas' },
  { id: 'cancelada', label: 'Canceladas' },
  { id: 'no_show', label: 'No-show' },
]

export default function ReservationsAdminPage() {
  const user = useCurrentUser()
  const reservas = useAppStore((s) => s.reservas)
  const updateReservaEstado = useAppStore((s) => s.updateReservaEstado)
  const marcarNoShow = useAppStore((s) => s.marcarNoShow)
  const addToast = useToastStore((s) => s.addToast)

  const [filtro, setFiltro] = useState<EstadoReserva | 'todas'>('todas')

  const adminId = user?.id ?? ''
  const pendientes = reservas.filter((r) => r.estado === 'pendiente').length

  const lista = reservas
    .filter((r) => (filtro === 'todas' ? true : r.estado === filtro))
    .sort((a, b) => {
      // Pendientes primero, luego por fecha/hora ascendente
      if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1
      if (b.estado === 'pendiente' && a.estado !== 'pendiente') return 1
      return new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime()
    })

  const confirmar = (id: string) => {
    updateReservaEstado(id, 'confirmada', adminId, 'admin')
    addToast('Reserva confirmada', 'success')
  }
  const rechazar = (id: string) => {
    updateReservaEstado(id, 'cancelada', adminId, 'admin', 'Rechazada por el administrador')
    addToast('Reserva rechazada', 'warning')
  }
  const noShow = (id: string) => {
    marcarNoShow(id, adminId)
    addToast('Registrada como no-show', 'warning')
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Administración"
        title="Reservas"
        subtitle={pendientes > 0 ? `${pendientes} ${pendientes === 1 ? 'reserva pendiente' : 'reservas pendientes'} de atención` : 'Todo al día, sin pendientes'}
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Chip key={f.id} label={f.label} selected={filtro === f.id} onClick={() => setFiltro(f.id)} />
        ))}
      </div>

      <Panel flush>
        {lista.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="Sin reservas" description="No hay reservas para este filtro." />
        ) : (
          lista.map((r) => (
            <PanelRow key={r.id}>
              <div className="min-w-0">
                <p className="font-semibold text-carbon truncate m-0">{r.nombre}</p>
                <p className="flex items-center gap-1.5 text-sm text-carbon/45 m-0 mt-0.5">
                  <Clock size={13} /> {r.fecha} · {r.hora}
                  <span className="mx-1">·</span>
                  <Users size={13} /> {r.personas} {r.personas === 1 ? 'persona' : 'personas'}
                  {r.mesaId && <span className="mx-1">· Mesa asignada</span>}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {r.estado === 'pendiente' ? (
                  <>
                    <button
                      aria-label="Rechazar"
                      onClick={() => rechazar(r.id)}
                      className="w-9 h-9 rounded-lg border border-carbon/[0.08] flex items-center justify-center text-carbon/50 hover:bg-error hover:text-white hover:border-error transition-colors"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      aria-label="Confirmar"
                      onClick={() => confirmar(r.id)}
                      className="h-9 px-3 rounded-lg bg-terracotta text-white flex items-center gap-1.5 text-sm font-semibold hover:bg-terracotta/90 transition-colors shadow-sm"
                    >
                      <Check size={16} strokeWidth={2.5} /> Confirmar
                    </button>
                  </>
                ) : r.estado === 'confirmada' ? (
                  <>
                    <StatusPill visual={visualReserva(r.estado)} />
                    <button
                      onClick={() => noShow(r.id)}
                      className="h-9 px-3 rounded-lg border border-carbon/[0.08] flex items-center gap-1.5 text-sm font-semibold text-carbon/60 hover:bg-carbon hover:text-white transition-colors"
                    >
                      <UserX size={15} /> No-show
                    </button>
                  </>
                ) : (
                  <StatusPill visual={visualReserva(r.estado)} />
                )}
              </div>
            </PanelRow>
          ))
        )}
      </Panel>
    </div>
  )
}
