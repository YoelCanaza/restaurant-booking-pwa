import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Fuentes self-hosted (PWA offline-friendly): Inter (body) + Fraunces (display)
import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces'
import './index.css'
import App from './App.tsx'

/**
 * Rincón Andino — PWA Mobile-First
 * BrowserRouter envuelve la app para habilitar react-router-dom.
 * En Fase 3 se configurarán las rutas en src/routes/index.tsx.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
