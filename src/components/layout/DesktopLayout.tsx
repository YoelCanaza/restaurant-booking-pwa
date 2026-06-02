import { type ReactNode } from 'react'
import ToastContainer from '../ui/Toast'
import SidebarNav from './SidebarNav'
import BottomNav from './BottomNav'
import TopHeader from './Navbar'

interface DesktopLayoutProps {
  children: ReactNode
}

/**
 * DesktopLayout — Rincón Andino
 * ─────────────────────────────────────────────────────────────
 * Layout para pantallas grandes (Dashboard del Administrador y POS).
 * Ahora responsivo: usa SidebarNav en md+, BottomNav en móviles.
 */
export default function DesktopLayout({ children }: DesktopLayoutProps) {
  return (
    <div className="flex min-h-[100dvh] bg-bone">
      {/* SidebarNav solo visible en md en adelante */}
      <SidebarNav />

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* En móvil mostramos el Navbar superior (hamburguesa/logo) */}
        <div className="md:hidden">
          <TopHeader />
        </div>

        <main className="flex-1 overflow-y-auto">
          {/* El contenido de Admin/Caja suele requerir más espacio, 
              usamos un max-width amplio o fluido */}
          <div className="max-w-[1600px] mx-auto w-full p-4 md:p-8">
            {children}
          </div>
        </main>

        {/* En móvil mostramos BottomNav para que el Admin no se quede sin navegación */}
        <BottomNav />
      </div>

      <ToastContainer />
    </div>
  )
}
