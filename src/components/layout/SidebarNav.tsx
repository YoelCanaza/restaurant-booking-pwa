import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, Calendar, ShoppingBag, LogOut,
  LayoutDashboard, Grid3X3, UtensilsCrossed,
  Package, Users, Contact, BarChart3,
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
    { label: 'Dashboard', path: '/admin',          icon: LayoutDashboard },
    { label: 'Reservas',  path: '/admin/reservas',  icon: Calendar },
    { label: 'Pedidos',   path: '/admin/pedidos',   icon: Package },
    { label: 'Mesas',     path: '/admin/mesas',     icon: Grid3X3 },
    { label: 'Menú',      path: '/admin/menu',      icon: UtensilsCrossed },
    { label: 'Personal',  path: '/admin/personal',  icon: Users },
    { label: 'Clientes',  path: '/admin/clientes',  icon: Contact },
    { label: 'Reportes',  path: '/admin/reportes',  icon: BarChart3 },
    { label: 'Salir',     path: '/__logout__',       icon: LogOut, isLogout: true },
  ],
  delivery: [
    { label: 'Pedidos', path: '/delivery',  icon: Package },
    { label: 'Salir',   path: '/__logout__', icon: LogOut, isLogout: true },
  ],
  mesero: [
    { label: 'Mesas', path: '/mesero',     icon: Grid3X3 },
    { label: 'Salir', path: '/__logout__', icon: LogOut, isLogout: true },
  ],
  cocina: [], // No usa SidebarNav
  caja: [
    { label: 'POS / Caja', path: '/caja', icon: LayoutDashboard },
    { label: 'Salir',     path: '/__logout__', icon: LogOut, isLogout: true }
  ],
}

const ROLE_COLOR: Record<UserRole, string> = {
  cliente:  'var(--color-terracotta)',
  admin:    'var(--color-carbon)',
  delivery: 'var(--color-amber)',
  mesero:   'var(--color-terracotta)',
  cocina:   'var(--color-carbon)',
  caja:     'var(--color-terracotta)',
}

export default function SidebarNav() {
  const user = useCurrentUser()
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null

  const tabs = TABS[user.role]
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

  const activeIndex = (() => {
    const exact = tabs.findIndex((t) => !t.isLogout && t.path === location.pathname)
    if (exact !== -1) return exact

    let bestIdx = -1
    let bestLen = 0
    tabs.forEach((t, i) => {
      if (t.isLogout) return
      if ((t.path === '/cliente' || t.path === '/admin' || t.path === '/delivery') && location.pathname !== t.path) {
        return
      }
      if (location.pathname.startsWith(t.path) && t.path.length > bestLen) {
        bestIdx = i
        bestLen = t.path.length
      }
    })
    return bestIdx
  })()

  return (
    <aside
      className="hidden md:flex flex-col border-r border-border/60 bg-white shadow-xl z-40"
      style={{
        width: '280px',
        position: 'sticky',
        top: 0,
        height: '100dvh',
      }}
    >
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-terracotta flex items-center justify-center font-bold text-white text-xl">
            RA
          </div>
          <div>
            <h1 className="m-0 text-xl font-bold text-carbon">Rincón Andino</h1>
            <p className="text-sm text-carbon/50 font-medium capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {tabs.map((tab, index) => {
          const isActive = !tab.isLogout && index === activeIndex
          const Icon = tab.icon

          const iconColor = tab.isLogout
            ? 'var(--color-error)'
            : isActive
            ? accentColor
            : 'rgba(45,42,38,0.5)'

          const labelColor = tab.isLogout
            ? 'var(--color-error)'
            : isActive
            ? 'var(--color-carbon)'
            : 'rgba(45,42,38,0.6)'

          const bgColor = isActive ? 'rgba(45,42,38,0.04)' : 'transparent'

          return (
            <motion.button
              key={tab.path}
              whileHover={{ scale: tab.isLogout ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTab(tab)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer border-none transition-colors ${tab.isLogout ? 'mt-auto hover:bg-red-50' : 'hover:bg-carbon/5'}`}
              style={{ backgroundColor: bgColor }}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} color={iconColor} />
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute -left-8 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full"
                    style={{ backgroundColor: accentColor }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: isActive ? 700 : 500,
                  color: labelColor,
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </nav>
    </aside>
  )
}
