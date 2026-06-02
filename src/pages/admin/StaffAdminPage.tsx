import { useState } from 'react'
import { UserPlus, Users, Phone } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useToastStore } from '../../store/useToastStore'
import { useCurrentUser } from '../../hooks'
import type { UserRole } from '../../types'
import PageHeader from '../../components/ui/PageHeader'
import Panel, { PanelRow } from '../../components/ui/Panel'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const ROLES_EMPLEADO: { id: Exclude<UserRole, 'cliente' | 'admin'>; label: string }[] = [
  { id: 'mesero', label: 'Mesero' },
  { id: 'cocina', label: 'Cocina' },
  { id: 'caja', label: 'Cajero' },
  { id: 'delivery', label: 'Repartidor' },
]
const roleLabel = (r: UserRole) =>
  r === 'caja' ? 'Cajero' : r === 'delivery' ? 'Repartidor' : r === 'cocina' ? 'Cocina' : r === 'mesero' ? 'Mesero' : 'Administrador'

export default function StaffAdminPage() {
  const user = useCurrentUser()
  const users = useAuthStore((s) => s.users)
  const addEmpleado = useAuthStore((s) => s.addEmpleado)
  const toggleEmpleadoActivo = useAuthStore((s) => s.toggleEmpleadoActivo)
  const cambiarRolEmpleado = useAuthStore((s) => s.cambiarRolEmpleado)
  const addToast = useToastStore((s) => s.addToast)

  const adminId = user?.id ?? ''
  const empleados = users.filter((u) => u.role !== 'cliente')

  const [modalOpen, setModalOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [rol, setRol] = useState<Exclude<UserRole, 'cliente' | 'admin'>>('mesero')

  const resetForm = () => { setNombre(''); setTelefono(''); setRol('mesero') }

  const handleCrear = () => {
    if (!nombre.trim() || !/^\d{9}$/.test(telefono)) {
      addToast('Completa el nombre y un teléfono de 9 dígitos', 'error')
      return
    }
    const r = addEmpleado({ name: nombre.trim(), phone: telefono, role: rol }, adminId)
    if (r.ok) {
      addToast(`${nombre.trim()} agregado como ${roleLabel(rol)}`, 'success')
      setModalOpen(false)
      resetForm()
    } else {
      addToast(r.error ?? 'No se pudo crear el empleado', 'error')
    }
  }

  const handleToggle = (id: string, activo: boolean) => {
    const r = toggleEmpleadoActivo(id, adminId)
    if (r.ok) addToast(activo ? 'Empleado desactivado' : 'Empleado reactivado', 'warning')
    else addToast(r.error ?? 'Acción no permitida', 'error')
  }

  const handleRol = (id: string, nuevo: UserRole) => {
    const r = cambiarRolEmpleado(id, nuevo, adminId)
    if (r.ok) addToast(`Rol cambiado a ${roleLabel(nuevo)}`, 'success')
    else addToast(r.error ?? 'No se pudo cambiar el rol', 'error')
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Administración"
        title="Personal"
        subtitle={`${empleados.length} miembros del equipo`}
        action={
          <Button onClick={() => setModalOpen(true)}>
            <UserPlus size={18} /> Agregar empleado
          </Button>
        }
      />

      <Panel flush>
        {empleados.length === 0 ? (
          <EmptyState icon={Users} title="Sin empleados" description="Agrega al primer miembro del equipo." />
        ) : (
          empleados.map((e) => {
            const esAdmin = e.role === 'admin'
            const esYo = e.id === adminId
            return (
              <PanelRow key={e.id}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${e.activo ? 'bg-terracotta/10 text-terracotta' : 'bg-carbon/5 text-carbon/40'}`}>
                    {e.avatarInitials ?? e.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-carbon truncate m-0">
                      {e.name}{esYo && <span className="text-carbon/40 font-medium"> · tú</span>}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm text-carbon/45 m-0 mt-0.5">
                      <Phone size={12} /> {e.phone}
                      {!e.activo && <span className="ml-1 text-error font-semibold">· Inactivo</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {esAdmin ? (
                    <span className="text-[11px] font-bold uppercase tracking-wide text-carbon/45 border border-carbon/10 px-2 py-1 rounded">Administrador</span>
                  ) : (
                    <>
                      <select
                        value={e.role}
                        onChange={(ev) => handleRol(e.id, ev.target.value as UserRole)}
                        className="h-9 rounded-lg border border-carbon/[0.08] bg-white px-2.5 text-sm font-medium text-carbon focus:outline-none focus:border-terracotta"
                        aria-label={`Rol de ${e.name}`}
                      >
                        {ROLES_EMPLEADO.map((r) => (
                          <option key={r.id} value={r.id}>{r.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleToggle(e.id, e.activo)}
                        className={`h-9 px-3 rounded-lg text-sm font-semibold border transition-colors ${
                          e.activo
                            ? 'border-carbon/[0.08] text-carbon/60 hover:bg-carbon hover:text-white'
                            : 'border-terracotta bg-terracotta/10 text-terracotta hover:bg-terracotta hover:text-white'
                        }`}
                      >
                        {e.activo ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </>
                  )}
                </div>
              </PanelRow>
            )
          })
        )}
      </Panel>

      {/* Modal: nuevo empleado */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo empleado"
        subtitle="Crea credenciales para un miembro del equipo"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleCrear} className="flex-1">Crear empleado</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Input label="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Rosa Mamani" />
          <Input label="Teléfono (9 dígitos)" value={telefono} onChange={(e) => setTelefono(e.target.value)} inputMode="numeric" placeholder="9XXXXXXXX" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-carbon/60 uppercase tracking-wider pl-1">Rol</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES_EMPLEADO.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRol(r.id)}
                  className={`h-11 rounded-xl text-sm font-bold border-2 transition-colors ${
                    rol === r.id ? 'border-terracotta bg-terracotta/10 text-terracotta' : 'border-carbon/[0.08] bg-white text-carbon/70 hover:border-carbon/20'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-carbon/45 leading-relaxed">
            Se crea con una contraseña temporal (demo). El empleado podrá cambiarla en su primer ingreso cuando exista login real.
          </p>
        </div>
      </Modal>
    </div>
  )
}
