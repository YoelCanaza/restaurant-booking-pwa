import { motion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'
import { visualMesa } from '../../lib/estados'
import type { EstadoMesa } from '../../types'

/* ════════════════════════════════════════════════════════════════
   FloorPlanSVG — plano arquitectónico cenital con DOS niveles.
   Planta baja (cocina, baños, caja, entrada) y rooftop (barra, terraza),
   conectados por una escalera central. Mesas con sillas según capacidad
   y color de estado (src/lib/estados). Usado por admin y cliente.
   ════════════════════════════════════════════════════════════════ */

type Shape = 'round' | 'rect'
interface TableGeo { cx: number; cy: number; shape: Shape; w?: number; h?: number; r?: number }

export const LAYOUT: Record<string, TableGeo> = {
  // Planta baja
  mesa_01: { cx: 105, cy: 152, shape: 'round', r: 17 },
  mesa_02: { cx: 275, cy: 152, shape: 'round', r: 17 },
  mesa_03: { cx: 105, cy: 250, shape: 'rect', w: 48, h: 48 },
  mesa_04: { cx: 275, cy: 250, shape: 'rect', w: 48, h: 48 },
  mesa_05: { cx: 105, cy: 352, shape: 'rect', w: 92, h: 44 },
  mesa_06: { cx: 275, cy: 352, shape: 'rect', w: 92, h: 44 },
  mesa_07: { cx: 105, cy: 454, shape: 'rect', w: 120, h: 46 },
  mesa_08: { cx: 275, cy: 454, shape: 'rect', w: 120, h: 46 },
  // Rooftop
  mesa_09: { cx: 100, cy: 168, shape: 'round', r: 17 },
  mesa_10: { cx: 272, cy: 168, shape: 'rect', w: 48, h: 48 },
  mesa_11: { cx: 100, cy: 292, shape: 'rect', w: 48, h: 48 },
  mesa_12: { cx: 272, cy: 292, shape: 'rect', w: 92, h: 44 },
  mesa_13: { cx: 190, cy: 410, shape: 'rect', w: 120, h: 46 },
}

function sillasRound(cx: number, cy: number, r: number, n: number) {
  const out: { x: number; y: number }[] = []
  const rad = r + 12
  for (let i = 0; i < n; i++) {
    const ang = ((-90 + i * (360 / n)) * Math.PI) / 180
    out.push({ x: cx + rad * Math.cos(ang), y: cy + rad * Math.sin(ang) })
  }
  return out
}
function sillasRect(cx: number, cy: number, w: number, h: number, n: number) {
  const out: { x: number; y: number }[] = []
  const top = Math.ceil(n / 2)
  const place = (count: number, y: number) => {
    for (let i = 0; i < count; i++) out.push({ x: cx - w / 2 + (w * (i + 1)) / (count + 1), y })
  }
  place(top, cy - h / 2 - 12)
  place(n - top, cy + h / 2 + 12)
  return out
}

interface FloorPlanSVGProps {
  disponibilidad: Record<string, EstadoMesa>
  selectedMesaId?: string | null
  onMesaClick?: (mesaId: string) => void
  requiredCapacity?: number
  piso?: number
}

export default function FloorPlanSVG({
  disponibilidad,
  selectedMesaId,
  onMesaClick,
  requiredCapacity = 0,
  piso = 1,
}: FloorPlanSVGProps) {
  const mesas = useAppStore((s) => s.mesas).filter((m) => (m.piso ?? 1) === piso && LAYOUT[m.id])

  return (
    <svg viewBox="0 0 380 620" className="w-full max-w-[380px] h-auto select-none drop-shadow-xl">
      <defs>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#d9d2c4" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Piso + muros (doble línea) */}
      <rect x="10" y="10" width="360" height="600" rx="14"
        fill={piso === 2 ? '#FCFBF7' : '#FBF9F4'} stroke="#2D2A26" strokeWidth="3.5" />
      <rect x="16" y="16" width="348" height="588" rx="10" fill="none" stroke="#2D2A26" strokeWidth="1" opacity="0.22" />

      {piso === 1 ? <PlantaChrome /> : <RooftopChrome />}

      {/* ── Mesas ────────────────────────────────────────── */}
      {mesas.map((mesa) => {
        const g = LAYOUT[mesa.id]
        const estado = disponibilidad[mesa.id] || 'libre'
        const vis = visualMesa(estado)
        const cumple = mesa.capacidad >= requiredCapacity
        const disabled = requiredCapacity > 0 && (!cumple || estado !== 'libre')
        const isSelected = selectedMesaId === mesa.id
        const fill = disabled ? '#E5E2DB' : vis.color
        const stroke = isSelected ? '#2D2A26' : 'rgba(45,42,38,0.18)'
        const sillas = g.shape === 'round'
          ? sillasRound(g.cx, g.cy, g.r!, mesa.capacidad)
          : sillasRect(g.cx, g.cy, g.w!, g.h!, mesa.capacidad)

        return (
          <g
            key={mesa.id}
            onClick={() => { if (!disabled && onMesaClick) onMesaClick(mesa.id) }}
            className={disabled ? 'cursor-not-allowed' : onMesaClick ? 'cursor-pointer' : ''}
            opacity={disabled ? 0.5 : 1}
          >
            {sillas.map((s, i) => (
              <rect key={i} x={s.x - 5} y={s.y - 5} width="10" height="10" rx="2.5"
                fill={disabled ? '#d6d2ca' : '#cdbba6'} stroke="rgba(45,42,38,0.15)" strokeWidth="0.75" />
            ))}
            <motion.g
              animate={{ scale: isSelected ? 1.06 : 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              style={{ transformOrigin: `${g.cx}px ${g.cy}px` }}
            >
              {g.shape === 'round' ? (
                <circle cx={g.cx} cy={g.cy} r={g.r} fill={fill} stroke={stroke} strokeWidth={isSelected ? 3 : 1.5} />
              ) : (
                <rect x={g.cx - g.w! / 2} y={g.cy - g.h! / 2} width={g.w} height={g.h} rx="7"
                  fill={fill} stroke={stroke} strokeWidth={isSelected ? 3 : 1.5} />
              )}
              <text x={g.cx} y={g.cy + 4.5} textAnchor="middle" fontSize="14" fontWeight="800"
                fill={disabled ? '#9b968d' : '#fff'} pointerEvents="none">{mesa.numero}</text>
            </motion.g>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Escalera central (símbolo arquitectónico, vertical) ─────
function Escalera({ dir, label }: { dir: 'up' | 'down'; label: string }) {
  const x = 150, y = 24, w = 80, h = 68
  const treads = 7
  const mid = x + w / 2
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill="#fff" stroke="#b6af9f" strokeWidth="1.5" />
      {/* peldaños */}
      {Array.from({ length: treads }).map((_, i) => (
        <line key={i} x1={x + 5} y1={y + (h * (i + 1)) / (treads + 1)} x2={x + w - 5} y2={y + (h * (i + 1)) / (treads + 1)} stroke="#cfc8ba" strokeWidth="1.25" />
      ))}
      {/* zanca central */}
      <line x1={mid} y1={y + 4} x2={mid} y2={y + h - 4} stroke="#e4ded2" strokeWidth="1" />
      {/* flecha de dirección */}
      {dir === 'up' ? (
        <g>
          <line x1={mid} y1={y + h - 12} x2={mid} y2={y + 15} stroke="#E05936" strokeWidth="2.5" />
          <path d={`M${mid} ${y + 8} l-6 10 h12 z`} fill="#E05936" />
        </g>
      ) : (
        <g>
          <line x1={mid} y1={y + 12} x2={mid} y2={y + h - 15} stroke="#E05936" strokeWidth="2.5" />
          <path d={`M${mid} ${y + h - 8} l-6 -10 h12 z`} fill="#E05936" />
        </g>
      )}
      <text x={mid} y={y + h + 12} textAnchor="middle" fontSize="8.5" fontWeight="800" letterSpacing="0.5" fill="#8a857c">{label}</text>
    </g>
  )
}

function Planta({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="9" fill="#86b178" />
      <circle cx={cx} cy={cy} r="4" fill="#6f9a62" />
    </g>
  )
}

// ─── Chrome: Planta baja ─────────────────────────────────────
function PlantaChrome() {
  return (
    <>
      {[235, 325, 415].map((yv) => (
        <g key={yv}>
          <line x1="10" y1={yv} x2="10" y2={yv + 44} stroke="#9DB7C9" strokeWidth="3.5" />
          <line x1="370" y1={yv} x2="370" y2={yv + 44} stroke="#9DB7C9" strokeWidth="3.5" />
        </g>
      ))}

      {/* Cocina (arriba-izq) */}
      <g>
        <rect x="22" y="24" width="120" height="68" rx="6" fill="url(#hatch)" stroke="#cfc8ba" strokeWidth="1.5" />
        <rect x="22" y="24" width="120" height="68" rx="6" fill="#F0EDE7" opacity="0.5" />
        <rect x="30" y="38" width="34" height="30" rx="4" fill="#fff" stroke="#cfc8ba" />
        <circle cx="40" cy="48" r="3" fill="#cfc8ba" /><circle cx="54" cy="48" r="3" fill="#cfc8ba" />
        <circle cx="40" cy="59" r="3" fill="#cfc8ba" /><circle cx="54" cy="59" r="3" fill="#cfc8ba" />
        <text x="98" y="60" textAnchor="middle" fontSize="10" fontWeight="800" letterSpacing="1" fill="#8a857c">COCINA</text>
      </g>

      {/* Escalera central → rooftop */}
      <Escalera dir="up" label="↑ ROOFTOP" />

      {/* Baños (arriba-der) */}
      <g>
        <rect x="238" y="24" width="120" height="68" rx="6" fill="#F0EDE7" stroke="#cfc8ba" strokeWidth="1.5" />
        <line x1="298" y1="24" x2="298" y2="92" stroke="#cfc8ba" strokeWidth="1.5" />
        <circle cx="266" cy="48" r="5.5" fill="#9DB7C9" /><rect x="261" y="55" width="10" height="12" rx="3" fill="#9DB7C9" />
        <circle cx="330" cy="48" r="5.5" fill="#C9A0B0" /><path d="M325 67 L330 55 L335 67 Z" fill="#C9A0B0" />
        <text x="266" y="80" textAnchor="middle" fontSize="8" fontWeight="800" fill="#8a857c">H</text>
        <text x="330" y="80" textAnchor="middle" fontSize="8" fontWeight="800" fill="#8a857c">M</text>
        <text x="298" y="106" textAnchor="middle" fontSize="9" fontWeight="800" letterSpacing="1" fill="#8a857c">BAÑOS</text>
      </g>

      {/* Caja (abajo-izq) */}
      <g>
        <rect x="30" y="548" width="108" height="34" rx="6" fill="#F6EBD6" stroke="#D4A853" strokeWidth="1.5" />
        <rect x="40" y="558" width="15" height="13" rx="2" fill="#D4A853" opacity="0.7" />
        <text x="96" y="569" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="1.5" fill="#a9842f">CAJA</text>
      </g>

      {/* Entrada (abajo-der) */}
      <g>
        <line x1="252" y1="610" x2="330" y2="610" stroke="#FBF9F4" strokeWidth="6" />
        <line x1="252" y1="610" x2="252" y2="568" stroke="#2D2A26" strokeWidth="2.5" />
        <path d="M252 568 A 42 42 0 0 1 294 610" fill="none" stroke="#bdb6a8" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="306" y="592" textAnchor="middle" fontSize="9" fontWeight="800" letterSpacing="0.5" fill="#8a857c">ENTRADA</text>
      </g>

      <Planta cx={40} cy={300} /><Planta cx={340} cy={300} />
    </>
  )
}

// ─── Chrome: Rooftop / terraza ───────────────────────────────
function RooftopChrome() {
  return (
    <>
      {/* Balaustrada (terraza abierta) en muro superior */}
      {Array.from({ length: 11 }).map((_, i) => (
        <line key={i} x1={40 + i * 30} y1="16" x2={40 + i * 30} y2="24" stroke="#bcd0c2" strokeWidth="2" />
      ))}

      {/* Escalera central ← desde planta */}
      <Escalera dir="down" label="↓ PLANTA" />

      {/* Barra (abajo) con banquetas */}
      <g>
        <rect x="40" y="546" width="300" height="38" rx="8" fill="#F6EBD6" stroke="#D4A853" strokeWidth="1.5" />
        <text x="190" y="569" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="2" fill="#a9842f">BARRA</text>
        {[70, 110, 270, 310].map((cx) => (
          <circle key={cx} cx={cx} cy="535" r="6" fill="#cdbba6" stroke="rgba(45,42,38,0.15)" />
        ))}
      </g>

      {/* Pérgola (esquina superior-derecha) */}
      <g opacity="0.5" stroke="#bcd0c2" strokeWidth="1">
        {[0, 1, 2, 3].map((i) => <line key={`pa${i}`} x1={300 + i * 18} y1="110" x2={300 + i * 18} y2="180" />)}
        {[0, 1, 2, 3].map((i) => <line key={`pb${i}`} x1="300" y1={110 + i * 18} x2="354" y2={110 + i * 18} />)}
      </g>

      {/* Plantas / jardineras */}
      <Planta cx={42} cy={110} /><Planta cx={42} cy={300} /><Planta cx={42} cy={470} />
      <Planta cx={338} cy={470} /><Planta cx={140} cy={500} /><Planta cx={240} cy={500} />

      <text x="190" y="116" textAnchor="middle" fontSize="9" fontWeight="800" letterSpacing="2" fill="#9aa59a">TERRAZA AL AIRE LIBRE</text>
    </>
  )
}
