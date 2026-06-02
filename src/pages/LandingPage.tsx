import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, ShoppingBag, ArrowRight, LogIn } from 'lucide-react'
import MenuGrid, { CATEGORIAS } from '../components/delivery/MenuGrid'
import CartDrawer from '../components/delivery/CartDrawer'
import Chip from '../components/ui/Chip'
import type { CategoriaPlato } from '../types'

const HERO = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=70&auto=format&fit=crop'

/**
 * LandingPage — vitrina pública del restaurante (sin sesión).
 * El invitado explora la carta y puede pedir; la cuenta se crea de forma
 * invisible al confirmar (modelo "invitado primero", BUSINESS_LOGIC §3.4).
 */
export default function LandingPage() {
  const navigate = useNavigate()
  const [categoria, setCategoria] = useState<CategoriaPlato | 'todos'>('todos')

  const irACarta = () => document.getElementById('carta')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-[100dvh] bg-bone">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-bone/90 backdrop-blur-md border-b border-carbon/[0.08]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-terracotta text-white flex items-center justify-center font-display font-black text-sm">RA</div>
            <span className="font-display font-bold text-carbon">Rincón Andino</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-carbon/[0.12] text-sm font-semibold text-carbon hover:bg-white transition-colors"
          >
            <LogIn size={16} /> Ingresar
          </button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <img src={HERO} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-carbon via-carbon/85 to-carbon/55" />
        <div className="andean-motif absolute inset-0 opacity-[0.07]" />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-5xl mx-auto px-6 py-16 md:py-24 text-white"
        >
          <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.24em] text-amber mb-4">
            Gastronomía puneña · Puno, Perú
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-black leading-[1.05] tracking-tight m-0 max-w-[16ch]">
            Los sabores del altiplano, en tu mesa
          </h1>
          <p className="text-white/60 mt-4 text-base md:text-lg font-medium max-w-[44ch] leading-relaxed">
            Reserva tu mesa o recibe nuestra cocina puneña a domicilio. Sin cuenta, sin complicaciones.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={irACarta}
              className="h-12 px-6 rounded-xl bg-terracotta text-white font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-terracotta/30 hover:bg-terracotta/90 active:scale-[0.98] transition-all"
            >
              <ShoppingBag size={18} /> Pedir delivery
            </button>
            <button
              onClick={() => navigate('/cliente/reserva')}
              className="h-12 px-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-white/20 active:scale-[0.98] transition-all"
            >
              <Calendar size={18} /> Reservar mesa
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Carta ──────────────────────────────────────────── */}
      <section id="carta" className="max-w-5xl mx-auto px-5 md:px-6 pt-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta mb-1">Nuestra carta</p>
            <h2 className="font-display text-2xl md:text-3xl font-black text-carbon tracking-tight m-0">Elige tus platos</h2>
          </div>
          <button onClick={() => navigate('/login')} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-terracotta hover:gap-1.5 transition-all">
            Ya tengo cuenta <ArrowRight size={15} />
          </button>
        </div>

        {/* Chips de categoría */}
        <div className="sticky top-14 z-30 bg-bone/95 backdrop-blur-md -mx-5 px-5 py-3 flex overflow-x-auto no-scrollbar gap-2.5 border-b border-carbon/[0.06]">
          {CATEGORIAS.map((c) => (
            <Chip key={c.id} label={c.label} selected={categoria === c.id} onClick={() => setCategoria(c.id)} />
          ))}
        </div>

        <MenuGrid categoriaActiva={categoria} />
      </section>

      {/* Carrito flotante con checkout de invitado */}
      <CartDrawer onSuccess={() => navigate('/cliente/pedidos')} />
    </div>
  )
}
