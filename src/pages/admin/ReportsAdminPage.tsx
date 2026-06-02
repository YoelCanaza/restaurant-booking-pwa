import { useMemo } from 'react'
import { DollarSign, Store, Bike, CalendarX } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import PageHeader from '../../components/ui/PageHeader'
import Panel from '../../components/ui/Panel'
import StatCard from '../../components/ui/StatCard'

export default function ReportsAdminPage() {
  const pedidos = useAppStore((s) => s.pedidos)
  const reservas = useAppStore((s) => s.reservas)

  const m = useMemo(() => {
    const cerrados = pedidos.filter((p) => p.estado === 'entregado' || p.estado === 'pagado')
    const ventas = cerrados.reduce((s, p) => s + p.total, 0)
    const ventasSalon = cerrados.filter((p) => p.tipo === 'salon').reduce((s, p) => s + p.total, 0)
    const ventasDelivery = cerrados.filter((p) => p.tipo === 'delivery').reduce((s, p) => s + p.total, 0)

    // Ranking de platos (todos los pedidos no cancelados)
    const conteo = new Map<string, { nombre: string; cantidad: number }>()
    pedidos
      .filter((p) => p.estado !== 'cancelado')
      .forEach((p) => p.items.forEach((it) => {
        const prev = conteo.get(it.platoId) ?? { nombre: it.nombre, cantidad: 0 }
        prev.cantidad += it.cantidad
        conteo.set(it.platoId, prev)
      }))
    const ranking = [...conteo.values()].sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
    const maxCant = ranking[0]?.cantidad ?? 1

    const totalReservas = reservas.length
    const canceladas = reservas.filter((r) => r.estado === 'cancelada' || r.estado === 'no_show').length
    const tasaCancel = totalReservas ? Math.round((canceladas / totalReservas) * 100) : 0

    return { ventas, ventasSalon, ventasDelivery, ranking, maxCant, totalReservas, tasaCancel }
  }, [pedidos, reservas])

  const pctSalon = m.ventas ? Math.round((m.ventasSalon / m.ventas) * 100) : 0
  const pctDelivery = 100 - pctSalon

  return (
    <div className="flex flex-col gap-7">
      <PageHeader eyebrow="Administración" title="Reportes" subtitle="Resumen consolidado de operaciones" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard index={0} icon={DollarSign} accent="#16A34A" label="Ventas cerradas" value={`S/ ${m.ventas.toFixed(2)}`} hint="entregados y pagados" />
        <StatCard index={1} icon={Store} accent="var(--color-terracotta)" label="Canal salón" value={`S/ ${m.ventasSalon.toFixed(0)}`} hint={`${pctSalon}% del total`} />
        <StatCard index={2} icon={Bike} accent="var(--color-amber)" label="Canal delivery" value={`S/ ${m.ventasDelivery.toFixed(0)}`} hint={`${pctDelivery}% del total`} />
        <StatCard index={3} icon={CalendarX} accent="#EF4444" label="Cancelación reservas" value={`${m.tasaCancel}%`} hint={`${m.totalReservas} reservas totales`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Panel title="Platos más vendidos">
          {m.ranking.length === 0 ? (
            <p className="text-sm text-carbon/45 m-0">Aún no hay ventas registradas.</p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {m.ranking.map((r, i) => (
                <div key={r.nombre} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-bold text-carbon/35 tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-carbon truncate">{r.nombre}</span>
                      <span className="text-sm font-bold text-carbon/60 tabular-nums shrink-0">{r.cantidad}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-carbon/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-terracotta" style={{ width: `${(r.cantidad / m.maxCant) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Distribución por canal">
          <div className="flex flex-col gap-5">
            <ChannelBar label="Salón" value={pctSalon} color="var(--color-terracotta)" amount={m.ventasSalon} />
            <ChannelBar label="Delivery" value={pctDelivery} color="var(--color-amber)" amount={m.ventasDelivery} />
            <p className="text-xs text-carbon/45 leading-relaxed m-0">
              Métricas calculadas sobre pedidos cerrados (entregados/pagados) de los datos actuales.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function ChannelBar({ label, value, color, amount }: { label: string; value: number; color: string; amount: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-carbon">{label}</span>
        <span className="text-sm font-bold text-carbon/60 tabular-nums">{value}% · S/ {amount.toFixed(0)}</span>
      </div>
      <div className="h-2.5 rounded-full bg-carbon/[0.06] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
