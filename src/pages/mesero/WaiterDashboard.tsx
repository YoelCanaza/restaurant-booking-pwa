import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, Plus, X, Loader2, BellRing, Users, CalendarClock, Eye, Receipt } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useToastStore } from '../../store/useToastStore'
import { visualMesa, ESTADO_MESA, ESTADO_PEDIDO } from '../../lib/estados'
import type { Mesa, EstadoMesa, PedidoItem, Pedido } from '../../types'

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────
export default function WaiterDashboard() {
  const {
    mesas, pedidos, platos,
    crearComandaSalon, solicitarCuenta, updatePedidoEstado,
    sentarComensales, agregarComandaAdicional,
  } = useAppStore()
  const { user } = useAuthStore()

  const addToast = useToastStore((s) => s.addToast)
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null)
  const [showComandaModal, setShowComandaModal] = useState(false)
  const [showComandaAdicionalModal, setShowComandaAdicionalModal] = useState(false)
  const [showPreCuenta, setShowPreCuenta] = useState(false)
  const [incluirServicio, setIncluirServicio] = useState(true)

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

  // Abre la pre-cuenta para mostrarla al cliente antes de enviar a caja
  const handleVerPreCuenta = () => {
    if (!pedidoActivo) return
    const enPreparacion = pedidos.filter(
      (p) =>
        p.tipo === 'salon' &&
        p.mesaId === selectedMesa?.id &&
        (p.estado === 'nuevo' || p.estado === 'preparando')
    )
    if (enPreparacion.length > 0) {
      addToast('Hay platos en preparación. Espera a que estén listos antes de pedir la cuenta.', 'warning')
      return
    }
    setShowPreCuenta(true)
  }

  // Después de mostrar la pre-cuenta, el mesero confirma el envío a caja
  const handleConfirmarEnvioACaja = () => {
    if (!pedidoActivo) return
    solicitarCuenta(pedidoActivo.id, meseroId)
    setShowPreCuenta(false)
    setSelectedMesa(null)
    addToast('Cuenta enviada a caja. El cajero procesará el cobro.', 'success')
  }

  const handleMarcarServido = () => {
    if (!pedidoActivo) return
    updatePedidoEstado(pedidoActivo.id, 'servido', meseroId, 'mesero')
    addToast('Pedido marcado como servido.', 'success')
    setSelectedMesa(null)
  }

  const handleSentarComensales = () => {
    if (!selectedMesa) return
    const result = sentarComensales(selectedMesa.id)
    if (result.ok) {
      setSelectedMesa((prev) => prev ? { ...prev, estado: 'ocupada' } : null)
      addToast(`Mesa ${selectedMesa.numero} marcada como ocupada.`, 'success')
    } else {
      addToast(result.error ?? 'Error al sentar comensales.', 'error')
    }
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
          {(['libre', 'ocupada', 'reservada', 'pidiendo', 'esperando', 'comiendo', 'pagando'] as EstadoMesa[]).map((estado) => (
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

      {/* Aviso: pedidos listos en cocina */}
      {(() => {
        const listos = pedidos.filter((p) => p.tipo === 'salon' && p.estado === 'listo')
        if (listos.length === 0) return null
        const nums = listos.map((p) => mesas.find((m) => m.id === p.mesaId)?.numero).filter(Boolean)
        return (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-white shadow-sm"
            style={{ backgroundColor: ESTADO_PEDIDO.listo.color }}
          >
            <BellRing size={18} />
            <span className="font-bold text-sm">
              {listos.length} {listos.length === 1 ? 'pedido listo' : 'pedidos listos'} para servir
            </span>
            <span className="text-white/85 text-sm">· Mesa{nums.length > 1 ? 's' : ''} {nums.join(', ')}</span>
          </motion.div>
        )
      })()}

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
          // Cocina marcó el pedido como listo → avisar al mesero
          const listo = pedido?.estado === 'listo'

          return (
            <motion.button
              key={mesa.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMesa(mesa)}
              className={`rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm relative transition-all duration-200 ${listo ? 'ring-2 ring-offset-2' : ''}`}
              style={{
                backgroundColor: listo ? ESTADO_PEDIDO.listo.bg : visualMesa(mesa.estado).bg,
                border: `2px solid ${listo ? ESTADO_PEDIDO.listo.color : visualMesa(mesa.estado).color}`,
                ...(listo ? { ['--tw-ring-color' as string]: ESTADO_PEDIDO.listo.color } : {}),
              }}
            >
              <span className="text-3xl font-black text-carbon/80">{mesa.numero}</span>
              <span className="text-sm text-carbon/60 font-bold bg-white/40 px-2 py-0.5 rounded-full">
                {mesa.capacidad} pax
              </span>
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: listo ? ESTADO_PEDIDO.listo.color : 'rgba(45,42,38,0.5)' }}>
                {listo ? 'Listo para servir' : visualMesa(mesa.estado).label}
              </span>

              {/* Aviso de cocina: pedido listo */}
              {listo && (
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide text-white shadow-md flex items-center gap-1"
                  style={{ backgroundColor: ESTADO_PEDIDO.listo.color }}
                >
                  <BellRing size={11} strokeWidth={3} /> Listo
                </motion.div>
              )}

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

              {/* Acciones según estado de la mesa */}
              <div className="grid grid-cols-1 gap-3">

                {/* LIBRE: sentar comensales primero, o tomar comanda directamente */}
                {selectedMesa.estado === 'libre' && (
                  <>
                    <button
                      onClick={handleSentarComensales}
                      className="py-3 bg-bone text-carbon border border-border rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-border/60 transition-colors"
                    >
                      <Users size={18} strokeWidth={2.5} /> Sentar comensales
                    </button>
                    <button
                      onClick={() => setShowComandaModal(true)}
                      className="py-4 bg-terracotta text-white border-none rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-terracotta/90 transition-colors text-lg shadow-md shadow-terracotta/20"
                    >
                      <Plus size={20} strokeWidth={2.5} /> Nueva Comanda
                    </button>
                  </>
                )}

                {/* OCUPADA: tomar comanda */}
                {selectedMesa.estado === 'ocupada' && (
                  <button
                    onClick={() => setShowComandaModal(true)}
                    className="py-4 bg-terracotta text-white border-none rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-terracotta/90 transition-colors text-lg shadow-md shadow-terracotta/20"
                  >
                    <Plus size={20} strokeWidth={2.5} /> Nueva Comanda
                  </button>
                )}

                {/* RESERVADA: solo informativo */}
                {selectedMesa.estado === 'reservada' && (
                  <div className="py-3 px-4 bg-bone rounded-xl border border-border flex items-center gap-2 text-carbon/70 font-medium text-sm">
                    <CalendarClock size={18} className="shrink-0" />
                    Mesa reservada. Cuando lleguen los clientes, usa «Nueva Comanda» para registrar su pedido.
                  </div>
                )}

                {/* RESERVADA → permitir tomar comanda si llegan los clientes */}
                {selectedMesa.estado === 'reservada' && (
                  <button
                    onClick={() => setShowComandaModal(true)}
                    className="py-3 bg-terracotta text-white border-none rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-terracotta/90 transition-colors"
                  >
                    <Plus size={18} strokeWidth={2.5} /> Nueva Comanda
                  </button>
                )}

                {/* Cocina marcó listo → mesero sirve */}
                {pedidoActivo && pedidoActivo.estado === 'listo' && (
                  <button
                    onClick={handleMarcarServido}
                    className="py-3 bg-emerald-500 text-white border-none rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-600 transition-colors"
                  >
                    <Check size={18} strokeWidth={2.5} /> Marcar Servido
                  </button>
                )}

                {/* COMIENDO / ESPERANDO → agregar más platos (reclamo o pedido adicional) */}
                {(selectedMesa.estado === 'comiendo' || selectedMesa.estado === 'esperando') && (
                  <button
                    onClick={() => setShowComandaAdicionalModal(true)}
                    className="py-3 bg-bone text-carbon border border-border rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-border/60 transition-colors"
                  >
                    <Plus size={18} strokeWidth={2.5} /> Agregar platos
                  </button>
                )}

                {/* COMIENDO → ver pre-cuenta y luego enviar a caja */}
                {pedidoActivo && selectedMesa.estado === 'comiendo' && (
                  <button
                    onClick={handleVerPreCuenta}
                    className="py-3 bg-terracotta/10 text-terracotta border border-terracotta/30 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-terracotta/20 transition-colors"
                  >
                    <Eye size={18} strokeWidth={2.5} /> Ver pre-cuenta y enviar a caja
                  </button>
                )}

                {/* PAGANDO: en espera del cajero */}
                {selectedMesa.estado === 'pagando' && (
                  <div className="py-3 bg-pink-50 text-pink-600 border border-pink-200 rounded-xl font-bold flex items-center justify-center gap-2">
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
          titulo="Nueva Comanda"
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

      {/* Modal Comanda Adicional */}
      {showComandaAdicionalModal && selectedMesa && (
        <ComandaModal
          mesa={selectedMesa}
          platos={platos.filter((p) => p.disponible)}
          meseroId={meseroId}
          titulo="Agregar platos"
          subtitulo="Se enviará una comanda adicional a cocina y se sumará al cobro."
          onConfirm={(items) => {
            const result = agregarComandaAdicional(selectedMesa.id, items, meseroId)
            if (result.ok) {
              addToast(`Platos adicionales de Mesa ${selectedMesa.numero} enviados a cocina.`, 'success')
              setShowComandaAdicionalModal(false)
              setSelectedMesa(null)
            } else {
              addToast(result.error ?? 'Error al agregar platos.', 'error')
            }
          }}
          onClose={() => setShowComandaAdicionalModal(false)}
        />
      )}

      {/* Modal Pre-Cuenta */}
      {showPreCuenta && selectedMesa && pedidoActivo && (
        <PreCuentaModal
          mesa={selectedMesa}
          pedidos={pedidos.filter(
            (p) =>
              p.tipo === 'salon' &&
              p.mesaId === selectedMesa.id &&
              p.estado !== 'pagado' &&
              p.estado !== 'cancelado'
          )}
          meseroNombre={user?.name ?? 'Mesero'}
          incluirServicio={incluirServicio}
          onToggleServicio={() => setIncluirServicio((v) => !v)}
          onConfirmar={handleConfirmarEnvioACaja}
          onClose={() => setShowPreCuenta(false)}
        />
      )}
    </div>
  )
}

// ─── MODAL NUEVA COMANDA ─────────────────────────────────────
function ComandaModal({
  mesa,
  platos,
  titulo = 'Nueva Comanda',
  subtitulo,
  onConfirm,
  onClose,
}: {
  mesa: Mesa
  platos: ReturnType<typeof useAppStore.getState>['platos']
  meseroId: string
  titulo?: string
  subtitulo?: string
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
            <h3 className="font-display m-0 text-xl font-black text-carbon">{titulo}</h3>
            <p className="m-0 mt-0.5 text-sm text-carbon/50 font-medium">
              {subtitulo ?? `Mesa ${mesa.numero} • ${mesa.capacidad} pax`}
            </p>
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

// ─── MODAL PRE-CUENTA ─────────────────────────────────────────
// Muestra el ticket al mesero para que se lo muestre al cliente antes de enviar a caja.
// Incluye subtotal, servicio 10% (opcional) e IGV 18% incluido (back-calculado).
function PreCuentaModal({
  mesa,
  pedidos,
  meseroNombre,
  incluirServicio,
  onToggleServicio,
  onConfirmar,
  onClose,
}: {
  mesa: Mesa
  pedidos: Pedido[]
  meseroNombre: string
  incluirServicio: boolean
  onToggleServicio: () => void
  onConfirmar: () => void
  onClose: () => void
}) {
  const subtotal = pedidos.reduce((acc, p) => acc + p.total, 0)
  const servicio = incluirServicio ? subtotal * 0.1 : 0
  const total = subtotal + servicio
  // IGV 18% back-calculado desde el total (precios ya incluyen IGV)
  const igv = total * (18 / 118)
  const ahora = new Date()

  const handleImprimir = () => {
    const win = window.open('', '_blank', 'width=380,height=700')
    if (!win) return
    const filas = pedidos
      .flatMap((p) => p.items)
      .map((it) => `<tr><td>${it.cantidad}× ${it.nombre}${it.notas ? `<br/><span class="nota">${it.notas}</span>` : ''}</td><td class="r">S/ ${(it.precio * it.cantidad).toFixed(2)}</td></tr>`)
      .join('')
    win.document.write(`<!doctype html><html><head><meta charset="utf-8">
      <title>Pre-cuenta Mesa ${mesa.numero}</title>
      <style>
        *{font-family:'Courier New',monospace;color:#2D2A26}
        body{width:300px;margin:0 auto;padding:18px}
        h1{font-size:18px;text-align:center;margin:0}
        .sub{text-align:center;font-size:11px;color:#777;margin:2px 0 12px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        td{padding:3px 0}.r{text-align:right}
        .nota{font-size:10px;color:#999;font-style:italic}
        .sep{border-top:1px dashed #999;margin:10px 0}
        .tot{font-weight:bold;font-size:14px}
        .igv{font-size:11px;color:#777;margin-top:10px;text-align:center}
        .ft{text-align:center;font-size:11px;color:#777;margin-top:14px}
        .badge{background:#f3f3f3;padding:3px 8px;border-radius:4px;font-size:11px}
      </style></head><body>
      <h1>RINCÓN ANDINO</h1>
      <div class="sub">Gastronomía puneña · Puno, Perú<br/>
        <span class="badge">PRE-CUENTA — No válida como comprobante fiscal</span>
      </div>
      <table>
        <tr><td><b>Mesa ${mesa.numero}</b></td><td class="r">${ahora.toLocaleString('es-PE')}</td></tr>
        <tr><td>Mesero: ${meseroNombre}</td><td></td></tr>
      </table>
      <div class="sep"></div>
      <table>${filas}</table>
      <div class="sep"></div>
      <table>
        <tr><td>Subtotal</td><td class="r">S/ ${subtotal.toFixed(2)}</td></tr>
        ${incluirServicio ? `<tr><td>Servicio (10%)</td><td class="r">S/ ${servicio.toFixed(2)}</td></tr>` : ''}
        <tr class="tot"><td>TOTAL</td><td class="r">S/ ${total.toFixed(2)}</td></tr>
      </table>
      <div class="igv">IGV 18% incluido: S/ ${igv.toFixed(2)}<br/>Pague en caja · Efectivo / Yape / Plin / Tarjeta</div>
      <div class="ft">¡Gracias por su visita!</div>
      </body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-carbon/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="bg-white w-full max-w-sm rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
          <div>
            <h3 className="font-display m-0 text-xl font-black text-carbon">Pre-cuenta</h3>
            <p className="m-0 mt-0.5 text-xs text-carbon/50 font-medium uppercase tracking-wide">
              Mesa {mesa.numero} · {ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-bone flex items-center justify-center border-none cursor-pointer hover:bg-border/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Ticket */}
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-1 font-mono text-sm">
          <p className="text-[10px] text-carbon/40 uppercase tracking-widest text-center mb-3">
            No válida como comprobante fiscal
          </p>

          {/* Ítems */}
          {pedidos.flatMap((p) => p.items).map((item, i) => (
            <div key={i} className="flex justify-between text-carbon">
              <span className="flex-1 mr-2">
                <span className="font-bold">{item.cantidad}×</span> {item.nombre}
                {item.notas && <span className="block text-[11px] text-carbon/40 italic">{item.notas}</span>}
              </span>
              <span className="font-bold shrink-0">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
          ))}

          <div className="border-t border-dashed border-border mt-3 pt-3 flex flex-col gap-1.5">
            <div className="flex justify-between text-carbon/70">
              <span>Subtotal</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>

            {/* Toggle servicio */}
            <div className="flex justify-between items-center">
              <button
                onClick={onToggleServicio}
                className="flex items-center gap-1.5 text-carbon/70 border-none bg-transparent cursor-pointer p-0 text-sm"
              >
                <span
                  className="w-8 h-4 rounded-full transition-colors flex items-center px-0.5"
                  style={{ backgroundColor: incluirServicio ? 'var(--color-terracotta)' : 'var(--color-border)' }}
                >
                  <span
                    className="w-3 h-3 bg-white rounded-full shadow transition-transform"
                    style={{ transform: incluirServicio ? 'translateX(16px)' : 'translateX(0)' }}
                  />
                </span>
                Servicio (10%)
              </button>
              <span className="text-carbon/70">
                {incluirServicio ? `S/ ${servicio.toFixed(2)}` : '—'}
              </span>
            </div>

            <div className="flex justify-between font-black text-carbon text-base border-t border-border pt-2 mt-1">
              <span>TOTAL</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>

            <p className="text-[11px] text-carbon/40 text-right">
              IGV 18% incluido: S/ {igv.toFixed(2)}
            </p>
          </div>

          <p className="text-[11px] text-carbon/50 text-center mt-2 border border-dashed border-border/60 rounded-lg py-2 px-3">
            El cliente puede pagar en caja con efectivo, Yape, Plin o tarjeta.
          </p>
        </div>

        {/* Acciones */}
        <div className="p-5 border-t border-border/50 shrink-0 flex flex-col gap-2">
          <button
            onClick={handleImprimir}
            className="py-3 bg-bone text-carbon border border-border rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-border/60 transition-colors"
          >
            <Receipt size={17} strokeWidth={2.5} /> Imprimir pre-cuenta
          </button>
          <button
            onClick={onConfirmar}
            className="py-3.5 bg-terracotta text-white border-none rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-terracotta/90 transition-colors shadow-md shadow-terracotta/20 text-base"
          >
            Enviar a caja →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
