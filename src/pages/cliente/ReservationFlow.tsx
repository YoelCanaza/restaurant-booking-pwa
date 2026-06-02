import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useToastStore } from '../../store/useToastStore'
import { useCurrentUser } from '../../hooks'
import StepIndicator from '../../components/ui/StepIndicator'
import CircleSelector from '../../components/ui/CircleSelector'
import Chip from '../../components/ui/Chip'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import SuccessScreen from '../SuccessScreen'
import FloorPlanSVG from '../../components/ui/FloorPlanSVG'
import { getDisponibilidadMesas } from '../../store/useAppStore'

const HOURS = ['12:00', '13:00', '19:00', '20:00', '21:00']

// Genera los próximos 7 días
const getNextDays = () => {
  const days = []
  const today = new Date()
  const formatter = new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric' })
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      id: d.toISOString().split('T')[0],
      label: i === 0 ? 'Hoy' : formatter.format(d).replace('.', '')
    })
  }
  return days
}

const DATES = getNextDays()

export default function ReservationFlow() {
  const user = useCurrentUser()
  const addReserva = useAppStore((s) => s.addReserva)
  const asegurarSesionCliente = useAuthStore((s) => s.asegurarSesionCliente)
  const addToast = useToastStore((s) => s.addToast)
  
  const [step, setStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Estado del formulario
  const [personas, setPersonas] = useState(2)
  const [fecha, setFecha] = useState(DATES[0].id)
  const [hora, setHora] = useState(HOURS[0])
  const [mesaId, setMesaId] = useState<string | null>(null)
  const [nombre, setNombre] = useState(user?.name || '')
  const [telefono, setTelefono] = useState(user?.phone || '')
  const [pisoReserva, setPisoReserva] = useState(1)

  const navigate = useNavigate()

  const handleNext = () => setStep((s) => s + 1)
  const handleBack = () => setStep((s) => s - 1)

  const state = useAppStore()
  const disponibilidad = useMemo(() => getDisponibilidadMesas(state, fecha, hora), [state, fecha, hora])

  const handleConfirm = () => {
    // Identidad: sesión existente o registro invisible del invitado (con sus datos)
    let userId = user?.id
    if (!user) {
      const r = asegurarSesionCliente({ name: nombre, phone: telefono })
      if (!r.ok) {
        addToast(r.error ?? 'Revisa tus datos de contacto', 'error')
        return
      }
      userId = r.userId
    }
    const result = addReserva(
      {
        id: `res_${Date.now()}`,
        userId: userId!,
        fecha,
        hora,
        personas,
        nombre,
        telefono,
        mesaId: mesaId || undefined,
      },
      userId!
    )
    if (result.ok) {
      setIsSuccess(true)
    } else {
      addToast(result.error ?? 'No se pudo crear la reserva', 'error')
    }
  }

  if (isSuccess) {
    return (
      <SuccessScreen 
        title="¡Solicitud Enviada!" 
        message={`Hemos recibido tu solicitud para el ${DATES.find(d => d.id === fecha)?.label} a las ${hora}. El restaurante confirmará tu reserva en breve.`}
        returnPath="/cliente"
      />
    )
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  }

  return (
    <div className="flex flex-col min-h-full pb-8">
      <div className="sticky top-14 z-30 bg-bone/95 backdrop-blur-md px-6 py-4 border-b border-border/40">
        <StepIndicator currentStep={step} totalSteps={4} />
      </div>

      <div className="flex-1 px-6 pt-6 relative overflow-x-hidden">
        <AnimatePresence mode="wait" custom={1}>
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-col gap-10"
            >
              <section>
                <h3 className="font-display text-xl font-bold text-carbon mb-6 text-center">¿Cuántas personas?</h3>
                <CircleSelector
                  value={personas}
                  onChange={setPersonas}
                  min={1}
                  max={10}
                  unit="persona"
                />
              </section>

              <section>
                <h3 className="font-display text-lg font-bold text-carbon mb-4">¿Qué día?</h3>
                <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar -mx-6 px-6">
                  {DATES.map(d => (
                    <Chip 
                      key={d.id} 
                      label={d.label} 
                      selected={fecha === d.id} 
                      onClick={() => setFecha(d.id)} 
                    />
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-display text-lg font-bold text-carbon mb-4">¿A qué hora?</h3>
                <div className="flex flex-wrap gap-3">
                  {HOURS.map(h => (
                    <Chip 
                      key={h} 
                      label={h} 
                      selected={hora === h} 
                      onClick={() => setHora(h)} 
                    />
                  ))}
                </div>
              </section>

              <div className="flex gap-3 mt-4">
                <Button variant="ghost" onClick={() => navigate('/cliente')} className="w-1/3 text-carbon/60">
                  Cancelar
                </Button>
                <Button fullWidth size="lg" onClick={handleNext} className="w-2/3">
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2_table"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-col gap-6"
            >
              <h3 className="font-display text-xl font-bold text-carbon text-center">Elige tu mesa</h3>
              <p className="text-sm text-carbon/60 text-center -mt-4">
                Mesas disponibles para {personas} {personas === 1 ? 'persona' : 'personas'} a las {hora}.
              </p>

              {/* Selector de piso */}
              <div className="flex gap-2 bg-carbon/[0.04] p-1.5 rounded-2xl border border-carbon/[0.08] max-w-sm mx-auto w-full">
                {[{ n: 1, l: 'Planta baja' }, { n: 2, l: 'Rooftop' }].map((p) => (
                  <button
                    key={p.n}
                    type="button"
                    onClick={() => setPisoReserva(p.n)}
                    className={`flex-1 h-11 rounded-xl text-sm font-bold transition-all ${
                      pisoReserva === p.n
                        ? 'bg-terracotta text-white shadow-md shadow-terracotta/25'
                        : 'text-carbon/55 hover:text-carbon hover:bg-white/60'
                    }`}
                  >
                    {p.l}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex justify-center py-2 relative">
                <FloorPlanSVG
                  disponibilidad={disponibilidad}
                  selectedMesaId={mesaId}
                  onMesaClick={setMesaId}
                  requiredCapacity={personas}
                  piso={pisoReserva}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="secondary" onClick={handleBack} className="w-1/3">
                  Atrás
                </Button>
                <Button 
                  fullWidth 
                  size="lg" 
                  onClick={handleNext} 
                  disabled={!mesaId}
                  className="w-2/3"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3_data"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-col gap-6"
            >
              <h3 className="font-display text-xl font-bold text-carbon mb-2">Tus datos</h3>
              
              <div className="flex flex-col gap-2 relative">
                <label className="text-xs font-bold text-carbon/60 uppercase tracking-wider pl-1">
                  Nombre a cargo
                </label>
                <input 
                  type="text" 
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  autoComplete="name"
                  className="w-full h-14 bg-white border border-border/60 rounded-xl px-4 text-carbon focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors shadow-sm text-lg"
                />
              </div>

              <div className="flex flex-col gap-2 relative">
                <label className="text-xs font-bold text-carbon/60 uppercase tracking-wider pl-1">
                  Teléfono
                </label>
                <input 
                  type="tel" 
                  inputMode="numeric"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  autoComplete="tel"
                  className="w-full h-14 bg-white border border-border/60 rounded-xl px-4 text-carbon focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors shadow-sm text-lg"
                />
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="secondary" onClick={handleBack} className="w-1/3">
                  Atrás
                </Button>
                <Button 
                  fullWidth 
                  onClick={handleNext} 
                  disabled={!nombre || !telefono}
                  className="w-2/3"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4_summary"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-col gap-6 h-full"
            >
              <h3 className="font-display text-xl font-bold text-carbon mb-2">Resumen de reserva</h3>
              
              <Card>
                <div className="flex flex-col gap-4 divide-y divide-border/40">
                  <div className="flex justify-between items-center pb-4">
                    <span className="text-carbon/60">Fecha</span>
                    <span className="font-bold text-carbon capitalize text-lg">{DATES.find(d => d.id === fecha)?.label}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-carbon/60">Hora</span>
                    <span className="font-bold text-carbon text-lg">{hora}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-carbon/60">Mesa</span>
                    <span className="font-bold text-carbon text-lg">N° {state.mesas.find(m => m.id === mesaId)?.numero || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-carbon/60">Personas</span>
                    <span className="font-bold text-carbon text-lg">{personas}</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-4">
                    <span className="text-carbon/60 text-sm">A nombre de</span>
                    <span className="font-bold text-carbon text-lg">{nombre}</span>
                    <span className="text-sm text-carbon/80">{telefono}</span>
                  </div>
                </div>
              </Card>

              <div className="flex items-start gap-3 rounded-xl border border-carbon/[0.08] bg-bone p-4 mt-1">
                <Info size={18} className="text-terracotta shrink-0 mt-0.5" />
                <p className="text-sm text-carbon/70 leading-relaxed m-0">
                  La reserva <strong className="text-carbon">no tiene costo</strong>. Tu solicitud quedará{' '}
                  <strong className="text-carbon">pendiente</strong> hasta que el restaurante la confirme.
                  Pagarás tu consumo directamente en el local.
                </p>
              </div>

              <div className="flex gap-3 mt-auto pt-8">
                <Button variant="ghost" onClick={handleBack} className="px-2">
                  Atrás
                </Button>
                <Button fullWidth onClick={handleConfirm}>
                  Confirmar Reserva
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
