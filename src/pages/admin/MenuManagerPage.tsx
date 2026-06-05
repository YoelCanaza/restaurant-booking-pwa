import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, Check, ImagePlus, Pencil, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useToastStore } from '../../store/useToastStore'
import { useCurrentUser } from '../../hooks'
import Switch from '../../components/ui/Switch'
import Chip from '../../components/ui/Chip'
import Button from '../../components/ui/Button'
import type { Plato } from '../../types'

const CATEGORIAS = ['todos', 'entradas', 'sopas', 'segundos', 'bebidas']

export default function MenuManagerPage() {
  const user = useCurrentUser()
  const platos = useAppStore((s) => s.platos)
  const togglePlatoDisponible = useAppStore((s) => s.togglePlatoDisponible)
  const updatePlatoPrecio = useAppStore((s) => s.updatePlatoPrecio)
  const addPlato = useAppStore((s) => s.addPlato)
  const updatePlato = useAppStore((s) => s.updatePlato)
  const eliminarPlato = useAppStore((s) => s.eliminarPlato)
  const addToast = useToastStore((s) => s.addToast)

  const [categoriaSel, setCategoriaSel] = useState('todos')
  const [search, setSearch] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Estado del formulario nuevo plato
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [nuevoCategoria, setNuevoCategoria] = useState('segundos')
  const [nuevaDescripcion, setNuevaDescripcion] = useState('')
  const [nuevaImagen, setNuevaImagen] = useState('') // data URL o URL de la imagen referencial
  const [editId, setEditId] = useState<string | null>(null) // null = alta; id = edición
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleImagen = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { addToast('Selecciona un archivo de imagen', 'error'); return }
    if (file.size > 1_500_000) { addToast('La imagen supera 1.5 MB. Usa una más liviana.', 'error'); return }
    const reader = new FileReader()
    reader.onload = () => setNuevaImagen(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Estado para edición inline
  const [editingPrecioId, setEditingPrecioId] = useState<string | null>(null)
  const [tempPrecio, setTempPrecio] = useState('')

  const platosFiltrados = useMemo(() => {
    return platos.filter((p) => {
      const matchCat = categoriaSel === 'todos' || p.categoria === categoriaSel
      const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [platos, categoriaSel, search])

  const handleGuardarPrecio = (plato: Plato) => {
    const val = parseFloat(tempPrecio)
    if (!isNaN(val) && val > 0) {
      updatePlatoPrecio(plato.id, val)
      addToast(`Precio de ${plato.nombre} actualizado a S/ ${val.toFixed(2)}`, 'success')
    } else {
      addToast('Precio inválido', 'error')
    }
    setEditingPrecioId(null)
  }

  const handleToggle = (plato: Plato) => {
    togglePlatoDisponible(plato.id, user?.id ?? '', user?.role ?? 'admin')
    addToast(
      `${plato.nombre} ahora está ${!plato.disponible ? 'disponible' : 'agotado'}`,
      !plato.disponible ? 'success' : 'warning'
    )
  }

  const resetForm = () => {
    setNuevoNombre(''); setNuevoPrecio(''); setNuevoCategoria('segundos')
    setNuevaDescripcion(''); setNuevaImagen(''); setEditId(null)
  }
  const cerrarForm = () => { setIsAdding(false); resetForm() }
  const abrirNuevo = () => { resetForm(); setIsAdding(true) }
  const abrirEditar = (plato: Plato) => {
    setNuevoNombre(plato.nombre)
    setNuevoPrecio(plato.precio.toString())
    setNuevoCategoria(plato.categoria)
    setNuevaDescripcion(plato.descripcion)
    setNuevaImagen(plato.imageUrl)
    setEditId(plato.id)
    setIsAdding(true)
  }

  const handleGuardarPlato = () => {
    const val = parseFloat(nuevoPrecio)
    if (!nuevoNombre || isNaN(val) || val <= 0) {
      addToast('Llena los campos correctamente', 'error')
      return
    }
    const descripcion = nuevaDescripcion.trim() || 'Plato de la casa.'

    if (editId) {
      updatePlato(editId, {
        nombre: nuevoNombre,
        descripcion,
        precio: val,
        categoria: nuevoCategoria as any,
        imageUrl: nuevaImagen || `https://placehold.co/400x300/E05936/FFFFFF?text=${encodeURIComponent(nuevoNombre)}`,
      })
      addToast(`${nuevoNombre} actualizado`, 'success')
    } else {
      addPlato({
        id: `plato_${Date.now()}`,
        nombre: nuevoNombre,
        descripcion,
        precio: val,
        categoria: nuevoCategoria as any,
        imageUrl: nuevaImagen || `https://placehold.co/400x300/E05936/FFFFFF?text=${encodeURIComponent(nuevoNombre)}`,
        disponible: true,
        tiempoPreparacion: 15,
        popularidad: 0,
      })
      addToast(`${nuevoNombre} agregado exitosamente`, 'success')
    }
    cerrarForm()
  }

  const handleEliminar = (plato: Plato) => {
    const r = eliminarPlato(plato.id)
    addToast(r.ok ? `${plato.nombre} eliminado` : r.error ?? 'No se pudo eliminar', r.ok ? 'warning' : 'error')
    setConfirmDeleteId(null)
  }

  return (
    <div className="flex flex-col min-h-full bg-bone pb-24">
      {/* Header Fijo */}
      <div className="sticky top-0 z-30 bg-bone/95 backdrop-blur-md pt-6 pb-4 border-b border-border/40">
        <div className="px-6 mb-4">
          <h1 className="font-display text-2xl font-black text-carbon tracking-tight">Gestor de Menú</h1>
        </div>

        {/* Búsqueda */}
        <div className="px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-carbon/40" size={20} />
            <input
              type="text"
              placeholder="Buscar plato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 bg-white border border-border/60 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Categorías */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-6 pb-1">
          {CATEGORIAS.map((cat) => (
            <Chip
              key={cat}
              label={cat.charAt(0).toUpperCase() + cat.slice(1)}
              selected={categoriaSel === cat}
              onClick={() => setCategoriaSel(cat)}
            />
          ))}
        </div>
      </div>

      {/* Lista de Platos */}
      <div className="flex-1 px-6 pt-4 flex flex-col gap-4">
        {platosFiltrados.map((plato) => (
          <div key={plato.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border/40 flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-bone">
              <img src={plato.imageUrl} alt={plato.nombre} className={`w-full h-full object-cover transition-opacity ${!plato.disponible ? 'opacity-40 grayscale' : ''}`} />
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h3 className={`font-bold text-sm leading-tight mb-1 ${!plato.disponible ? 'text-carbon/60' : 'text-carbon'}`}>
                {plato.nombre}
              </h3>
              
              {/* Edición de Precio Inline */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-carbon/50">S/</span>
                {editingPrecioId === plato.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      autoFocus
                      value={tempPrecio}
                      onChange={(e) => setTempPrecio(e.target.value)}
                      className="w-20 bg-bone border border-terracotta rounded px-2 py-1 text-sm font-bold text-terracotta focus:outline-none"
                    />
                    <button 
                      onClick={() => handleGuardarPrecio(plato)}
                      className="w-7 h-7 bg-terracotta text-white rounded-full flex items-center justify-center hover:bg-terracotta/90"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <span 
                    className="font-extrabold text-terracotta cursor-pointer hover:bg-terracotta/10 px-1.5 py-0.5 rounded -ml-1 transition-colors"
                    onClick={() => {
                      setEditingPrecioId(plato.id)
                      setTempPrecio(plato.precio.toString())
                    }}
                  >
                    {plato.precio.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Acciones + disponibilidad */}
            <div className="flex flex-col justify-between items-end gap-2 py-0.5">
              {confirmDeleteId === plato.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEliminar(plato)} className="h-7 px-2.5 rounded-lg bg-error text-white text-xs font-bold">Eliminar</button>
                  <button onClick={() => setConfirmDeleteId(null)} className="h-7 px-2.5 rounded-lg border border-carbon/15 text-xs font-semibold text-carbon/60">No</button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => abrirEditar(plato)} aria-label="Editar plato" className="w-7 h-7 rounded-lg border border-carbon/10 text-carbon/55 flex items-center justify-center hover:text-terracotta hover:border-terracotta/40 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setConfirmDeleteId(plato.id)} aria-label="Eliminar plato" className="w-7 h-7 rounded-lg border border-carbon/10 text-carbon/55 flex items-center justify-center hover:text-error hover:border-error/40 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold text-carbon/40 uppercase tracking-wider">
                  {plato.disponible ? 'Disponible' : 'Agotado'}
                </span>
                <Switch checked={plato.disponible} onChange={() => handleToggle(plato)} />
              </div>
            </div>
          </div>
        ))}

        {platosFiltrados.length === 0 && (
          <div className="text-center py-12 text-carbon/40">
            <p className="font-medium">No se encontraron platos.</p>
          </div>
        )}
      </div>

      {/* FAB Agregar Plato */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={abrirNuevo}
        className="fixed bottom-[84px] right-6 w-14 h-14 bg-terracotta text-white rounded-full flex items-center justify-center shadow-lg shadow-terracotta/30 z-40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta"
      >
        <Plus size={24} />
      </motion.button>

      {/* Bottom Sheet: Nuevo Plato */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cerrarForm}
              className="fixed inset-0 bg-carbon/60 backdrop-blur-[2px] z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-bone z-50 rounded-t-3xl shadow-2xl"
            >
              <div className="px-6 py-4 flex justify-between items-center border-b border-border/40 bg-white rounded-t-3xl">
                <h3 className="font-display text-xl font-bold text-carbon">{editId ? 'Editar plato' : 'Añadir nuevo plato'}</h3>
                <button
                  onClick={cerrarForm}
                  className="p-2 bg-border/40 rounded-full text-carbon/60 hover:bg-border/60"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                {/* Imagen referencial */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-carbon/60 uppercase tracking-wider pl-1">Imagen referencial</label>
                  <label className="relative flex items-center justify-center h-36 rounded-xl border-2 border-dashed border-border/70 bg-white overflow-hidden cursor-pointer hover:border-terracotta transition-colors">
                    {nuevaImagen ? (
                      <img src={nuevaImagen} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                      <span className="flex flex-col items-center gap-1 text-carbon/40">
                        <ImagePlus size={26} />
                        <span className="text-sm font-semibold">Subir foto del plato</span>
                        <span className="text-[11px]">JPG/PNG · máx 1.5 MB</span>
                      </span>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagen(e.target.files?.[0])} />
                  </label>
                  {nuevaImagen && (
                    <button type="button" onClick={() => setNuevaImagen('')} className="self-start text-xs font-semibold text-error hover:underline">
                      Quitar imagen
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-carbon/60 uppercase tracking-wider pl-1">
                    Nombre del Plato
                  </label>
                  <input
                    type="text"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full h-12 bg-white border border-border/60 rounded-xl px-4 text-carbon focus:border-terracotta focus:outline-none"
                    placeholder="Ej. Lomo Saltado"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-bold text-carbon/60 uppercase tracking-wider pl-1">
                      Precio (S/)
                    </label>
                    <input
                      type="number"
                      value={nuevoPrecio}
                      onChange={(e) => setNuevoPrecio(e.target.value)}
                      className="w-full h-12 bg-white border border-border/60 rounded-xl px-4 text-carbon focus:border-terracotta focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-bold text-carbon/60 uppercase tracking-wider pl-1">
                      Categoría
                    </label>
                    <select
                      value={nuevoCategoria}
                      onChange={(e) => setNuevoCategoria(e.target.value)}
                      className="w-full h-12 bg-white border border-border/60 rounded-xl px-4 text-carbon focus:border-terracotta focus:outline-none appearance-none"
                    >
                      {CATEGORIAS.filter(c => c !== 'todos').map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-carbon/60 uppercase tracking-wider pl-1">Descripción</label>
                  <textarea
                    value={nuevaDescripcion}
                    onChange={(e) => setNuevaDescripcion(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-border/60 rounded-xl px-4 py-3 text-carbon focus:border-terracotta focus:outline-none resize-none"
                    placeholder="Breve descripción: ingredientes, acompañamientos, origen…"
                  />
                </div>

                <Button fullWidth onClick={handleGuardarPlato} className="mt-2 h-14">
                  {editId ? 'Guardar cambios' : 'Guardar plato'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
