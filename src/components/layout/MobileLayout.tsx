import { type ReactNode } from 'react'
import TopHeader from './Navbar'
import BottomNav from './BottomNav'
import SidebarNav from './SidebarNav'
import ToastContainer from '../ui/Toast'

interface MainLayoutProps {
  children: ReactNode
}

/**
 * MobileLayout — Rincón Andino
 * ─────────────────────────────────────────────────────────────
 * Ahora es completamente responsivo.
 *  - En móviles: usa BottomNav y TopHeader.
 *  - En escritorio: usa SidebarNav a la izquierda y oculta BottomNav.
 */
export default function MobileLayout({ children }: MainLayoutProps) {

  return (
    <div className="flex min-h-[100dvh] bg-bone">
      {/* SidebarNav solo visible en md en adelante */}
      <SidebarNav />

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header superior, podemos ocultarlo en md si el Sidebar ya tiene título, pero lo dejamos por ahora */}
        <div className="md:hidden">
          <TopHeader />
        </div>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto">
          {/* Un wrapper para limitar el ancho en pantallas muy grandes y no se desparrame */}
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>

        <BottomNav />
      </div>

      <ToastContainer />
    </div>
  )
}
