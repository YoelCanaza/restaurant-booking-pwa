import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import type { EstadoMesa } from '../../types'

export const LAYOUT: Record<string, any> = {
  mesa_01: { type: 'circle', cx: 60, cy: 60, r: 24, labelX: 60, labelY: 60 },
  mesa_02: { type: 'circle', cx: 160, cy: 60, r: 24, labelX: 160, labelY: 60 },
  mesa_03: { type: 'rect', x: 36, y: 130, w: 48, h: 48, rx: 8, labelX: 60, labelY: 154 },
  mesa_04: { type: 'rect', x: 136, y: 130, w: 48, h: 48, rx: 8, labelX: 160, labelY: 154 },
  mesa_05: { type: 'rect', x: 240, y: 36, w: 56, h: 100, rx: 8, labelX: 268, labelY: 86 },
  mesa_06: { type: 'rect', x: 240, y: 170, w: 56, h: 100, rx: 8, labelX: 268, labelY: 220 },
  mesa_07: { type: 'rect', x: 50, y: 240, w: 100, h: 56, rx: 8, labelX: 100, labelY: 268 },
  mesa_08: { type: 'rect', x: 50, y: 330, w: 100, h: 56, rx: 8, labelX: 100, labelY: 358 }
}

export const COLORS = {
  libre: '#22c55e',
  ocupada: '#ef4444',
  reservada: '#D4A853',
  deshabilitada: '#E5E5E5' // Para mesas que no cumplen la capacidad requerida
}

interface FloorPlanSVGProps {
  disponibilidad: Record<string, EstadoMesa>
  selectedMesaId?: string | null
  onMesaClick?: (mesaId: string) => void
  requiredCapacity?: number
}

export default function FloorPlanSVG({ 
  disponibilidad, 
  selectedMesaId, 
  onMesaClick,
  requiredCapacity = 0
}: FloorPlanSVGProps) {
  const mesas = useAppStore((s) => s.mesas)

  return (
    <svg viewBox="0 0 320 440" className="w-full max-w-[320px] h-auto drop-shadow-xl select-none">
      {/* Paredes/Estructura Simulada */}
      <rect x="10" y="10" width="300" height="420" fill="none" stroke="#E5E5E5" strokeWidth="4" rx="16" />
      <path d="M10 220 L30 220 M290 220 L310 220" stroke="#E5E5E5" strokeWidth="4" />
      
      {mesas.map((mesa) => {
        const layout = LAYOUT[mesa.id]
        if (!layout) return null
        
        const isSelected = selectedMesaId === mesa.id
        const estado = disponibilidad[mesa.id] || 'libre'
        const hasEnoughCapacity = mesa.capacidad >= requiredCapacity
        
        // Si no cumple la capacidad requerida y estamos en modo selección (requiredCapacity > 0), la deshabilitamos visualmente
        const isDisabled = requiredCapacity > 0 && (!hasEnoughCapacity || estado !== 'libre')
        
        let color = COLORS[estado]
        if (isDisabled && estado === 'libre') {
          color = COLORS.deshabilitada
        }

        return (
          <g 
            key={mesa.id} 
            onClick={() => {
              if (!isDisabled && onMesaClick) {
                onMesaClick(mesa.id)
              }
            }}
            className={isDisabled ? 'cursor-not-allowed opacity-50' : (onMesaClick ? 'cursor-pointer' : '')}
          >
            <motion.g
              whileTap={!isDisabled && onMesaClick ? { scale: 0.95 } : {}}
              animate={{ scale: isSelected ? 1.05 : 1 }}
            >
              {layout.type === 'circle' ? (
                <circle 
                  cx={layout.cx} cy={layout.cy} r={layout.r} 
                  fill={color} 
                  stroke={isSelected ? '#1A1A1A' : 'rgba(0,0,0,0.1)'} 
                  strokeWidth={isSelected ? 3 : 1}
                />
              ) : (
                <rect 
                  x={layout.x} y={layout.y} width={layout.w} height={layout.h} rx={layout.rx} 
                  fill={color}
                  stroke={isSelected ? '#1A1A1A' : 'rgba(0,0,0,0.1)'} 
                  strokeWidth={isSelected ? 3 : 1}
                />
              )}
              {/* Etiqueta de la mesa */}
              <text 
                x={layout.labelX} y={layout.labelY} 
                textAnchor="middle" alignmentBaseline="middle"
                fill={isDisabled && estado === 'libre' ? '#9CA3AF' : '#FFFFFF'}
                fontSize="18" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif"
                pointerEvents="none"
              >
                {mesa.numero}
              </text>
              <text 
                x={layout.labelX} y={layout.labelY + 14} 
                textAnchor="middle" alignmentBaseline="middle"
                fill={isDisabled && estado === 'libre' ? '#9CA3AF' : 'rgba(255,255,255,0.8)'}
                fontSize="10" fontWeight="600"
                pointerEvents="none"
              >
                {mesa.capacidad}p
              </text>
            </motion.g>
          </g>
        )
      })}
    </svg>
  )
}
