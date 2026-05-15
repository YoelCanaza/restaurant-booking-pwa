import { type ReactNode } from 'react'
import TopHeader from './Navbar'
import BottomNav from './BottomNav'
import ToastContainer from '../ui/Toast'

interface MainLayoutProps {
  children: ReactNode
}

/**
 * MainLayout — Rincón Andino
 * ─────────────────────────────────────────────────────────────
 * Wrapper principal con:
 *  - TopHeader sticky (logo + título de página)
 *  - Área de contenido scrollable con padding-bottom para
 *    que nada quede bajo el BottomNav (Ley de Fitts)
 *  - BottomNav fijo en la parte inferior (Nielsen #6)
 *
 * Usamos useLocation() aquí para que MainLayout (y por tanto
 * BottomNav) se re-renderice en cada cambio de ruta, manteniendo
 * sincronizado el active state de los tabs.
 */
export default function MainLayout({ children }: MainLayoutProps) {

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--color-bone)',
      }}
    >
      {/* Contenedor que simula viewport móvil en pantallas grandes */}
      <div
        style={{
          maxWidth: 448,
          margin: '0 auto',
          minHeight: '100dvh',
          backgroundColor: 'var(--color-bone)',
          position: 'relative',
          boxShadow: '0 0 0 1px rgba(45,42,38,0.06), 0 4px 40px rgba(45,42,38,0.08)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header superior */}
        <TopHeader />

        {/* Contenido principal */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {children}
        </main>

        <BottomNav />
        <ToastContainer />
      </div>
    </div>
  )
}
