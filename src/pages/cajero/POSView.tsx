import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, Receipt, Banknote, CreditCard, CheckCircle, QrCode, X, Clock } from 'lucide-react'
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const cajeroId = user?.id ?? 'usr_caja_01'

  // Cola de cobro: única fuente de verdad en el store (Opción A).
  // Salón solo cuando la mesa está en 'pagando' + delivery efectivo entregado.
  const cola: Pedido[] = getPedidosPendientesCobro()

  const pedidoActivo = cola.find((p) => p.id === selectedPedidoId)

  const vuelto =
    metodoPago === 'efectivo' && montoRecibido && pedidoActivo
      ? parseFloat(montoRecibido) - pedidoActivo.total
      : null

  const handlePagar = () => {
    if (!pedidoActivo) return

    if (metodoPago === 'efectivo' && montoRecibido) {
      const recibido = parseFloat(montoRecibido)
      if (isNaN(recibido) || recibido < pedidoActivo.total) {
        setErrorMsg('El monto recibido es insuficiente para cubrir el total.')
        return
      }
    }

    const result = procesarPago(pedidoActivo.id, metodoPago, cajeroId)
    if (result.ok) {
      setShowSuccess(true)
      setSelectedPedidoId(null)
      setMontoRecibido('')
      setErrorMsg(null)
    } else {
      setErrorMsg(result.error ?? 'Error al procesar el pago.')
    }
  }

  const getMesaLabel = (pedido: Pedido) => {
    if (pedido.tipo === 'salon' && pedido.mesaId) {
      const mesa = mesas.find((m) => m.id === pedido.mesaId)
      return mesa ? `Mesa ${mesa.numero}` : 'Salón'
    }
    return `Delivery — ${pedido.clienteNombre}`
  }

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
                  border: `2px solid ${isSelected ? 'var(--color-terracotta)' : 'var(--color-border)'}`,
                  backgroundColor: isSelected ? 'rgba(224,89,54,0.05)' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: 42, height: 42, borderRadius: 10,
                    backgroundColor: isSelected ? 'rgba(224,89,54,0.1)' : 'rgba(45,42,38,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSelected ? 'var(--color-terracotta)' : 'var(--color-carbon)',
                  }}
                >
                  <Store size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-carbon)' }}>
                    {getMesaLabel(pedido)}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-carbon)' }}>
                <span>TOTAL</span>
                <span>S/ {pedidoActivo.total.toFixed(2)}</span>
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
                      min={pedidoActivo.total}
                      step="0.5"
                      placeholder={`Mínimo S/ ${pedidoActivo.total.toFixed(2)}`}
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
              <CheckCircle size={22} /> Confirmar Cobro · S/ {pedidoActivo.total.toFixed(2)}
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
            La mesa ha sido liberada y el comprobante generado correctamente.
          </p>
          <Button variant="secondary" fullWidth onClick={() => setShowSuccess(false)}>
            <Receipt size={18} /> Imprimir Comprobante
          </Button>
        </div>
      </Modal>
    </div>
  )
}
