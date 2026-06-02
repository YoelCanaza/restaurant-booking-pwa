import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, Calendar, ShoppingBag, LogOut,
  LayoutDashboard, Grid3X3, UtensilsCrossed,
  Package,
} from 'lucide-react'
import { useCurrentUser } from '../../hooks'
import { useAuthStore } from '../../store/useAuthStore'
import type { UserRole } from '../../types'

// ─── TABS POR ROL ─────────────────────────────────────────────

interface TabItem {
  label: string
  path: string
  icon: React.ElementType
  isLogout?: boolean
}

const TABS: Record<UserRole, TabItem[]> = {
  cliente: [
    { label: 'Inicio',   path: '/cliente',          icon: Home },
    { label: 'Reservas', path: '/cliente/reservas',  icon: Calendar },
    { label: 'Pedidos',  path: '/cliente/pedidos',   icon: ShoppingBag },
    { label: 'Salir',    path: '/__logout__',         icon: LogOut, isLogout: true },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin',        icon: LayoutDashboard },
    { label: 'Mesas',     path: '/admin/mesas',  icon: Grid3X3 },
    { label: 'Menú',      path: '/admin/menu',   icon: UtensilsCrossed },
    { label: 'Salir',     path: '/__logout__',    icon: LogOut, isLogout: true },
  ],
  delivery: [
    { label: 'Pedidos', path: '/delivery',  icon: Package },
    { label: 'Salir',   path: '/__logout__', icon: LogOut, isLogout: true },
  ],
  mesero: [
    { label: 'Mesas', path: '/mesero',     icon: Grid3X3 },
    { label: 'Salir', path: '/__logout__', icon: LogOut, isLogout: true },
  ],
  cocina: [], // No usa BottomNav
  caja: [],   // No usa BottomNav
}

const ROLE_COLOR: Record<UserRole, string> = {
  cliente:  'var(--color-terracotta)',
  admin:    'var(--color-carbon)',
  delivery: 'var(--color-amber)',
  mesero:   'var(--color-terracotta)',
  cocina:   'var(--color-carbon)',
  caja:     'var(--color-terracotta)',
}

// ─── COMPONENTE ──────────────────────────────────────────────

export default function BottomNav() {
  const user     = useCurrentUser()
  const logout   = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null

  const tabs        = TABS[user.role]
  const accentColor = ROLE_COLOR[user.role]

  if (tabs.length === 0) return null

  const handleTab = (tab: TabItem) => {
    if (tab.isLogout) {
      logout()
      navigate('/')
      return
    }
    navigate(tab.path)
  }

  // Calcula el índice activo: prioriza match exacto sobre match por prefijo.
  // Ordena candidatos por longitud de path DESC para que rutas más específicas
  // tengan prioridad (ej: /cliente/reservas > /cliente)
  const activeIndex = (() => {
    // 1. Busca match exacto primero
    const exact = tabs.findIndex(
      (t) => !t.isLogout && t.path === location.pathname
    )
    if (exact !== -1) return exact

    // 2. Busca el prefijo más largo que coincida
    let bestIdx = -1
    let bestLen = 0
    tabs.forEach((t, i) => {
      if (t.isLogout) return
      
      // Evitar que la ruta base (Inicio) se active para subrutas
      if ((t.path === '/cliente' || t.path === '/admin' || t.path === '/delivery') && location.pathname !== t.path) {
        return
      }

      if (
        location.pathname.startsWith(t.path) &&
        t.path.length > bestLen
      ) {
        bestIdx = i
        bestLen = t.path.length
      }
    })
    return bestIdx
  })()

  return (
    <nav
      className="flex md:hidden"
      style={{
        position: 'sticky',
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--color-border)',
        alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 40,
        boxShadow: '0 -4px 24px rgba(45,42,38,0.08)',
        flexShrink: 0,
      }}
      role="navigation"
      aria-label="Navegación principal"
    >
      {tabs.map((tab, index) => {
        const isActive = !tab.isLogout && index === activeIndex
        const Icon     = tab.icon

        const iconColor  = tab.isLogout
          ? 'var(--color-error)'
          : isActive
          ? accentColor
          : 'rgba(45,42,38,0.30)'

        const labelColor = tab.isLogout
          ? 'var(--color-error)'
          : isActive
          ? accentColor
          : 'rgba(45,42,38,0.35)'

        return (
          <motion.button
            key={tab.path}
            whileTap={{ scale: 0.82 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            onClick={() => handleTab(tab)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.22rem',
              padding: '0.5rem 0.25rem 0.625rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              minHeight: 62,
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
            }}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* ── Línea indicadora superior ─────────────────── */}
            <motion.div
              animate={{
                scaleX: isActive ? 1 : 0,
                opacity: isActive ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              style={{
                position: 'absolute',
                top: 0,
                left: '18%',
                right: '18%',
                height: 3,
                borderRadius: '0 0 4px 4px',
                backgroundColor: accentColor,
                transformOrigin: 'center',
              }}
            />

            {/* ── Píldora de fondo activa ────────────────────── */}
            <motion.div
              animate={{
                opacity: isActive ? 0.12 : 0,
                scale: isActive ? 1 : 0.7,
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              style={{
                position: 'absolute',
                top: '0.4rem',
                left: '8%',
                right: '8%',
                height: 34,
                borderRadius: 9999,
                backgroundColor: accentColor,
              }}
            />

            {/* ── Ícono ─────────────────────────────────────── */}
            <motion.div
              animate={{
                scale: isActive ? 1.15 : 1,
                y: isActive ? -1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <Icon
                size={isActive ? 23 : 20}
                strokeWidth={isActive ? 2.5 : 1.6}
                color={iconColor}
              />
            </motion.div>

            {/* ── Label ─────────────────────────────────────── */}
            <span
              style={{
                fontSize: isActive ? '0.69rem' : '0.63rem',
                fontWeight: isActive ? 700 : 400,
                color: labelColor,
                lineHeight: 1,
                letterSpacing: isActive ? '0.015em' : 0,
                transition: 'color 0.18s, font-size 0.18s, font-weight 0.18s',
                position: 'relative',
                zIndex: 1,
                // Ancho mínimo fijo para evitar saltos al cambiar font-weight
                minWidth: 28,
                textAlign: 'center',
              }}
            >
              {tab.label}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}
