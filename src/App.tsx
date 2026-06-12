import { useEffect, useState } from 'react'
import AppRoutes from './routes'
import { hidratarDesdeSupabase, suscribirRealtime, escucharErroresDeSync } from './lib/sync'
import { useToastStore } from './store/useToastStore'

/**
 * App — Rincón Andino
 * Arranque: hidrata los stores desde Supabase, abre la suscripción
 * realtime (mesero ↔ cocina ↔ caja en vivo) y delega a las rutas.
 */
export default function App() {
  const [listo, setListo] = useState(false)

  useEffect(() => {
    escucharErroresDeSync()
    void hidratarDesdeSupabase().then((ok) => {
      setListo(true)
      if (!ok) {
        useToastStore
          .getState()
          .addToast('Sin conexión con el servidor. Mostrando datos locales.', 'error')
      }
    })
    const desuscribir = suscribirRealtime()
    return desuscribir
  }, [])

  // Splash mínimo mientras llega el primer estado del servidor
  if (!listo) {
    return (
      <div className="min-h-[100dvh] bg-bone flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-terracotta text-white flex items-center justify-center font-display font-black text-lg animate-pulse">
          RA
        </div>
        <p className="text-sm font-medium text-carbon/50">Cargando Rincón Andino…</p>
      </div>
    )
  }

  return <AppRoutes />
}
