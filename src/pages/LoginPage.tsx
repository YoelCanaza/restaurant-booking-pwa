import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, ArrowRight, LayoutGrid } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useToastStore } from '../store/useToastStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const HERO = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=70&auto=format&fit=crop'

export default function LoginPage() {
  const navigate = useNavigate()
  const loginPorTelefono = useAuthStore((s) => s.loginPorTelefono)
  const addToast = useToastStore((s) => s.addToast)
  const [telefono, setTelefono] = useState('')

  const handleLogin = () => {
    if (!telefono.trim()) {
      addToast('Ingresa tu número de teléfono', 'error')
      return
    }
    const r = loginPorTelefono(telefono)
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
        {/* Marca */}
        <div className="text-center mb-7 text-white">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl border border-white/25 bg-white/5 backdrop-blur-sm flex items-center justify-center font-display text-xl font-black">
            RA
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber mb-1">Gastronomía puneña</p>
          <h1 className="font-display text-3xl font-black tracking-tight m-0">Rincón Andino</h1>
        </div>

        {/* Tarjeta */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="font-display text-xl font-bold text-carbon m-0">Iniciar sesión</h2>
          <p className="text-sm text-carbon/55 mt-1 mb-5">Ingresa con el teléfono de tu cuenta.</p>

          <div className="flex flex-col gap-4">
            <Input
              label="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              inputMode="numeric"
              placeholder="9XXXXXXXX"
              icon={<Phone size={18} />}
            />
            <Button onClick={handleLogin} fullWidth>
              Ingresar <ArrowRight size={18} />
            </Button>
          </div>

          <p className="text-sm text-center text-carbon/55 mt-5">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold text-terracotta hover:underline">Crear cuenta</Link>
          </p>
        </div>

        {/* Acceso demo */}
        <button
          onClick={() => navigate('/demo')}
          className="mt-5 w-full flex items-center justify-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          <LayoutGrid size={15} /> Explorar como demostración
        </button>
      </motion.div>
    </div>
  )
}
