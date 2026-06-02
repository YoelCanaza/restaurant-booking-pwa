import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, Plus, UtensilsCrossed, X, Loader2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useToastStore } from '../../store/useToastStore'
import { visualMesa, ESTADO_MESA } from '../../lib/estados'
import type { Mesa, EstadoMesa, PedidoItem } from '../../types'

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────
export default function WaiterDashboard() {
  const { mesas, pedidos, platos, crearComandaSalon, solicitarCuenta, updatePedidoEstado } = useAppStore()
  const { user } = useAuthStore()

  const addToast = useToastStore((s) => s.addToast)
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null)
  const [showComandaModal, setShowComandaModal] = useState(false)

  const meseroId = user?.id ?? 'usr_mesero_01'

  // Pedido activo de la mesa seleccionada
  const pedidoActivo = selectedMesa
    ? pedidos.find(
        (p) =>
          p.tipo === 'salon' &&
          p.mesaId === selectedMesa.id &&
          p.estado !== 'pagado' &&
          p.estado !== 'cancelado'
      )
    : null

  const handleSolicitarCuenta = () => {
    if (!pedidoActivo) return
    solicitarCuenta(pedidoActivo.id, meseroId)
    setSelectedMesa(null)
    addToast('Cuenta solicitada. El cajero procesará el cobro.', 'success')
  }

  const handleMarcarServido = () => {
    if (!pedidoActivo) return
    updatePedidoEstado(pedidoActivo.id, 'servido', meseroId, 'mesero')
    addToast('Pedido marcado como servido.', 'success')
    setSelectedMesa(null)
  }

  return (
    <div className="p-4 md:p-8 pb-24 min-h-full">
      <header className="mb-6 md:mb-8 max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="font-display m-0 mb-2 text-2xl md:text-3xl font-black text-carbon">Salón Principal</h1>
          <p className="text-carbon/60 text-sm md:text-base font-medium">
            {mesas.filter((m) => m.estado !== 'libre').length} de {mesas.length} mesas activas
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-3">
          {(['libre', 'pidiendo', 'esperando', 'comiendo', 'pagando'] as EstadoMesa[]).map((estado) => (
            <div key={estado} className="flex items-center gap-1.5 text-xs font-bold text-carbon/70 uppercase tracking-wide">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: visualMesa(estado).bg, border: `1.5px solid ${visualMesa(estado).color}` }}
              />
              {visualMesa(estado).label}
            </div>
          ))}
        </div>
      </header>

      {/* Mesas agrupadas por piso */}
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
       {[{ n: 1, l: 'Planta baja' }, { n: 2, l: 'Rooftop' }].map((grupo) => {
        const mesasPiso = mesas.filter((m) => (m.piso ?? 1) === grupo.n)
        if (mesasPiso.length === 0) return null
        return (
         <section key={grupo.n}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-lg font-black text-carbon">{grupo.l}</h2>
            <span className="text-xs font-bold text-carbon/40">{mesasPiso.length} mesas</span>
            <div className="flex-1 h-px bg-carbon/10" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {mesasPiso.map((mesa) => {
          const pedido = pedidos.find(
            (p) => p.tipo === 'salon' && p.mesaId === mesa.id && p.estado !== 'pagado' && p.estado !== 'cancelado'
          )
          // Minutos desde que se creó el pedido
          const minutosEspera = pedido
            ? Math.floor((Date.now() - new Date(pedido.createdAt).getTime()) / 60000)
            : null
          const esTarde = minutosEspera !== null && minutosEspera >= 30

          return (
            <motion.button
              key={mesa.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMesa(mesa)}
              className="rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm relative transition-all duration-200"
              style={{
                backgroundColor: visualMesa(mesa.estado).bg,
                border: `2px solid ${visualMesa(mesa.estado).color}`,
              }}
            >
              <span className="text-3xl font-black text-carbon/80">{mesa.numero}</span>
              <span className="text-sm text-carbon/60 font-bold bg-white/40 px-2 py-0.5 rounded-full">
                {mesa.capacidad} pax
              </span>
              <span className="text-xs font-bold text-carbon/50 uppercase tracking-wide">
                {visualMesa(mesa.estado).label}
              </span>

              {/* Indicador de tiempo de espera */}
              {minutosEspera !== null && (
                <div
                  className="absolute -top-2 -right-2 border-2 rounded-full px-2 py-0.5 text-xs font-bold flex items-center gap-1 shadow-md bg-white"
                  style={{
                    borderColor: esTarde ? '#EF4444' : ESTADO_MESA.esperando.color,
                    color: esTarde ? '#EF4444' : ESTADO_MESA.esperando.color,
                  }}
                >
                  <Clock size={11} strokeWidth={3} />
                  {minutosEspera}m
                </div>
              )}
            </motion.button>
          )
        })}
          </div>
         </section>
        )
       })}
      </div>

      {/* Modal de Acciones de Mesa */}
      <AnimatePresence>
        {selectedMesa && (
          <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-carbon/40 backdrop-blur-sm p-4"
            onClick={() => setSelectedMesa(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-border/50 pb-4">
                <div>
                  <h3 className="font-display m-0 text-xl font-black text-carbon">Mesa {selectedMesa.numero}</h3>
                  <p className="text-sm font-medium text-carbon/50 m-0 mt-0.5">
                    {selectedMesa.capacidad} personas •{' '}
                    <span className="font-bold" style={{ color: visualMesa(selectedMesa.estado).color }}>
                      {visualMesa(selectedMesa.estado).label}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMesa(null)}
                  className="w-10 h-10 rounded-full bg-bone flex items-center justify-center text-carbon hover:bg-border/50 transition-colors border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Resumen de pedido activo */}
              {pedidoActivo && (
                <div className="bg-bone rounded-xl p-4">
                  <p className="text-xs font-bold text-carbon/50 uppercase tracking-wide mb-2">Comanda activa</p>
                  {pedidoActivo.items.map((item) => (
                    <div key={item.platoId} className="flex justify-between text-sm font-medium text-carbon">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span>S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border/50 mt-2 pt-2 flex justify-between font-black text-carbon">
                    <span>Total</span>
                    <span>S/ {pedidoActivo.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="grid grid-cols-1 gap-3">
                {/* Nueva Comanda — solo si mesa libre/ocupada */}
                {(selectedMesa.estado === 'libre' || selectedMesa.estado === 'ocupada') && (
                  <button
                    onClick={() => { setShowComandaModal(true) }}
                    className="py-4 bg-terracotta text-white border-none rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-terracotta/90 transition-colors text-lg shadow-md shadow-terracotta/20"
                  >
                    <Plus size={20} strokeWidth={2.5} /> Nueva Comanda
                  </button>
                )}

                {/* Marcar servido — si cocina marcó listo */}
                {pedidoActivo && pedidoActivo.estado === 'listo' && (
                  <button
                    onClick={handleMarcarServido}
                    className="py-3 bg-emerald-500 text-white border-none rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-600 transition-colors"
                  >
                    <Check size={18} strokeWidth={2.5} /> Marcar Servido
                  </button>
                )}

                {/* Pedir cuenta — si está comiendo */}
                {pedidoActivo && pedidoActivo.estado === 'servido' && selectedMesa.estado !== 'pagando' && (
                  <button
                    onClick={handleSolicitarCuenta}
                    className="py-3 bg-surface text-carbon border border-border rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-bone transition-colors"
                  >
                    <UtensilsCrossed size={18} strokeWidth={2.5} /> Pedir Cuenta
                  </button>
                )}

                {/* Estado pagando */}
                {selectedMesa.estado === 'pagando' && (
                  <div className="py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" /> Esperando cobro en caja…
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nueva Comanda */}
      {showComandaModal && selectedMesa && (
        <ComandaModal
          mesa={selectedMesa}
          platos={platos.filter((p) => p.disponible)}
          meseroId={meseroId}
          onConfirm={(items) => {
            const result = crearComandaSalon(selectedMesa.id, items, meseroId)
            if (result.ok) {
              addToast(`Comanda de Mesa ${selectedMesa.numero} enviada a cocina.`, 'success')
              setShowComandaModal(false)
              setSelectedMesa(null)
            } else {
              addToast(result.error ?? 'Error al crear comanda.', 'error')
            }
          }}
          onClose={() => setShowComandaModal(false)}
        />
      )}
    </div>
  )
}

// ─── MODAL NUEVA COMANDA ─────────────────────────────────────
function ComandaModal({
  mesa,
  platos,
  onConfirm,
  onClose,
}: {
  mesa: Mesa
  platos: ReturnType<typeof useAppStore.getState>['platos']
  meseroId: string
  onConfirm: (items: PedidoItem[]) => void
  onClose: () => void
}) {
  const [seleccion, setSeleccion] = useState<Map<string, { cantidad: number; notas: string }>>(new Map())

  const toggleItem = (platoId: string) => {
    setSeleccion((prev) => {
      const next = new Map(prev)
      if (next.has(platoId)) {
        next.delete(platoId)
      } else {
        next.set(platoId, { cantidad: 1, notas: '' })
      }
      return next
    })
  }

  const updateCantidad = (platoId: string, delta: number) => {
    setSeleccion((prev) => {
      const next = new Map(prev)
      const entry = next.get(platoId)
      if (!entry) return next
      const nueva = entry.cantidad + delta
      if (nueva <= 0) next.delete(platoId)
      else next.set(platoId, { ...entry, cantidad: nueva })
      return next
    })
  }

  const handleConfirm = () => {
    if (seleccion.size === 0) return
    const items: PedidoItem[] = Array.from(seleccion.entries()).map(([platoId, { cantidad, notas }]) => {
      const plato = platos.find((p) => p.id === platoId)!
      return { platoId, nombre: plato.nombre, precio: plato.precio, cantidad, notas: notas || undefined }
    })
    onConfirm(items)
  }

  const categorias = [...new Set(platos.map((p) => p.categoria))]
  const totalItems = Array.from(seleccion.values()).reduce((acc, v) => acc + v.cantidad, 0)
  const totalPrice = Array.from(seleccion.entries()).reduce((acc, [id, { cantidad }]) => {
    const plato = platos.find((p) => p.id === id)
    return acc + (plato?.precio ?? 0) * cantidad
  }, 0)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-carbon/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border/50 shrink-0">
          <div>
            <h3 className="font-display m-0 text-xl font-black text-carbon">Nueva Comanda</h3>
            <p className="m-0 mt-0.5 text-sm text-carbon/50 font-medium">Mesa {mesa.numero} • {mesa.capacidad} pax</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-bone flex items-center justify-center border-none cursor-pointer hover:bg-border/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Lista de platos por categoría */}
        <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-4">
          {categorias.map((cat) => (
            <div key={cat}>
              <p className="text-xs font-black text-carbon/40 uppercase tracking-widest mb-2">{cat}</p>
              <div className="flex flex-col gap-2">
                {platos.filter((p) => p.categoria === cat).map((plato) => {
                  const entry = seleccion.get(plato.id)
                  const isSelected = !!entry
                  return (
                    <div
                      key={plato.id}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer"
                      style={{
                        borderColor: isSelected ? 'var(--color-terracotta)' : 'var(--color-border)',
                        backgroundColor: isSelected ? 'rgba(224,89,54,0.05)' : 'transparent',
                      }}
                      onClick={() => toggleItem(plato.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="m-0 font-bold text-sm text-carbon truncate">{plato.nombre}</p>
                        <p className="m-0 text-xs text-carbon/50">S/ {plato.precio.toFixed(2)}</p>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => updateCantidad(plato.id, -1)}
                            className="w-7 h-7 rounded-full bg-bone border border-border font-black flex items-center justify-center cursor-pointer text-carbon hover:bg-border/50"
                          >
                            −
                          </button>
                          <span className="font-black text-carbon w-4 text-center">{entry!.cantidad}</span>
                          <button
                            onClick={() => updateCantidad(plato.id, 1)}
                            className="w-7 h-7 rounded-full bg-terracotta text-white font-black flex items-center justify-center cursor-pointer border-none hover:bg-terracotta/90"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer con total y botón */}
        <div className="p-6 border-t border-border/50 shrink-0 flex items-center gap-4">
          <div className="flex-1">
            <p className="m-0 text-xs text-carbon/50 font-medium">{totalItems} ítems</p>
            <p className="m-0 text-xl font-black text-carbon">S/ {totalPrice.toFixed(2)}</p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={seleccion.size === 0}
            className="px-6 py-3 bg-terracotta text-white border-none rounded-xl font-bold text-base cursor-pointer hover:bg-terracotta/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-terracotta/20"
          >
            Enviar a Cocina
          </button>
        </div>
      </motion.div>
    </div>
  )
}
