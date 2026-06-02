import { type ReactNode } from 'react'

const HAIRLINE = 'border-carbon/[0.08]'

interface PanelProps {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  /** Sin padding interno (para listas con filas a sangre completa). */
  flush?: boolean
}

/**
 * Panel — contenedor de sección del lenguaje "Andino Pro":
 * radios contenidos, borde hairline, sombra suave y cabecera opcional.
 * Usado en toda la suite de administración.
 */
export default function Panel({ title, action, children, className = '', flush = false }: PanelProps) {
  return (
    <section className={`bg-white rounded-xl border ${HAIRLINE} overflow-hidden shadow-[0_1px_3px_rgba(45,42,38,0.05)] ${className}`}>
      {(title || action) && (
        <div className={`flex items-center justify-between gap-3 px-5 py-4 border-b ${HAIRLINE}`}>
          {title && <h3 className="font-display text-lg font-bold text-carbon m-0">{title}</h3>}
          {action}
        </div>
      )}
      <div className={flush ? '' : 'p-5'}>{children}</div>
    </section>
  )
}

/** Fila de lista con divisor hairline; pensada para usarse con `flush`. */
export function PanelRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-3.5 border-b ${HAIRLINE} last:border-0 hover:bg-bone/50 transition-colors ${className}`}>
      {children}
    </div>
  )
}
