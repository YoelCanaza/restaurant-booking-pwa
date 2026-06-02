import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { User, Phone, Mail, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useToastStore } from '../store/useToastStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

const HERO = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=70&auto=format&fit=crop'

export default function RegisterPage() {
  const navigate = useNavigate()
  const registrarCliente = useAuthStore((s) => s.registrarCliente)
  const addToast = useToastStore((s) => s.addToast)

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')

  const handleRegistro = () => {
    if (!nombre.trim()) {
      addToast('Ingresa tu nombre completo', 'error')
      return
    }
    const r = registrarCliente({ name: nombre.trim(), phone: telefono.trim(), email: email.trim() || undefined })
    if (r.ok) {
      addToast(`¡Bienvenido, ${nombre.trim().split(' ')[0]}!`, 'success')
      navigate('/') // auto-login → RootRedirect lleva a /cliente
    } else {
      addToast(r.error ?? 'No se pudo crear la cuenta', 'error')
    }
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
        <div className="text-center mb-7 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber mb-1">Únete a la mesa</p>
          <h1 className="font-display text-3xl font-black tracking-tight m-0">Crear cuenta</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col gap-4">
            <Input label="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. María Quispe" icon={<User size={18} />} />
            <Input label="Teléfono (9 dígitos)" value={telefono} onChange={(e) => setTelefono(e.target.value)} inputMode="numeric" placeholder="9XXXXXXXX" icon={<Phone size={18} />} />
            <Input label="Correo (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="tucorreo@ejemplo.com" icon={<Mail size={18} />} />
            <Button onClick={handleRegistro} fullWidth>Crear mi cuenta</Button>
          </div>

          <p className="text-[11px] text-carbon/45 leading-relaxed mt-4">
            El teléfono es tu identificador. La verificación segura (contraseña/OTP) llegará con el backend.
          </p>
        </div>

        <Link to="/" className="mt-5 w-full flex items-center justify-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={15} /> Ya tengo cuenta
        </Link>
      </motion.div>
    </div>
  )
}
