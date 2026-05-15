import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../../hooks'
import type { UserRole } from '../../types'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole: UserRole
}

/**
 * ProtectedRoute — Rincón Andino
 * ─────────────────────────────────────────────────────────────
 * HOC de rutas que verifica que el usuario tenga el rol requerido.
 * Si no hay usuario o el rol no coincide, redirige a "/" (RoleSelector).
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const user = useCurrentUser()

  if (!user || user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
