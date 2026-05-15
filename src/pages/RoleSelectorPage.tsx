import { motion, type Variants } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import type { UserRole } from '../types'

// ─── CONFIGURACIÓN DE ROLES ───────────────────────────────────
const ROLES: {
  role: UserRole
  label: string
  description: string
  emoji: string
  path: string
  color: string
}[] = [
  {
    role: 'cliente',
    label: 'Cliente',
    description: 'Reserva una mesa o pide delivery',
    emoji: '🍽️',
    path: '/cliente',
    color: 'var(--color-terracotta)',
  },
  {
    role: 'admin',
    label: 'Administrador',
    description: 'Gestiona mesas, menú y pedidos',
    emoji: '🏔️',
    path: '/admin',
    color: 'var(--color-carbon)',
  },
  {
    role: 'delivery',
    label: 'Repartidor',
    description: 'Ve tus pedidos asignados y tu ruta',
    emoji: '🛵',
    path: '/delivery',
    color: 'var(--color-amber)',
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
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--color-bone)',
        display: 'flex',
        flexDirection: 'column',
        padding: '2.5rem 1.25rem 2rem',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: 'center', marginBottom: '2.5rem' }}
      >
        {/* Logo */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'var(--color-terracotta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: 'var(--shadow-btn)',
          }}
        >
          <span style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>RA</span>
        </div>

        <h1
          style={{
            margin: '0 0 0.375rem',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--color-carbon)',
            letterSpacing: '-0.02em',
          }}
        >
          Rincón Andino
        </h1>
        <p
          style={{
            margin: '0 0 1.5rem',
            color: 'var(--color-carbon)',
            opacity: 0.55,
            fontSize: '0.9rem',
          }}
        >
          Gastronomía tradicional de Puno
        </p>

        {/* Badge de modo desarrollo */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            backgroundColor: 'var(--color-amber)',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.3rem 0.75rem',
            borderRadius: 999,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          <span>⚙️</span>
          Modo Desarrollo — Selecciona un rol
        </div>
      </motion.div>

      {/* Cards de rol */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', flex: 1 }}
      >
        {ROLES.map((r) => (
          <motion.button
            key={r.role}
            variants={item}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(r.role, r.path)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.125rem 1.25rem',
              borderRadius: 16,
              border: '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'left',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = r.color
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'
            }}
          >
            {/* Emoji avatar */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: `${r.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
              }}
            >
              {r.emoji}
            </div>

            {/* Texto */}
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: '0 0 0.2rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--color-carbon)',
                }}
              >
                {r.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  color: 'var(--color-carbon)',
                  opacity: 0.55,
                  lineHeight: 1.4,
                }}
              >
                {r.description}
              </p>
            </div>

            {/* Indicador de color */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: r.color,
                flexShrink: 0,
              }}
            />
          </motion.button>
        ))}
      </motion.div>

      {/* Footer */}
      <p
        style={{
          textAlign: 'center',
          marginTop: '2rem',
          fontSize: '0.72rem',
          color: 'var(--color-carbon)',
          opacity: 0.35,
        }}
      >
        PWA · Proyecto HCI · UNAP Sistemas
      </p>
    </div>
  )
}
