import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../hooks'

// Layouts
import MobileLayout from '../components/layout/MobileLayout'
import KdsLayout from '../components/layout/KdsLayout'
import DesktopLayout from '../components/layout/DesktopLayout'
import ProtectedRoute from '../components/layout/ProtectedRoute'

// Páginas públicas
import RoleSelectorPage from '../pages/RoleSelectorPage'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'

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
import ReservationsAdminPage from '../pages/admin/ReservationsAdminPage'
import OrdersAdminPage from '../pages/admin/OrdersAdminPage'
import StaffAdminPage from '../pages/admin/StaffAdminPage'
import ClientsAdminPage from '../pages/admin/ClientsAdminPage'
import ReportsAdminPage from '../pages/admin/ReportsAdminPage'

// Páginas delivery
import DeliveryView from '../pages/delivery/DeliveryView'

// Nuevas páginas
import WaiterDashboard from '../pages/mesero/WaiterDashboard'
import KitchenKDS from '../pages/cocina/KitchenKDS'
import POSView from '../pages/cajero/POSView'

/**
 * AppRoutes — Rincón Andino
 * ─────────────────────────────────────────────────────────────
 * Sistema de rutas con redirección automática según el rol activo.
 */
function RootRedirect() {
  const user = useCurrentUser()

  if (!user) return <LandingPage />

  // Redirección automática según rol
  const paths: Record<string, string> = {
    cliente: '/cliente',
    admin: '/admin',
    delivery: '/delivery',
    mesero: '/mesero',
    cocina: '/cocina',
    caja: '/caja',
  }
  return <Navigate to={paths[user.role] || '/'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Raíz y públicas ─────────────────────────────── */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/demo" element={<RoleSelectorPage />} />

      {/* ── Mobile Layout (Cliente, Delivery, Mesero) ───── */}
      <Route element={<MobileLayout><Outlet /></MobileLayout>}>
        {/* Rutas de Cliente */}
        <Route path="/cliente" element={<ProtectedRoute requiredRole="cliente"><ClientHome /></ProtectedRoute>} />
        {/* Reserva: accesible a invitados (la cuenta se crea al confirmar) */}
        <Route path="/cliente/reserva" element={<ReservationFlow />} />
        <Route path="/cliente/reservas" element={<ProtectedRoute requiredRole="cliente"><MyReservationsPage /></ProtectedRoute>} />
        <Route path="/cliente/menu" element={<ProtectedRoute requiredRole="cliente"><DeliveryMenu /></ProtectedRoute>} />
        <Route path="/cliente/pedidos" element={<ProtectedRoute requiredRole="cliente"><MyOrdersPage /></ProtectedRoute>} />
        
        {/* Rutas de Delivery */}
        <Route path="/delivery" element={<ProtectedRoute requiredRole="delivery"><DeliveryView /></ProtectedRoute>} />

        {/* Rutas de Mesero */}
        <Route path="/mesero" element={<ProtectedRoute requiredRole="mesero"><WaiterDashboard /></ProtectedRoute>} />
      </Route>

      {/* ── Desktop Layout (Admin, Caja) ────────────────── */}
      <Route element={<DesktopLayout><Outlet /></DesktopLayout>}>
        {/* Rutas de Admin */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/reservas" element={<ProtectedRoute requiredRole="admin"><ReservationsAdminPage /></ProtectedRoute>} />
        <Route path="/admin/pedidos" element={<ProtectedRoute requiredRole="admin"><OrdersAdminPage /></ProtectedRoute>} />
        <Route path="/admin/mesas" element={<ProtectedRoute requiredRole="admin"><FloorPlanPage /></ProtectedRoute>} />
        <Route path="/admin/menu" element={<ProtectedRoute requiredRole="admin"><MenuManagerPage /></ProtectedRoute>} />
        <Route path="/admin/personal" element={<ProtectedRoute requiredRole="admin"><StaffAdminPage /></ProtectedRoute>} />
        <Route path="/admin/clientes" element={<ProtectedRoute requiredRole="admin"><ClientsAdminPage /></ProtectedRoute>} />
        <Route path="/admin/reportes" element={<ProtectedRoute requiredRole="admin"><ReportsAdminPage /></ProtectedRoute>} />

        {/* Rutas de Caja (POS) */}
        <Route path="/caja" element={<ProtectedRoute requiredRole="caja"><POSView /></ProtectedRoute>} />
      </Route>

      {/* ── KDS Layout (Cocina) ─────────────────────────── */}
      <Route element={<KdsLayout><Outlet /></KdsLayout>}>
        <Route path="/cocina" element={<ProtectedRoute requiredRole="cocina"><KitchenKDS /></ProtectedRoute>} />
      </Route>

      {/* ── 404 ─────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
