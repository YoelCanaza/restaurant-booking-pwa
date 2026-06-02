import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
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
  const { pedidos, updatePedidoEstado } = useAppStore()
  const { user } = useAuthStore()
  const [recipeModal, setRecipeModal] = useState<string | null>(null)

  const cocinaId = user?.id ?? 'usr_cocina_01'

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
    <div style={{ height: '100%', display: 'flex', gap: '1rem' }}>
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
    </div>
  )
}
