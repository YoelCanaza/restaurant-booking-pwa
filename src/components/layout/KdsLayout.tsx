import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import ToastContainer from '../ui/Toast'

interface KdsLayoutProps {
  children: ReactNode
}

/**
 * KdsLayout — Rincón Andino
 * ─────────────────────────────────────────────────────────────
 * Layout optimizado para Tablets en modo Horizontal (Landscape)
 * para su uso en la cocina. No tiene BottomNav ni header grande.
 * Maximiza el área de trabajo para el Kanban.
 */
export default function KdsLayout({ children }: KdsLayoutProps) {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-[100dvh] bg-bone flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 bg-carbon text-white shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center font-bold text-sm">
            RA
          </div>
          <h1 className="font-display m-0 text-xl font-bold tracking-tight">Kitchen Display System</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70 font-medium">Modo KDS</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-transparent border border-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4">{children}</main>

      <ToastContainer />
    </div>
  )
}
