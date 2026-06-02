import type { EstadoVisual } from '../../lib/estados'

interface StatusPillProps {
  visual: EstadoVisual
  dot?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/**
 * StatusPill — etiqueta de estado consistente para Pedido/Mesa/Reserva.
 * Recibe un EstadoVisual de src/lib/estados (label + color + bg).
 */
export default function StatusPill({ visual, dot = true, size = 'md', className = '' }: StatusPillProps) {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold leading-none whitespace-nowrap ${pad} ${className}`}
      style={{ color: visual.color, backgroundColor: visual.bg }}
    >
      {dot && (
        <span
          className="inline-block rounded-full"
          style={{ width: 6, height: 6, backgroundColor: visual.color }}
        />
      )}
      {visual.label}
    </span>
  )
}
