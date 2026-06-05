import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { Ban } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useToastStore } from '../../store/useToastStore'
import type { EstadoPedido } from '../../types'
import TicketCard from '../../components/cocina/TicketCard'
import Modal from '../../components/ui/Modal'

// Columnas del Kanban de cocina mapeadas a los estados reales de Pedido
const COLUMNS: { id: EstadoPedido; title: string; color: string }[] = [
  { id: 'nuevo', title: 'Nuevos', color: '#3B82F6' },
  { id: 'preparando', title: 'En Preparación', color: '#F59E0B' },
  { id: 'listo', title: 'Listos para Servir / Despachar', color: '#10B981' },
]

export default function KitchenKDS() {
  const { pedidos, updatePedidoEstado, platos, togglePlatoDisponible } = useAppStore()
  const { user } = useAuthStore()
  const addToast = useToastStore((s) => s.addToast)
  const [recipeModal, setRecipeModal] = useState<string | null>(null)
  const [showAgotados, setShowAgotados] = useState(false)

  const cocinaId = user?.id ?? 'usr_cocina_01'

  const toggleAgotado = (platoId: string, nombre: string, disponible: boolean) => {
    togglePlatoDisponible(platoId, cocinaId, 'cocina')
    addToast(`${nombre} ${disponible ? 'marcado como agotado' : 'vuelve a estar disponible'}`, disponible ? 'warning' : 'success')
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    
    // Si se suelta fuera de un droppable
    if (!destination) return
    
    // Si se suelta en la misma posición
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Validamos que el drag haya sido hacia una de nuestras columnas válidas
    const validDestinations = ['nuevo', 'preparando', 'listo']
    if (validDestinations.includes(destination.droppableId)) {
      updatePedidoEstado(draggableId, destination.droppableId as EstadoPedido, cocinaId, 'cocina')
    }
  }

  // Filtramos solo los pedidos que competen a cocina
  const ticketsCocina = pedidos.filter((p) => 
    p.estado === 'nuevo' || p.estado === 'preparando' || p.estado === 'listo'
  )

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs font-bold uppercase tracking-wider text-carbon/40">Cola de preparación</span>
        <button
          onClick={() => setShowAgotados(true)}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-white border border-carbon/[0.08] text-sm font-semibold text-carbon/70 hover:text-error hover:border-error/40 transition-colors"
        >
          <Ban size={16} /> Marcar plato agotado
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: '1rem', minHeight: 0 }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {COLUMNS.map((col) => {
          // Ordenamos por fecha de creación (FIFO)
          const colTickets = ticketsCocina
            .filter((t) => t.estado === col.id)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          
          return (
            <div
              key={col.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(45,42,38,0.03)',
                borderRadius: 16,
                padding: '1rem',
                borderTop: `4px solid ${col.color}`,
                minWidth: 300,
              }}
            >
              {/* Header Columna */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="font-display" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-carbon)' }}>
                  {col.title}
                </h2>
                <span
                  style={{
                    backgroundColor: 'rgba(45,42,38,0.1)',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: 'var(--color-carbon)'
                  }}
                >
                  {colTickets.length}
                </span>
              </div>

              {/* Lista Droppable */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      overflowY: 'auto',
                      paddingRight: '0.25rem', // Para el scrollbar
                      backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.02)' : 'transparent',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {colTickets.map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'translate(0, 0)',
                            }}
                          >
                            <TicketCard
                              ticket={ticket}
                              onClickRecipe={(itemName) => setRecipeModal(itemName)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </DragDropContext>
      </div>

      {/* Modal de Receta (demo) */}
      <Modal
        open={!!recipeModal}
        onClose={() => setRecipeModal(null)}
        title={`Receta: ${recipeModal ?? ''}`}
        subtitle="Vista de demostración"
        size="sm"
      >
        <p className="text-carbon/70 leading-relaxed">
          Aquí se mostraría la imagen del emplatado, los ingredientes exactos y las
          instrucciones de preparación paso a paso.
        </p>
      </Modal>

      {/* Modal: marcar platos agotados */}
      <Modal
        open={showAgotados}
        onClose={() => setShowAgotados(false)}
        title="Disponibilidad de platos"
        subtitle="Marca lo que se acabó; deja de aparecer para el cliente"
      >
        <div className="flex flex-col divide-y divide-carbon/[0.07] -my-1">
          {platos.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className={`font-semibold ${p.disponible ? 'text-carbon' : 'text-carbon/40 line-through'}`}>{p.nombre}</span>
              <button
                onClick={() => toggleAgotado(p.id, p.nombre, p.disponible)}
                className={`h-8 px-3 rounded-lg text-sm font-bold border transition-colors shrink-0 ${
                  p.disponible
                    ? 'border-carbon/[0.08] text-carbon/60 hover:bg-error hover:text-white hover:border-error'
                    : 'border-success/40 bg-success/10 text-success hover:bg-success hover:text-white'
                }`}
              >
                {p.disponible ? 'Marcar agotado' : 'Reactivar'}
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
