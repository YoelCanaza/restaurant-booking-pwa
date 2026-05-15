interface SkeletonCardProps {
  variant?: 'dish' | 'dish-grid' | 'reservation'
}

/**
 * SkeletonCard — Componente base
 * Placeholder animado (shimmer) para estados de carga.
 */
export default function SkeletonCard({ variant = 'dish' }: SkeletonCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-4 w-full flex gap-4 animate-pulse">
      {variant === 'dish' ? (
        <>
          {/* Imagen del plato */}
          <div className="w-20 h-20 bg-border/40 rounded-xl flex-shrink-0" />
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="h-4 bg-border/40 rounded w-3/4" />
            <div className="h-3 bg-border/40 rounded w-1/2" />
            <div className="h-4 bg-border/40 rounded w-1/4 mt-2" />
          </div>
        </>
      ) : variant === 'dish-grid' ? (
        /* Variante vertical de 2 columnas */
        <div className="flex flex-col w-full h-full p-0">
          <div className="w-full h-[160px] bg-border/40 rounded-t-2xl flex-shrink-0" />
          <div className="p-3.5 flex flex-col gap-2">
            <div className="h-4 bg-border/40 rounded w-3/4" />
            <div className="h-3 bg-border/40 rounded w-full mt-1" />
            <div className="h-3 bg-border/40 rounded w-2/3" />
            <div className="h-5 bg-border/40 rounded w-1/3 mt-4" />
          </div>
        </div>
      ) : (
        /* Variante Reserva */
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between">
            <div className="h-5 bg-border/40 rounded w-1/3" />
            <div className="h-5 bg-border/40 rounded w-16" />
          </div>
          <div className="h-3 bg-border/40 rounded w-2/3" />
          <div className="h-3 bg-border/40 rounded w-1/2" />
        </div>
      )}
    </div>
  )
}
