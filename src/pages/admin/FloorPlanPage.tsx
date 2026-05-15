import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Map, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore, getDisponibilidadMesas } from '../../store/useAppStore'
import { useToastStore } from '../../store/useToastStore'
import Button from '../../components/ui/Button'
import FloorPlanSVG from '../../components/ui/FloorPlanSVG'
import type { Mesa, EstadoMesa } from '../../types'

export default function FloorPlanPage() {
  const mesas = useAppStore((s) => s.mesas)
  const reservas = useAppStore((s) => s.reservas)
  const updateMesaEstado = useAppStore((s) => s.updateMesaEstado)
  const addToast = useToastStore((s) => s.addToast)

  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null)
  
  // Gestión de Fecha
  const [dateOffset, setDateOffset] = useState(0) // 0 = hoy, 1 = mañana, etc.
  
  const selectedDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + dateOffset)
    return d.toISOString().split('T')[0]
  }, [dateOffset])

  const isToday = dateOffset === 0

  // Estado calculado de todas las mesas para la fecha seleccionada
  const state = useAppStore() // Se requiere todo el state para la función helper
  const disponibilidad = useMemo(() => getDisponibilidadMesas(state, selectedDate), [state, selectedDate])

  // Buscar si la mesa seleccionada tiene una reserva en esta fecha
  const reservaAsociada = useMemo(() => {
    if (!selectedMesa) return null
    return reservas.find(r => r.mesaId === selectedMesa.id && r.fecha === selectedDate && r.estado !== 'cancelada')
  }, [selectedMesa, reservas, selectedDate])

  const handleEstadoChange = (nuevoEstado: EstadoMesa) => {
    if (!selectedMesa) return
    updateMesaEstado(selectedMesa.id, nuevoEstado)
    addToast(`Mesa ${selectedMesa.numero} marcada como ${nuevoEstado}`, 'success')
    setSelectedMesa(null)
  }

  const handleMesaClick = (mesaId: string) => {
    const mesa = mesas.find(m => m.id === mesaId)
    if (mesa) setSelectedMesa(mesa)
  }

  const formatDate = (dateStr: string) => {
    if (isToday) return 'Hoy'
    if (dateOffset === 1) return 'Mañana'
    const [, m, d] = dateStr.split('-')
    return `${d}/${m}`
  }

  return (
    <div className="flex flex-col min-h-full bg-bone pb-24">
      {/* Header */}
      <div className="px-6 py-6 bg-white border-b border-border/40 shadow-sm relative z-10">
        <h1 className="text-2xl font-extrabold text-carbon tracking-tight flex items-center gap-2">
          <Map className="text-terracotta" /> Plano de Mesas
        </h1>
        
        {/* Selector de Fechas */}
        <div className="flex items-center justify-between mt-4 bg-bone/50 p-1.5 rounded-2xl border border-border/60">
          <button 
            onClick={() => setDateOffset(prev => Math.max(0, prev - 1))}
            disabled={isToday}
            className={`p-2 rounded-xl transition-colors ${isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white'}`}
          >
            <ChevronLeft size={20} className="text-carbon" />
          </button>
          <div className="flex items-center gap-2 font-bold text-carbon">
            <CalendarIcon size={18} className="text-terracotta" />
            <span>{formatDate(selectedDate)}</span>
          </div>
          <button 
            onClick={() => setDateOffset(prev => prev + 1)}
            className="p-2 rounded-xl transition-colors hover:bg-white"
          >
            <ChevronRight size={20} className="text-carbon" />
          </button>
        </div>

        {/* Leyenda */}
        <div className="flex gap-4 mt-4 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span className="text-[10px] font-bold text-carbon/60 uppercase tracking-wider">Libre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#D4A853]" />
            <span className="text-[10px] font-bold text-carbon/60 uppercase tracking-wider">Reservada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <span className="text-[10px] font-bold text-carbon/60 uppercase tracking-wider">Ocupada</span>
          </div>
        </div>
      </div>

      {/* Plano SVG Interactivo */}
      <div className="flex-1 p-6 flex items-center justify-center relative overflow-hidden">
        {/* Decorative Floor Lines */}
        <div className="absolute inset-4 border-2 border-dashed border-border/60 rounded-3xl pointer-events-none" />
        
        <FloorPlanSVG 
          disponibilidad={disponibilidad} 
          selectedMesaId={selectedMesa?.id} 
          onMesaClick={handleMesaClick} 
        />
      </div>

      {/* Bottom Sheet de Gestión de Mesa */}
      <AnimatePresence>
        {selectedMesa && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMesa(null)}
              className="fixed inset-0 bg-carbon/60 backdrop-blur-[2px] z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-bone z-50 rounded-t-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-carbon flex items-center gap-2">
                    Mesa {selectedMesa.numero}
                  </h3>
                  <p className="text-carbon/60 font-medium flex items-center gap-1 mt-1">
                    <Users size={16} /> Capacidad para {selectedMesa.capacidad} personas
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedMesa(null)}
                  className="p-2 bg-border/40 rounded-full text-carbon/60 hover:bg-border/60 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {reservaAsociada ? (
                <div className="bg-white p-4 rounded-2xl border border-[#D4A853]/30 mb-2">
                  <span className="text-[10px] font-bold text-[#D4A853] uppercase tracking-wider mb-1 block">
                    Reserva Programada
                  </span>
                  <p className="font-bold text-carbon text-lg">{reservaAsociada.nombre}</p>
                  <p className="text-carbon/60 font-medium text-sm mt-0.5">
                    {reservaAsociada.personas} personas • Hora: {reservaAsociada.hora}
                  </p>
                  <p className="text-carbon/60 font-medium text-sm">
                    Tel: {reservaAsociada.telefono}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 mt-4">
                {isToday && (
                  <>
                    <Button 
                      variant={disponibilidad[selectedMesa.id] === 'libre' ? 'primary' : 'secondary'}
                      fullWidth
                      onClick={() => handleEstadoChange('libre')}
                      className={disponibilidad[selectedMesa.id] === 'libre' ? 'bg-[#22c55e] text-white' : ''}
                    >
                      Marcar como Libre
                    </Button>
                    <Button 
                      variant={disponibilidad[selectedMesa.id] === 'ocupada' ? 'primary' : 'secondary'}
                      fullWidth
                      onClick={() => handleEstadoChange('ocupada')}
                      className={disponibilidad[selectedMesa.id] === 'ocupada' ? 'bg-[#ef4444] text-white' : ''}
                    >
                      Marcar como Ocupada (Física)
                    </Button>
                  </>
                )}
                {!isToday && !reservaAsociada && (
                  <p className="text-center text-sm font-bold text-carbon/40 py-2">
                    Esta mesa estará libre en esta fecha.
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
