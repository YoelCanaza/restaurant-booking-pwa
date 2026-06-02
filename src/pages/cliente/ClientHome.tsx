import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, ShoppingBag, Clock, ArrowRight, Star } from 'lucide-react'
import { useCurrentUser, usePlatosDisponibles } from '../../hooks'
import { useAppStore } from '../../store/useAppStore'

/* ════════════════════════════════════════════════════════════════
   ClientHome — home del comensal con estética de restaurante premium.
   Hero editorial (Fraunces + textura andina), CTAs claros y una
   vitrina "Especialidades de la casa" con los platos reales del menú.
   ════════════════════════════════════════════════════════════════ */

export default function ClientHome() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const platos = usePlatosDisponibles()
  const pedidos = useAppStore((s) => s.pedidos)

  // Puntos de fidelidad: 1 punto por S/1 en pedidos pagados/entregados (§3.4 F)
  const puntos = Math.round(
    pedidos
      .filter((p) => p.clienteId === user?.id && (p.estado === 'entregado' || p.estado === 'pagado'))
      .reduce((s, p) => s + p.total, 0)
  )

  const destacados = [...platos]
    .sort((a, b) => (b.popularidad ?? 0) - (a.popularidad ?? 0))
    .slice(0, 4)

  return (
    <div className="flex flex-col gap-10 p-5 md:p-8 pb-24 max-w-4xl mx-auto w-full">

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl bg-carbon text-white isolate"
      >
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=70&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-carbon via-carbon/90 to-carbon/60 pointer-events-none" />
        <div className="andean-motif absolute inset-0 opacity-[0.08] pointer-events-none" />
        <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-terracotta/40 blur-[90px] pointer-events-none" />
        <div className="absolute -left-16 -bottom-24 w-64 h-64 rounded-full bg-amber/20 blur-[90px] pointer-events-none" />

        <div className="relative p-7 md:p-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.22em] text-amber">
              Gastronomía puneña · Puno
            </p>
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-xs font-semibold text-white/90" title="1 punto por cada S/1 en pedidos pagados">
              <Star size={13} className="fill-amber text-amber" /> {puntos} pts
            </span>
          </div>

          <h1 className="font-display text-[2.1rem] md:text-5xl font-black leading-[1.05] tracking-tight m-0 max-w-[18ch]">
            Bienvenido,{' '}
            <span className="text-terracotta">{user?.name?.split(' ')[0] || 'a la mesa'}</span>
          </h1>
          <p className="text-white/55 mt-3 md:mt-4 text-base md:text-lg font-medium max-w-[42ch] leading-relaxed">
            Reserva tu mesa o recibe los sabores del altiplano en la puerta de tu casa.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <button
              onClick={() => navigate('/cliente/reserva')}
              className="h-12 px-6 rounded-xl bg-terracotta text-white font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-terracotta/30 hover:bg-terracotta/90 active:scale-[0.98] transition-all"
            >
              <Calendar size={18} /> Reservar mesa
            </button>
            <button
              onClick={() => navigate('/cliente/menu')}
              className="h-12 px-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-white/20 active:scale-[0.98] transition-all"
            >
              <ShoppingBag size={18} /> Pedir delivery
            </button>
          </div>
        </div>
      </motion.section>

      {/* ─── ESPECIALIDADES ───────────────────────────────────── */}
      <section>
        <header className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-1">La carta</p>
            <h2 className="font-display text-2xl md:text-3xl font-black text-carbon tracking-tight m-0">
              Especialidades de la casa
            </h2>
          </div>
          <button
            onClick={() => navigate('/cliente/menu')}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:gap-1.5 transition-all"
          >
            Ver carta completa <ArrowRight size={15} />
          </button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {destacados.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35 }}
              onClick={() => navigate('/cliente/menu')}
              className="group text-left"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={p.imageUrl}
                  alt={p.nombre}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon/80 via-carbon/10 to-transparent" />
                <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur text-carbon text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  S/ {p.precio.toFixed(0)}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="font-display text-white font-bold text-sm md:text-base leading-tight line-clamp-2 drop-shadow">
                    {p.nombre}
                  </h3>
                  <p className="flex items-center gap-1 text-white/70 text-[11px] font-medium mt-1">
                    <Clock size={11} /> {p.tiempoPreparacion} min
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ─── ACCESOS ──────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4">
        <QuickLink icon={Calendar} label="Mis reservas" hint="Historial y estado" onClick={() => navigate('/cliente/reservas')} />
        <QuickLink icon={ShoppingBag} label="Mis pedidos" hint="Sigue tu delivery" onClick={() => navigate('/cliente/pedidos')} />
      </section>
    </div>
  )
}

function QuickLink({ icon: Icon, label, hint, onClick }: {
  icon: typeof Calendar; label: string; hint: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3.5 bg-white border border-carbon/[0.08] rounded-2xl p-4 text-left shadow-sm hover:shadow-md hover:border-terracotta/30 transition-all"
    >
      <span className="w-11 h-11 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0 group-hover:bg-terracotta group-hover:text-white transition-colors">
        <Icon size={20} />
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-carbon leading-tight">{label}</span>
        <span className="block text-xs text-carbon/45 font-medium mt-0.5">{hint}</span>
      </span>
    </button>
  )
}
