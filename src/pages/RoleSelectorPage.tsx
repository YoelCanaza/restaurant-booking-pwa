import { motion, type Variants } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { User, Mountain, Bike, ConciergeBell, ChefHat, CreditCard, ArrowRight, type LucideIcon } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import type { UserRole } from '../types'

// ─── CONFIGURACIÓN DE ROLES ───────────────────────────────────
const ROLES: {
  role: UserRole
  label: string
  description: string
  icon: LucideIcon
  path: string
  color: string
}[] = [
  {
    role: 'cliente',
    label: 'Cliente',
    description: 'Reserva una mesa o pide delivery',
    icon: User,
    path: '/cliente',
    color: 'var(--color-terracotta)',
  },
  {
    role: 'admin',
    label: 'Administrador',
    description: 'Gestiona mesas, menú y pedidos',
    icon: Mountain,
    path: '/admin',
    color: 'var(--color-carbon)',
  },
  {
    role: 'delivery',
    label: 'Repartidor',
    description: 'Ve tus pedidos asignados',
    icon: Bike,
    path: '/delivery',
    color: 'var(--color-amber)',
  },
  {
    role: 'mesero',
    label: 'Mesero',
    description: 'Toma pedidos y gestiona el salón',
    icon: ConciergeBell,
    path: '/mesero',
    color: 'var(--color-terracotta)',
  },
  {
    role: 'cocina',
    label: 'Cocina (KDS)',
    description: 'Gestiona la cola de preparación',
    icon: ChefHat,
    path: '/cocina',
    color: 'var(--color-carbon)',
  },
  {
    role: 'caja',
    label: 'Caja (POS)',
    description: 'Facturación y punto de venta',
    icon: CreditCard,
    path: '/caja',
    color: 'var(--color-terracotta)',
  },
]

// ─── ANIMACIONES ─────────────────────────────────────────────
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
}

export default function RoleSelectorPage() {
  const switchRole = useAuthStore((s) => s.switchRole)
  const navigate = useNavigate()

  const handleSelect = (role: UserRole, path: string) => {
    switchRole(role)
    navigate(path)
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bone">

      {/* ─── Hero ───────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-carbon text-white">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=70&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-carbon/80 via-carbon/85 to-carbon pointer-events-none" />
        <div className="andean-motif absolute inset-0 opacity-[0.07] pointer-events-none" />
        <div className="absolute -right-24 -top-28 w-80 h-80 rounded-full bg-terracotta/40 blur-[100px] pointer-events-none" />
        <div className="absolute -left-24 -bottom-28 w-72 h-72 rounded-full bg-amber/20 blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-5xl mx-auto px-6 pt-16 pb-24 md:pt-20 md:pb-32 text-center"
        >
          {/* Monograma */}
          <div className="w-16 h-16 mx-auto mb-7 rounded-2xl border border-white/25 flex items-center justify-center font-display text-2xl font-black tracking-tight bg-white/5 backdrop-blur-sm">
            RA
          </div>

          <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.28em] text-amber mb-4">
            Gastronomía puneña · Puno, Perú
          </p>
          <h1 className="font-display m-0 text-4xl md:text-6xl font-black tracking-tight leading-none">
            Rincón Andino
          </h1>
          <p className="m-0 mt-4 text-white/55 text-base md:text-lg font-medium max-w-[46ch] mx-auto leading-relaxed">
            Del altiplano a tu mesa. Una experiencia gastronómica gestionada de punta a punta.
          </p>
        </motion.div>
      </header>

      {/* ─── Selección de rol ───────────────────────────────── */}
      <main className="max-w-6xl mx-auto w-full px-6 -mt-14 md:-mt-20 pb-16 relative z-10 flex-1">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-carbon/45 mb-6">
          Selecciona tu rol para ingresar
        </p>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
        >
          {ROLES.map((r) => {
            const Icon = r.icon
            return (
              <motion.button
                key={r.role}
                variants={item}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(r.role, r.path)}
                className="group flex flex-col text-left p-6 rounded-2xl cursor-pointer bg-white border border-carbon/[0.08] shadow-sm hover:shadow-xl hover:border-terracotta/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                    style={{ backgroundColor: `color-mix(in srgb, ${r.color} 12%, transparent)`, color: r.color }}
                  >
                    <Icon size={24} strokeWidth={2} />
                  </span>
                  <ArrowRight size={18} className="text-carbon/20 group-hover:text-terracotta group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="font-display m-0 mb-1 text-xl font-bold text-carbon">{r.label}</h2>
                <p className="m-0 text-sm text-carbon/55 leading-relaxed font-medium">{r.description}</p>
              </motion.button>
            )
          })}
        </motion.div>

        <p className="text-center mt-12 text-xs text-carbon/40 font-medium">
          PWA · Proyecto HCI · UNAP Sistemas · Acceso de demostración
        </p>
      </main>
    </div>
  )
}
