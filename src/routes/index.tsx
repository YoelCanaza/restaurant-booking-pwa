import { Routes, Route, Navigate } from 'react-router-dom'
import { useCurrentUser } from '../hooks'

// Layout
import MainLayout from '../components/layout/MainLayout'
import ProtectedRoute from '../components/layout/ProtectedRoute'

// Páginas públicas
import RoleSelectorPage from '../pages/RoleSelectorPage'

// Páginas cliente
import ClientHome from '../pages/cliente/ClientHome'
import ReservationFlow from '../pages/cliente/ReservationFlow'
import MyReservationsPage from '../pages/cliente/MyReservationsPage'
import DeliveryMenu from '../pages/cliente/DeliveryMenu'
import MyOrdersPage from '../pages/cliente/MyOrdersPage'

// Páginas admin
import AdminDashboard from '../pages/admin/AdminDashboard'
import FloorPlanPage from '../pages/admin/FloorPlanPage'
import MenuManagerPage from '../pages/admin/MenuManagerPage'

// Páginas delivery
import DeliveryView from '../pages/delivery/DeliveryView'

/**
 * AppRoutes — Rincón Andino
 * ─────────────────────────────────────────────────────────────
 * Sistema de rutas con redirección automática según el rol activo.
 *
 * "/" →  Sin user → RoleSelectorPage (modo dev)
 *        Con user → Redirige a la home de su rol
 *
 * Rutas protegidas: ProtectedRoute verifica que el rol coincida.
 * ─────────────────────────────────────────────────────────────
 */
function RootRedirect() {
  const user = useCurrentUser()

  if (!user) return <RoleSelectorPage />

  // Redirección automática según rol
  const paths = { cliente: '/cliente', admin: '/admin', delivery: '/delivery' }
  return <Navigate to={paths[user.role]} replace />
}

export default function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        {/* ── Raíz ────────────────────────────────────────── */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Rutas de Cliente ────────────────────────────── */}
        <Route
          path="/cliente"
          element={
            <ProtectedRoute requiredRole="cliente">
              <ClientHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/reserva"
          element={
            <ProtectedRoute requiredRole="cliente">
              <ReservationFlow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/reservas"
          element={
            <ProtectedRoute requiredRole="cliente">
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/menu"
          element={
            <ProtectedRoute requiredRole="cliente">
              <DeliveryMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/pedidos"
          element={
            <ProtectedRoute requiredRole="cliente">
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />

        {/* ── Rutas de Admin ──────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mesas"
          element={
            <ProtectedRoute requiredRole="admin">
              <FloorPlanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute requiredRole="admin">
              <MenuManagerPage />
            </ProtectedRoute>
          }
        />

        {/* ── Rutas de Delivery ───────────────────────────── */}
        <Route
          path="/delivery"
          element={
            <ProtectedRoute requiredRole="delivery">
              <DeliveryView />
            </ProtectedRoute>
          }
        />

        {/* ── 404 ─────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  )
}
