import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users, Grid3X3, Package, DollarSign,
  Clock, ChevronRight, Check, X, Boxes, ScrollText,
  type LucideIcon,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useToastStore } from '../../store/useToastStore'
import { useCurrentUser } from '../../hooks'
import { visualPedido, visualReserva } from '../../lib/estados'
import StatusPill from '../../components/ui/StatusPill'

/* ════════════════════════════════════════════════════════════════
   AdminDashboard — pantalla de referencia del rediseño "Andino Pro".
   Lenguaje visual: header limpio tipo software, KPIs analíticos con
   barra de acento, paneles densos con divisores finos (hairline),
   radios contenidos, sombras suaves, terracota como acento puntual.
   ════════════════════════════════════════════════════════════════ */

const HAIRLINE = 'border-carbon/[0.08]'

export default function AdminDashboard() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const updateReservaEstado = useAppStore((s) => s.updateReservaEstado)
  const addToast = useToastStore((s) => s.addToast)

  const reservas = useAppStore((s) => s.reservas)
  const pedidos = useAppStore((s) => s.pedidos)
  const mesas = useAppStore((s) => s.mesas)

  const todayStr = new Date().toISOString().split('T')[0]

  // ─── KPIs (datos reales del mock) ──────────────────────────
  const reservasHoy = reservas.filter((r) => r.fecha === todayStr).length
  const confirmadasHoy = reservas.filter((r) => r.fecha === todayStr && r.estado === 'confirmada').length
  const mesasOcupadas = mesas.filter((m) => m.estado !== 'libre').length
  const ocupacionPct = mesas.length ? Math.round((mesasOcupadas / mesas.length) * 100) : 0
  const pedidosActivos = pedidos.filter((p) => ['nuevo', 'preparando', 'en_camino'].includes(p.estado)).length
  const pedidosNuevos = pedidos.filter((p) => p.estado === 'nuevo').length
  const pedidosHoy = pedidos.filter((p) => p.createdAt.startsWith(todayStr))
  const ingresosHoy = pedidosHoy.reduce((sum, p) => sum + p.total, 0)

  const ultimosPedidos = [...pedidos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
  const ultimasReservas = [...reservas]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const fechaLarga = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="flex flex-col gap-7">

      {/* ─── Header ───────────────────────────────────────────── */}
      <header className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b ${HAIRLINE} pb-6`}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-2">
            Panel de administración
          </p>
          <h1 className="font-display text-3xl md:text-[2.6rem] leading-none font-black tracking-tight text-carbon m-0">
            Buen día, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-carbon/45 font-medium mt-2 m-0 capitalize">{fechaLarga}</p>
        </div>
        <div className={`inline-flex items-center gap-2 self-start sm:self-auto bg-white border ${HAIRLINE} px-3.5 py-2 rounded-lg text-sm font-semibold text-carbon/70 shadow-sm`}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Sistema operativo
        </div>
      </header>

      {/* ─── KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi index={0} icon={DollarSign} accent="#16A34A" label="Ingresos de hoy"
          value={`S/ ${ingresosHoy.toFixed(2)}`} hint={`${pedidosHoy.length} pedidos registrados`} />
        <Kpi index={1} icon={Package} accent="var(--color-amber)" label="Delivery activo"
          value={pedidosActivos} hint={`${pedidosNuevos} sin asignar`} />
        <Kpi index={2} icon={Users} accent="var(--color-terracotta)" label="Reservas de hoy"
          value={reservasHoy} hint={`${confirmadasHoy} confirmadas`} />
        <Kpi index={3} icon={Grid3X3} accent="#2563EB" label="Mesas en uso"
          value={`${mesasOcupadas}/${mesas.length}`} hint={`${ocupacionPct}% de ocupación`} />
      </div>

      {/* ─── Cuerpo: dos columnas ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Columna principal */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Últimos pedidos */}
          <Panel
            title="Últimos pedidos"
            action={<PanelAction label="Ver todos" icon={ChevronRight} onClick={() => navigate('/admin/pedidos')} />}
          >
            {ultimosPedidos.length ? ultimosPedidos.map((p, i) => (
              <Row key={p.id} index={i}>
                <div className="min-w-0">
                  <p className="font-semibold text-carbon truncate m-0">{p.clienteNombre}</p>
                  <p className="text-sm text-carbon/45 m-0 mt-0.5">
                    {p.tipo === 'salon' ? 'Salón' : 'Delivery'} · {p.items.length} ítems · S/ {p.total.toFixed(2)}
                  </p>
                </div>
                <StatusPill visual={visualPedido(p.estado)} />
              </Row>
            )) : <Empty icon={Package} text="No hay pedidos recientes" />}
          </Panel>

          {/* Últimas reservas */}
          <Panel
            title="Últimas reservas"
            action={<PanelAction label="Ver todas" icon={ChevronRight} onClick={() => navigate('/admin/reservas')} />}
          >
            {ultimasReservas.length ? ultimasReservas.map((res, i) => (
              <Row key={res.id} index={i}>
                <div className="min-w-0">
                  <p className="font-semibold text-carbon truncate m-0">{res.nombre}</p>
                  <p className="flex items-center gap-1.5 text-sm text-carbon/45 m-0 mt-0.5">
                    <Clock size={13} /> {res.fecha} · {res.hora}
                    <span className="mx-1">·</span>
                    <Users size={13} /> {res.personas} pax
                  </p>
                </div>
                {res.estado === 'pendiente' ? (
                  <div className="flex gap-2 shrink-0">
                    <button
                      aria-label="Rechazar reserva"
                      onClick={() => {
                        updateReservaEstado(res.id, 'cancelada', user?.id ?? '', user?.role ?? 'admin', 'Rechazada por el admin')
                        addToast('Reserva rechazada', 'warning')
                      }}
                      className={`w-9 h-9 rounded-lg border ${HAIRLINE} flex items-center justify-center text-carbon/50 hover:bg-error hover:text-white hover:border-error transition-colors`}
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      aria-label="Confirmar reserva"
                      onClick={() => {
                        updateReservaEstado(res.id, 'confirmada', user?.id ?? '', user?.role ?? 'admin')
                        addToast('Reserva confirmada', 'success')
                      }}
                      className="w-9 h-9 rounded-lg bg-terracotta text-white flex items-center justify-center hover:bg-terracotta/90 transition-colors shadow-sm"
                    >
                      <Check size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <StatusPill visual={visualReserva(res.estado)} />
                )}
              </Row>
            )) : <Empty icon={Users} text="No hay reservas recientes" />}
          </Panel>
        </div>

        {/* Columna lateral */}
        <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-6">
          <Panel title="Herramientas">
            <ToolRow icon={Boxes} label="Kardex / Inventario"
              onClick={() => addToast('Kardex e Inventario: próximamente (demo)', 'warning')} />
            <ToolRow icon={ScrollText} label="Logs de auditoría"
              onClick={() => addToast('Logs de auditoría: próximamente (demo)', 'warning')} />
          </Panel>

          {/* Acción destacada */}
          <div className="rounded-xl bg-carbon text-white p-6 relative overflow-hidden">
            <div className="andean-motif absolute inset-0 opacity-[0.07] pointer-events-none" />
            <div className="relative">
              <h4 className="font-display m-0 text-xl font-bold mb-1.5">Reporte del día</h4>
              <p className="text-sm text-white/55 m-0 mb-5 leading-relaxed">
                Consolida ventas, ocupación y pedidos de la jornada en un solo documento.
              </p>
              <button
                onClick={() => addToast('Generación de reportes: próximamente (demo)', 'warning')}
                className="w-full h-11 rounded-lg bg-terracotta text-white font-semibold text-sm hover:bg-terracotta/90 transition-colors inline-flex items-center justify-center gap-2"
              >
                Generar reporte
                <span className="text-[10px] font-bold uppercase tracking-wide bg-white/15 px-1.5 py-0.5 rounded">Demo</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ─── Subcomponentes locales (lenguaje visual del rediseño) ───── */

function Kpi({ icon: Icon, accent, label, value, hint, index }: {
  icon: LucideIcon; accent: string; label: string; value: string | number; hint: string; index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={`relative bg-white rounded-xl border ${HAIRLINE} p-5 pl-6 overflow-hidden shadow-[0_1px_3px_rgba(45,42,38,0.05)]`}
    >
      <span className="absolute left-0 top-0 h-full w-1.5" style={{ backgroundColor: accent }} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-carbon/40">{label}</span>
        <span className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`, color: accent }}>
          <Icon size={16} strokeWidth={2.4} />
        </span>
      </div>
      <div className="font-display text-[2rem] leading-none font-black text-carbon">{value}</div>
      <p className="text-xs font-medium text-carbon/45 mt-2 m-0">{hint}</p>
    </motion.div>
  )
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={`bg-white rounded-xl border ${HAIRLINE} overflow-hidden shadow-[0_1px_3px_rgba(45,42,38,0.05)]`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${HAIRLINE}`}>
        <h3 className="font-display text-lg font-bold text-carbon m-0">{title}</h3>
        {action}
      </div>
      <div>{children}</div>
    </section>
  )
}

function PanelAction({ label, icon: Icon, onClick }: { label: string; icon?: LucideIcon; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:gap-1.5 transition-all bg-transparent border-none cursor-pointer">
      {label} {Icon && <Icon size={15} />}
    </button>
  )
}

function Row({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className={`flex items-center justify-between gap-4 px-5 py-3.5 border-b ${HAIRLINE} last:border-0 hover:bg-bone/50 transition-colors`}
    >
      {children}
    </motion.div>
  )
}

function ToolRow({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3.5 border-b ${HAIRLINE} last:border-0 hover:bg-bone/50 transition-colors text-left group`}
    >
      <span className="w-9 h-9 rounded-lg bg-bone flex items-center justify-center text-carbon/60 group-hover:text-terracotta transition-colors">
        <Icon size={18} />
      </span>
      <span className="flex-1 font-semibold text-carbon text-sm">{label}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-carbon/35 border border-carbon/10 px-1.5 py-0.5 rounded">Demo</span>
      <ChevronRight size={16} className="text-carbon/30 group-hover:text-carbon/60 transition-colors" />
    </button>
  )
}

function Empty({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 text-carbon/35">
      <Icon size={32} strokeWidth={1.5} className="mb-2" />
      <p className="m-0 text-sm font-medium">{text}</p>
    </div>
  )
}
