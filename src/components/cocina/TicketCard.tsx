import { useEffect, useState } from 'react'
import { Clock, AlertTriangle, ChefHat } from 'lucide-react'
import type { Pedido } from '../../types'
import { clsx } from 'clsx'
import { useAppStore } from '../../store/useAppStore'

interface TicketCardProps {
  ticket: Pedido
  onClickRecipe?: (itemName: string) => void
}

export default function TicketCard({ ticket, onClickRecipe }: TicketCardProps) {
  const [elapsedMins, setElapsedMins] = useState(0)
  const { mesas } = useAppStore()

  // Timer para calcular minutos desde que se creó el pedido
  useEffect(() => {
    const calcElapsed = () => {
      const created = new Date(ticket.createdAt).getTime()
      const now = Date.now()
      setElapsedMins(Math.floor((now - created) / 60000))
    }
    calcElapsed()
    const interval = setInterval(calcElapsed, 60000)
    return () => clearInterval(interval)
  }, [ticket.createdAt])

  // Lógica de SLA (Service Level Agreement)
  // Si pasa de 15 mins, alerta amarilla; más de 25 mins, rojo (crítico)
  const isWarning = elapsedMins >= 15 && elapsedMins < 25
  const isCritical = elapsedMins >= 25

  const getMesaLabel = () => {
    if (ticket.tipo === 'salon' && ticket.mesaId) {
      const mesa = mesas.find((m) => m.id === ticket.mesaId)
      return mesa ? `Mesa ${mesa.numero}` : 'Salón'
    }
    return 'Delivery'
  }

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderLeft: `4px solid ${
          isCritical ? 'var(--color-error)' : isWarning ? 'var(--color-amber)' : 'var(--color-success)'
        }`,
      }}
    >
      {/* Cabecera del Ticket */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-carbon)' }}>
            #{ticket.id.slice(-6).toUpperCase()}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'rgba(45,42,38,0.5)', marginTop: 2, fontWeight: 700 }}>
            {getMesaLabel()} • {ticket.tipo.toUpperCase()}
          </div>
        </div>

        {/* Timer */}
        <div
          className={clsx(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-bold',
            isCritical && 'bg-red-100 text-red-700',
            isWarning && 'bg-orange-100 text-orange-700',
            !isCritical && !isWarning && 'bg-green-100 text-green-700'
          )}
        >
          <Clock size={16} />
          {elapsedMins}m
        </div>
      </div>

      {/* Ítems del Pedido */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {ticket.items.map((item, index) => (
          <li key={`${item.platoId}-${index}`} style={{ fontSize: '0.9rem', color: 'var(--color-carbon)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', fontWeight: 600 }}>
              <span>{item.cantidad}x</span>
              <span style={{ flex: 1 }}>{item.nombre}</span>
              {/* Botón para ver Receta (Mock) */}
              <button
                onClick={() => onClickRecipe?.(item.nombre)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-terracotta)',
                  cursor: 'pointer',
                  padding: 2,
                }}
                title="Ver receta"
              >
                <ChefHat size={16} />
              </button>
            </div>
            {/* Modificadores / Notas */}
            {item.notas && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.8rem', color: 'var(--color-error)', fontWeight: 500 }}>
                <AlertTriangle size={14} />
                {item.notas}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Nota General del Pedido */}
      {ticket.notas && (
        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--color-border)', fontSize: '0.85rem', color: 'var(--color-carbon)', fontStyle: 'italic' }}>
          <strong>Nota:</strong> {ticket.notas}
        </div>
      )}
    </div>
  )
}
