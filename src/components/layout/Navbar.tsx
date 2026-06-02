import { useLocation } from 'react-router-dom'
import { useCurrentUser } from '../../hooks'
import type { UserRole } from '../../types'

// ─── TÍTULOS DE PÁGINA POR RUTA ──────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/cliente': 'Inicio',
  '/cliente/reserva': 'Nueva Reserva',
  '/cliente/reservas': 'Mis Reservas',
  '/cliente/menu': 'Menú Delivery',
  '/cliente/pedidos': 'Mis Pedidos',
  '/admin': 'Dashboard',
  '/admin/mesas': 'Plano de Mesas',
  '/admin/menu': 'Gestión de Menú',
  '/delivery': 'Mis Pedidos',
  '/mesero': 'Salón',
  '/caja': 'Caja / POS',
}

const ROLE_COLOR: Record<UserRole, string> = {
  cliente: 'var(--color-terracotta)',
  admin: 'var(--color-carbon)',
  delivery: 'var(--color-amber)',
  mesero: 'var(--color-terracotta)',
  cocina: 'var(--color-carbon)',
  caja: 'var(--color-amber)',
}

/**
 * TopHeader — Rincón Andino
 * Header minimalista: solo logo + título de la página actual.
 * La navegación se delegó completamente a BottomNav (Nielsen #6).
 */
export default function TopHeader() {
  const user = useCurrentUser()
  const location = useLocation()

  if (!user) return null

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Rincón Andino'
  const accentColor = ROLE_COLOR[user.role]

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(249,246,240,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.25rem',
        gap: '0.75rem',
      }}
    >
      {/* Logo círculo */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.04em' }}>
          RA
        </span>
      </div>

      {/* Título de la pantalla actual */}
      <h1
        style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--color-carbon)',
          letterSpacing: '-0.01em',
          flex: 1,
        }}
      >
        {pageTitle}
      </h1>
    </header>
  )
}
