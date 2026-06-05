import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useToastStore } from '../store/useToastStore'
import { useCurrentUser } from '../hooks'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

/**
 * ChangePasswordPage — primer ingreso del personal: obliga a reemplazar la
 * contraseña temporal asignada por el admin antes de continuar.
 */
export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const cambiarPasswordPropia = useAuthStore((s) => s.cambiarPasswordPropia)
  const addToast = useToastStore((s) => s.addToast)
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')

  const handleGuardar = () => {
    if (p1.trim().length < 4) { addToast('La contraseña debe tener al menos 4 caracteres', 'error'); return }
    if (p1 !== p2) { addToast('Las contraseñas no coinciden', 'error'); return }
    const r = cambiarPasswordPropia(p1)
    if (r.ok) { addToast('Contraseña actualizada', 'success'); navigate('/') }
    else addToast(r.error ?? 'No se pudo actualizar', 'error')
  }

  return (
    <div className="min-h-[100dvh] relative flex flex-col items-center justify-center p-6 bg-carbon overflow-hidden">
      <div className="andean-motif absolute inset-0 opacity-[0.06]" />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-6 text-white">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-terracotta/20 border border-white/15 flex items-center justify-center">
            <ShieldCheck size={26} className="text-amber" />
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight m-0">Crea tu contraseña</h1>
          <p className="text-white/55 text-sm mt-2">
            Hola{user?.name ? `, ${user.name.split(' ')[0]}` : ''}. Por seguridad, reemplaza la contraseña temporal antes de continuar.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col gap-4">
          <Input label="Nueva contraseña" type="password" value={p1} onChange={(e) => setP1(e.target.value)} placeholder="••••••••" icon={<KeyRound size={18} />} />
          <Input
            label="Repite la contraseña" type="password" value={p2}
            onChange={(e) => setP2(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGuardar()}
            placeholder="••••••••" icon={<KeyRound size={18} />}
          />
          <Button onClick={handleGuardar} fullWidth>Guardar y continuar</Button>
        </div>
      </motion.div>
    </div>
  )
}
