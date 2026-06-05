import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, Receipt, Banknote, CreditCard, CheckCircle, QrCode, X, Clock, Plus } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import type { MetodoPago, Pedido } from '../../types'

// ─── ÍCONOS Y LABELS DE MÉTODO DE PAGO ───────────────────────
const METODO_CONFIG: Record<MetodoPago, { label: string; icon: React.ReactNode; color: string }> = {
  efectivo: { label: 'Efectivo', icon: <Banknote size={20} />, color: '#16A34A' },
  tarjeta: { label: 'Tarjeta', icon: <CreditCard size={20} />, color: '#2563EB' },
  yape: { label: 'Yape', icon: <QrCode size={20} />, color: '#7C3AED' },
  plin: { label: 'Plin', icon: <QrCode size={20} />, color: '#0891B2' },
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────
export default function POSView() {
  const { mesas, procesarPago, getPedidosPendientesCobro } = useAppStore()
  const { user } = useAuthStore()

  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null)
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo')
  const [montoRecibido, setMontoRecibido] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('La mesa ha sido liberada y el comprobante está listo.')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [incluirServicio, setIncluirServicio] = useState(true)
  // Último cobro confirmado, para imprimir el comprobante
  const [comprobante, setComprobante] = useState<
    null | { titulo: string; id: string; items: Pedido['items']; subtotal: number; servicio: number; total: number; metodo: MetodoPago; recibido: number | null; vuelto: number | null; fecha: Date }
  >(null)

  const cajeroId = user?.id ?? 'usr_caja_01'

  // Cola de cobro: única fuente de verdad en el store (Opción A).
  // Salón solo cuando la mesa está en 'pagando' + delivery efectivo entregado.
  const cola: Pedido[] = getPedidosPendientesCobro()

  const pedidoActivo = cola.find((p) => p.id === selectedPedidoId)

  // Totales con servicio opcional
  const subtotalActivo = pedidoActivo?.total ?? 0
  const servicioActivo = incluirServicio ? subtotalActivo * 0.1 : 0
  const totalConServicio = subtotalActivo + servicioActivo
  const igvIncluido = totalConServicio * (18 / 118)

  const vuelto =
    metodoPago === 'efectivo' && montoRecibido && pedidoActivo
      ? parseFloat(montoRecibido) - totalConServicio
      : null

  const handlePagar = () => {
    if (!pedidoActivo) return

    let recibido: number | null = null
    if (metodoPago === 'efectivo' && montoRecibido) {
      recibido = parseFloat(montoRecibido)
      if (isNaN(recibido) || recibido < totalConServicio) {
        setErrorMsg('El monto recibido es insuficiente para cubrir el total.')
        return
      }
    }

    // Capturar datos del comprobante ANTES de cobrar (el pedido sale de la cola)
    const comp = {
      titulo: getMesaLabel(pedidoActivo),
      id: pedidoActivo.id,
      items: pedidoActivo.items,
      subtotal: subtotalActivo,
      servicio: servicioActivo,
      total: totalConServicio,
      metodo: metodoPago,
      recibido,
      vuelto: recibido != null ? recibido - totalConServicio : null,
      fecha: new Date(),
    }

    const mesaId = pedidoActivo.mesaId
    const result = procesarPago(pedidoActivo.id, metodoPago, cajeroId)
    if (result.ok) {
      const colaActualizada = getPedidosPendientesCobro()
      const quedan = mesaId ? colaActualizada.filter((p) => p.mesaId === mesaId).length : 0
      setSuccessMsg(
        quedan > 0
          ? `Cobro registrado. Quedan ${quedan} comanda${quedan > 1 ? 's' : ''} por cobrar de esa mesa.`
          : 'La mesa ha sido liberada y el comprobante está listo.'
      )
      setComprobante(comp)
      setShowSuccess(true)
      setSelectedPedidoId(null)
      setMontoRecibido('')
      setErrorMsg(null)
    } else {
      setErrorMsg(result.error ?? 'Error al procesar el pago.')
    }
  }

  const imprimirComprobante = () => {
    if (!comprobante) return
    const c = comprobante
    const igv = c.total * (18 / 118)
    const win = window.open('', '_blank', 'width=380,height=700')
    if (!win) return
    const filas = c.items
      .map((it) => `<tr><td>${it.cantidad}× ${it.nombre}${it.notas ? `<br/><span class="nota">${it.notas}</span>` : ''}</td><td class="r">S/ ${(it.precio * it.cantidad).toFixed(2)}</td></tr>`)
      .join('')
    const servicioFila = c.servicio > 0
      ? `<tr><td>Servicio (10%)</td><td class="r">S/ ${c.servicio.toFixed(2)}</td></tr>`
      : ''
    const efectivo =
      c.recibido != null
        ? `<tr><td>Recibido</td><td class="r">S/ ${c.recibido.toFixed(2)}</td></tr><tr><td>Vuelto</td><td class="r">S/ ${(c.vuelto ?? 0).toFixed(2)}</td></tr>`
        : ''
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Comprobante ${c.id.slice(-6).toUpperCase()}</title>
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
        .igv{font-size:11px;color:#777;text-align:center;margin-top:8px}
        .ft{text-align:center;font-size:11px;color:#777;margin-top:14px}
      </style></head><body>
      <h1>RINCÓN ANDINO</h1>
      <div class="sub">Gastronomía puneña · Puno, Perú<br/>RUC: 20600000001</div>
      <table><tr><td>${c.titulo}</td><td class="r">#${c.id.slice(-6).toUpperCase()}</td></tr>
      <tr><td>${c.fecha.toLocaleString('es-PE')}</td><td></td></tr></table>
      <div class="sep"></div>
      <table>${filas}</table>
      <div class="sep"></div>
      <table>
        <tr><td>Subtotal</td><td class="r">S/ ${c.subtotal.toFixed(2)}</td></tr>
        ${servicioFila}
        <tr class="tot"><td>TOTAL</td><td class="r">S/ ${c.total.toFixed(2)}</td></tr>
        <tr><td>Método</td><td class="r">${METODO_CONFIG[c.metodo].label}</td></tr>
        ${efectivo}
      </table>
      <div class="igv">IGV 18% incluido: S/ ${igv.toFixed(2)}</div>
      <div class="ft">¡Gracias por tu visita!<br/>Emitido como: BOLETA DE VENTA (demo)</div>
      </body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  // Si hay más de un pedido activo para la misma mesa, los adicionales llevan "(+)"
  const comandasPorMesa = cola.reduce<Record<string, number>>((acc, p) => {
    if (p.tipo === 'salon' && p.mesaId) {
      acc[p.mesaId] = (acc[p.mesaId] ?? 0) + 1
    }
    return acc
  }, {})

  const getMesaLabel = (pedido: Pedido, short = false) => {
    if (pedido.tipo === 'salon' && pedido.mesaId) {
      const mesa = mesas.find((m) => m.id === pedido.mesaId)
      const base = mesa ? `Mesa ${mesa.numero}` : 'Salón'
      // Si hay múltiples comandas, las no-primarias (distinto de mesa.pedidoId) son adicionales
      const esAdicional = mesa && mesa.pedidoId && pedido.id !== mesa.pedidoId && (comandasPorMesa[pedido.mesaId] ?? 0) > 1
      return esAdicional ? `${base}${short ? '' : ' — adicional'}` : base
    }
    return `Delivery — ${pedido.clienteNombre}`
  }

  const esAdicional = (pedido: Pedido) =>
    pedido.tipo === 'salon' &&
    pedido.mesaId != null &&
    (comandasPorMesa[pedido.mesaId] ?? 0) > 1 &&
    (() => {
      const mesa = mesas.find((m) => m.id === pedido.mesaId)
      return mesa?.pedidoId != null && pedido.id !== mesa.pedidoId
    })()

  const getMinutosEspera = (pedido: Pedido) =>
    Math.floor((Date.now() - new Date(pedido.createdAt).getTime()) / 60000)

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: '100%' }}>

      {/* ── Columna izquierda: Cola de cobro ───────────────── */}
      <div
        style={{
          width: 340,
          backgroundColor: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="font-display" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-carbon)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={20} /> Cobros Pendientes
          </h2>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'rgba(45,42,38,0.5)' }}>
            {cola.length} {cola.length === 1 ? 'cuenta' : 'cuentas'} por cobrar
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cola.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(45,42,38,0.4)', fontSize: '0.9rem' }}>
              No hay cobros pendientes
            </div>
          )}
          {cola.map((pedido) => {
            const minutos = getMinutosEspera(pedido)
            const isSelected = selectedPedidoId === pedido.id
            const adicional = esAdicional(pedido)
            return (
              <button
                key={pedido.id}
                onClick={() => { setSelectedPedidoId(pedido.id); setMontoRecibido(''); setErrorMsg(null) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 12,
                  border: `2px solid ${isSelected ? 'var(--color-terracotta)' : adicional ? 'rgba(224,89,54,0.3)' : 'var(--color-border)'}`,
                  backgroundColor: isSelected ? 'rgba(224,89,54,0.05)' : adicional ? 'rgba(224,89,54,0.02)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: 42, height: 42, borderRadius: 10,
                    backgroundColor: isSelected ? 'rgba(224,89,54,0.1)' : adicional ? 'rgba(224,89,54,0.07)' : 'rgba(45,42,38,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSelected || adicional ? 'var(--color-terracotta)' : 'var(--color-carbon)',
                  }}
                >
                  {adicional ? <Plus size={20} /> : <Store size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-carbon)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {getMesaLabel(pedido)}
                    {adicional && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-terracotta)', backgroundColor: 'rgba(224,89,54,0.1)', padding: '1px 6px', borderRadius: 99 }}>
                        adicional
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(45,42,38,0.5)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: 2 }}>
                    <Clock size={11} /> {minutos}min · {pedido.items.length} platos
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--color-terracotta)', fontSize: '1.05rem' }}>
                  S/ {pedido.total.toFixed(2)}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Columna derecha: Detalle y cobro ───────────────── */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {!pedidoActivo ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'rgba(45,42,38,0.35)' }}>
            <Receipt size={48} />
            <p style={{ margin: 0, fontSize: '1rem', textAlign: 'center' }}>
              Selecciona una cuenta de la cola para procesarla
            </p>
          </div>
        ) : (
          <>
            {/* Header del pedido */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="font-display" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-carbon)' }}>
                  {getMesaLabel(pedidoActivo)}
                </h2>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'rgba(45,42,38,0.5)' }}>
                  Pedido #{pedidoActivo.id.slice(-6).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedPedidoId(null)}
                style={{ background: 'var(--color-bone)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Desglose de ítems */}
            <div style={{ backgroundColor: 'var(--color-bone)', borderRadius: 12, padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
              {pedidoActivo.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    borderBottom: i < pedidoActivo.items.length - 1 ? '1px dashed var(--color-border)' : 'none',
                    paddingBottom: '0.75rem', marginBottom: '0.75rem',
                    fontSize: '0.95rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--color-carbon)' }}>
                    {item.cantidad}× {item.nombre}
                    {item.notas && <span style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(45,42,38,0.5)', fontWeight: 400 }}>{item.notas}</span>}
                  </span>
                  <span style={{ fontWeight: 700 }}>S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
              {/* Subtotal + servicio toggle + total */}
              <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'rgba(45,42,38,0.6)' }}>
                  <span>Subtotal</span>
                  <span>S/ {subtotalActivo.toFixed(2)}</span>
                </div>
                {/* Toggle servicio 10% */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'rgba(45,42,38,0.6)' }}>
                  <button
                    onClick={() => setIncluirServicio((v) => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.9rem', color: 'rgba(45,42,38,0.6)' }}
                  >
                    <span style={{
                      width: 32, height: 17, borderRadius: 99, display: 'flex', alignItems: 'center', padding: '0 2px',
                      backgroundColor: incluirServicio ? 'var(--color-terracotta)' : 'var(--color-border)',
                      transition: 'background 0.2s',
                    }}>
                      <span style={{
                        width: 13, height: 13, borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transform: incluirServicio ? 'translateX(15px)' : 'translateX(0)',
                        transition: 'transform 0.2s',
                      }} />
                    </span>
                    Servicio (10%)
                  </button>
                  <span>{incluirServicio ? `S/ ${servicioActivo.toFixed(2)}` : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-carbon)', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                  <span>TOTAL</span>
                  <span>S/ {totalConServicio.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(45,42,38,0.4)', textAlign: 'right' }}>
                  IGV 18% incluido: S/ {igvIncluido.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: '0.85rem', color: 'rgba(45,42,38,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Método de pago
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {(Object.entries(METODO_CONFIG) as [MetodoPago, typeof METODO_CONFIG[MetodoPago]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setMetodoPago(key)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 12,
                      border: `2px solid ${metodoPago === key ? cfg.color : 'var(--color-border)'}`,
                      backgroundColor: metodoPago === key ? `${cfg.color}15` : '#fff',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      fontWeight: 700, fontSize: '0.9rem',
                      color: metodoPago === key ? cfg.color : 'var(--color-carbon)',
                      transition: 'all 0.18s',
                    }}
                  >
                    {cfg.icon} {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input monto recibido (solo efectivo) */}
            <AnimatePresence>
              {metodoPago === 'efectivo' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.85rem', color: 'rgba(45,42,38,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Monto recibido
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      min={totalConServicio}
                      step="0.5"
                      placeholder={`Mínimo S/ ${totalConServicio.toFixed(2)}`}
                      value={montoRecibido}
                      onChange={(e) => { setMontoRecibido(e.target.value); setErrorMsg(null) }}
                      style={{
                        flex: 1, padding: '0.75rem 1rem', borderRadius: 10,
                        border: '2px solid var(--color-border)', fontSize: '1rem',
                        fontWeight: 700, outline: 'none', color: 'var(--color-carbon)',
                      }}
                    />
                    {vuelto !== null && vuelto >= 0 && (
                      <div style={{ textAlign: 'center', minWidth: 80 }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(45,42,38,0.5)' }}>Vuelto</p>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: '#16A34A' }}>
                          S/ {vuelto.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {errorMsg && (
              <p style={{ margin: 0, color: '#DC2626', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#FEF2F2', padding: '0.75rem 1rem', borderRadius: 8 }}>
                {errorMsg}
              </p>
            )}

            {/* Botón cobrar */}
            <button
              onClick={handlePagar}
              style={{
                padding: '1.1rem',
                backgroundColor: 'var(--color-terracotta)',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontSize: '1.1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                boxShadow: '0 4px 16px rgba(224,89,54,0.3)',
                transition: 'all 0.2s',
              }}
            >
              <CheckCircle size={22} /> Confirmar Cobro · S/ {totalConServicio.toFixed(2)}
            </button>
          </>
        )}
      </div>

      {/* ── Modal de Éxito ─────────────────────────────────── */}
      <Modal open={showSuccess} onClose={() => setShowSuccess(false)} size="sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mb-5">
            <CheckCircle size={44} color="#16A34A" />
          </div>
          <h2 className="font-display text-2xl font-black text-carbon mb-2">¡Cobro Exitoso!</h2>
          <p className="text-carbon/60 leading-relaxed mb-6">
            {successMsg}
          </p>
          <div className="flex flex-col gap-2 w-full">
            <Button variant="secondary" fullWidth onClick={imprimirComprobante}>
              <Receipt size={18} /> Imprimir comprobante
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setShowSuccess(false)}>Listo</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
