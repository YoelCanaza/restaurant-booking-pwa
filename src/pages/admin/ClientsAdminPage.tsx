import { useMemo, useState } from 'react'
import { Users, Phone, Search } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import PageHeader from '../../components/ui/PageHeader'
import Panel, { PanelRow } from '../../components/ui/Panel'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'

type Segmento = 'frecuente' | 'nuevo' | 'inactivo' | 'activo'
const SEG: Record<Segmento, { label: string; color: string; bg: string }> = {
  frecuente: { label: 'Frecuente', color: '#16A34A', bg: 'rgba(22,163,74,0.12)' },
  nuevo: { label: 'Nuevo', color: '#E05936', bg: 'rgba(224,89,54,0.12)' },
  inactivo: { label: 'Inactivo', color: '#94908A', bg: 'rgba(148,144,138,0.14)' },
  activo: { label: 'Activo', color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
}

const dias = (iso: string) => (Date.now() - new Date(iso).getTime()) / 86_400_000

export default function ClientsAdminPage() {
  const clientes = useAuthStore((s) => s.users).filter((u) => u.role === 'cliente')
  const pedidos = useAppStore((s) => s.pedidos)
  const reservas = useAppStore((s) => s.reservas)
  const [q, setQ] = useState('')

  const filas = useMemo(() => {
    return clientes
      .map((c) => {
        const susPedidos = pedidos.filter((p) => p.clienteId === c.id)
        const susReservas = reservas.filter((r) => r.userId === c.id)
        const pedidos30 = susPedidos.filter((p) => dias(p.createdAt) <= 30).length
        const ultimoPedido = susPedidos.length
          ? Math.min(...susPedidos.map((p) => dias(p.createdAt)))
          : Infinity

        let seg: Segmento = 'activo'
        if (susPedidos.length === 0 || ultimoPedido > 30) seg = 'inactivo'
        else if (pedidos30 >= 4) seg = 'frecuente'
        else if (ultimoPedido <= 7 && susPedidos.length <= 1) seg = 'nuevo'

        return { c, pedidos: susPedidos.length, reservas: susReservas.length, seg }
      })
      .filter((f) => f.c.name.toLowerCase().includes(q.toLowerCase()) || f.c.phone.includes(q))
  }, [clientes, pedidos, reservas, q])

  return (
    <div className="flex flex-col gap-7">
      <PageHeader eyebrow="Administración" title="Clientes" subtitle={`${clientes.length} clientes registrados`} />

      <div className="max-w-sm">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o teléfono…" icon={<Search size={18} />} />
      </div>

      <Panel flush>
        {filas.length === 0 ? (
          <EmptyState icon={Users} title="Sin clientes" description="No hay clientes que coincidan con la búsqueda." />
        ) : (
          filas.map(({ c, pedidos, reservas, seg }) => (
            <PanelRow key={c.id}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-full bg-carbon/5 text-carbon/60 flex items-center justify-center font-bold text-sm shrink-0">
                  {c.avatarInitials ?? c.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-carbon truncate m-0">{c.name}</p>
                  <p className="flex items-center gap-1.5 text-sm text-carbon/45 m-0 mt-0.5">
                    <Phone size={12} /> {c.phone} · {pedidos} pedidos · {reservas} reservas
                  </p>
                </div>
              </div>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold shrink-0"
                style={{ color: SEG[seg].color, backgroundColor: SEG[seg].bg }}
              >
                {SEG[seg].label}
              </span>
            </PanelRow>
          ))
        )}
      </Panel>
    </div>
  )
}
