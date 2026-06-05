import { useNavigate } from 'react-router-dom'
import { Phone, Mail, Calendar, ShoppingBag, LogOut, Star, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useCurrentUser } from '../../hooks'
import PageHeader from '../../components/ui/PageHeader'

export default function ClientProfilePage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const logout = useAuthStore((s) => s.logout)
  const pedidos = useAppStore((s) => s.pedidos)

  const puntos = Math.round(
    pedidos
      .filter((p) => p.clienteId === user?.id && (p.estado === 'entregado' || p.estado === 'pagado'))
      .reduce((s, p) => s + p.total, 0)
  )

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex flex-col gap-7 px-6 pt-6 pb-24 max-w-2xl mx-auto w-full">
      <PageHeader eyebrow="Cliente" title="Mi cuenta" subtitle="Tus datos y beneficios" />

      {/* Identidad */}
      <div className="bg-white rounded-2xl border border-carbon/[0.08] p-5 flex items-center gap-4 shadow-sm">
        <span className="w-14 h-14 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center font-display font-black text-lg shrink-0">
          {user?.avatarInitials ?? user?.name?.slice(0, 2).toUpperCase() ?? 'RA'}
        </span>
        <div className="min-w-0">
          <p className="font-display font-bold text-lg text-carbon truncate m-0">{user?.name ?? 'Invitado'}</p>
          <p className="flex items-center gap-1.5 text-sm text-carbon/50 m-0 mt-0.5"><Phone size={13} /> {user?.phone ?? '—'}</p>
          {user?.email && <p className="flex items-center gap-1.5 text-sm text-carbon/50 m-0 mt-0.5"><Mail size={13} /> {user.email}</p>}
        </div>
      </div>

      {/* Puntos */}
      <div className="rounded-2xl bg-carbon text-white p-6 relative overflow-hidden">
        <div className="andean-motif absolute inset-0 opacity-[0.07]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-amber mb-2">
            <Star size={16} className="fill-amber" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">Puntos de fidelidad</span>
          </div>
          <p className="font-display text-4xl font-black m-0">{puntos} <span className="text-xl text-white/60">pts</span></p>
          <p className="text-sm text-white/55 mt-2 m-0">Ganas 1 punto por cada S/1 en pedidos entregados. Canje de descuentos próximamente.</p>
        </div>
      </div>

      {/* Accesos */}
      <div className="bg-white rounded-2xl border border-carbon/[0.08] overflow-hidden shadow-sm">
        {[
          { icon: Calendar, label: 'Mis reservas', to: '/cliente/reservas' },
          { icon: ShoppingBag, label: 'Mis pedidos', to: '/cliente/pedidos' },
        ].map((it) => (
          <button
            key={it.to}
            onClick={() => navigate(it.to)}
            className="w-full flex items-center gap-3 px-5 py-4 border-b border-carbon/[0.06] last:border-0 hover:bg-bone/50 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center"><it.icon size={18} /></span>
            <span className="flex-1 font-semibold text-carbon">{it.label}</span>
            <ChevronRight size={18} className="text-carbon/30" />
          </button>
        ))}
      </div>

      {/* Salir */}
      <button
        onClick={handleLogout}
        className="w-full h-12 rounded-xl border border-error/30 text-error font-semibold inline-flex items-center justify-center gap-2 hover:bg-error hover:text-white transition-colors"
      >
        <LogOut size={18} /> Cerrar sesión
      </button>
    </div>
  )
}
