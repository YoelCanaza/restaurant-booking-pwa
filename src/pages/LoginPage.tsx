import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Phone, KeyRound, ArrowRight, LayoutGrid, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useToastStore } from '../store/useToastStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const HERO = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=70&auto=format&fit=crop'

// "G" de Google (los íconos de marca no vienen en lucide)
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 2.97 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7C13.42 13.62 18.27 9.75 24 9.75z" />
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const loginConPassword = useAuthStore((s) => s.loginConPassword)
  const addToast = useToastStore((s) => s.addToast)
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')

  const handlePersonal = () => {
    if (!telefono.trim() || !password.trim()) {
      addToast('Ingresa tu teléfono y contraseña', 'error')
      return
    }
    const r = loginConPassword(telefono, password)
    if (r.ok) navigate('/')
    else addToast(r.error ?? 'No se pudo iniciar sesión', 'error')
  }

  return (
    <div className="min-h-[100dvh] relative flex flex-col items-center justify-center p-6 bg-carbon overflow-hidden">
      <img src={HERO} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-carbon/80 via-carbon/85 to-carbon" />
      <div className="andean-motif absolute inset-0 opacity-[0.06]" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-6 text-white">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl border border-white/25 bg-white/5 backdrop-blur-sm flex items-center justify-center font-display text-xl font-black">RA</div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber mb-1">Gastronomía puneña</p>
          <h1 className="font-display text-3xl font-black tracking-tight m-0">Rincón Andino</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {/* ── Clientes: Google + invitado ── */}
          <button
            onClick={() => addToast('Inicio con Google estará disponible al conectar el backend (demo)', 'warning')}
            className="w-full h-12 rounded-xl border border-carbon/15 bg-white text-carbon font-semibold inline-flex items-center justify-center gap-3 hover:bg-bone transition-colors"
          >
            <GoogleG /> Continuar con Google
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-2 w-full h-11 rounded-xl text-sm font-semibold text-carbon/70 inline-flex items-center justify-center gap-2 hover:bg-bone transition-colors"
          >
            <ShoppingBag size={16} /> Explorar como invitado
          </button>

          {/* ── Divisor ── */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-carbon/10" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-carbon/40">Acceso de personal</span>
            <div className="flex-1 h-px bg-carbon/10" />
          </div>

          {/* ── Personal: teléfono + contraseña ── */}
          <div className="flex flex-col gap-3">
            <Input label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} inputMode="numeric" placeholder="9XXXXXXXX" icon={<Phone size={18} />} />
            <Input
              label="Contraseña" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePersonal()}
              placeholder="••••••••" icon={<KeyRound size={18} />}
            />
            <Button onClick={handlePersonal} fullWidth>
              Ingresar <ArrowRight size={18} />
            </Button>
            <p className="text-[11px] text-carbon/40 text-center">Demo · ej. 954567890 · contraseña <strong>demo1234</strong></p>
          </div>
        </div>

        <button
          onClick={() => navigate('/demo')}
          className="mt-5 w-full flex items-center justify-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          <LayoutGrid size={15} /> Acceso de demostración por rol
        </button>
      </motion.div>
    </div>
  )
}
