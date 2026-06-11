import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Calendar, ShoppingBag, ArrowRight, LogIn,
  CalendarCheck, Bike, Smartphone, Wallet, MapPin, Bell, WifiOff, CheckCircle2,
} from 'lucide-react'
import MenuGrid from '../components/delivery/MenuGrid'
import { CATEGORIAS } from '../lib/categorias'
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

      {/* ── Franja de beneficios ───────────────────────────── */}
      <section className="border-b border-carbon/[0.06] bg-white">
        <div className="max-w-5xl mx-auto px-5 md:px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <CalendarCheck size={18} />, t: 'Reserva sin costo', d: 'Confirmación del restaurante, pagas en el local' },
            { icon: <Bike size={18} />, t: 'Delivery contra entrega', d: 'Recibe primero, paga después' },
            { icon: <Wallet size={18} />, t: 'Efectivo, Yape o Plin', d: 'Sin tarjetas ni pagos en línea' },
          ].map((b) => (
            <div key={b.t} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
                {b.icon}
              </div>
              <div>
                <p className="m-0 text-sm font-bold text-carbon">{b.t}</p>
                <p className="m-0 text-xs text-carbon/50">{b.d}</p>
              </div>
            </div>
          ))}
        </div>
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

      {/* ── App móvil (PWA) ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-carbon mt-14">
        <div className="andean-motif absolute inset-0 opacity-[0.05]" />
        <div className="relative max-w-5xl mx-auto px-6 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">

          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber mb-3">
              También en tu celular
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight leading-[1.1] m-0 max-w-[16ch]">
              Llévanos en tu bolsillo
            </h2>
            <p className="text-white/55 mt-4 text-base font-medium max-w-[40ch] leading-relaxed">
              Rincón Andino es una app web: ábrela desde cualquier celular e instálala
              sin pasar por una tienda de aplicaciones.
            </p>

            <ul className="mt-7 flex flex-col gap-4 list-none p-0 m-0">
              {[
                { icon: <Smartphone size={17} />, t: 'Instálala como app', d: 'Desde el navegador: "Añadir a pantalla de inicio"' },
                { icon: <MapPin size={17} />, t: 'Sigue tu pedido en vivo', d: 'De la cocina a tu puerta, paso a paso' },
                { icon: <Bell size={17} />, t: 'Entérate al instante', d: 'Tu reserva confirmada, tu pedido en camino' },
                { icon: <WifiOff size={17} />, t: 'Funciona con mala señal', d: 'La carta queda guardada aunque se corte internet' },
              ].map((f) => (
                <li key={f.t} className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 text-amber flex items-center justify-center shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <p className="m-0 text-sm font-bold text-white">{f.t}</p>
                    <p className="m-0 text-[13px] text-white/45 leading-relaxed">{f.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Mockup de teléfono (CSS puro) */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center md:justify-end"
            aria-hidden="true"
          >
            <div className="relative w-[250px] shrink-0">
              {/* Glow */}
              <div className="absolute -inset-6 bg-terracotta/20 blur-3xl rounded-full" />

              {/* Frame */}
              <div className="relative rounded-[2.4rem] border-[6px] border-black bg-bone shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />

                {/* Pantalla: mini tracker de pedido */}
                <div className="pt-10 pb-4 px-4 flex flex-col gap-3 min-h-[420px]">
                  {/* Mini header */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-terracotta text-white flex items-center justify-center font-display font-black text-[9px]">RA</div>
                    <span className="font-display font-bold text-carbon text-xs">Mi pedido</span>
                  </div>

                  {/* Tarjeta de estado */}
                  <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-carbon/[0.06]">
                    <p className="m-0 text-[9px] font-bold uppercase tracking-wider text-carbon/40">Pedido #A4F2C1</p>
                    <p className="m-0 mt-1 font-display font-black text-carbon text-sm">En camino 🛵</p>
                    <p className="m-0 text-[10px] text-carbon/50">Llega aprox. 7:45 pm</p>

                    {/* Pasos del tracker */}
                    <div className="flex items-center mt-3">
                      {['Nuevo', 'Cocina', 'Camino', 'Entrega'].map((paso, i) => (
                        <div key={paso} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${i <= 2 ? 'bg-terracotta text-white' : 'bg-carbon/10 text-carbon/30'}`}>
                              {i < 2 ? <CheckCircle2 size={11} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </div>
                            <span className={`text-[7px] font-bold uppercase ${i <= 2 ? 'text-terracotta' : 'text-carbon/30'}`}>{paso}</span>
                          </div>
                          {i < 3 && <div className={`flex-1 h-0.5 mx-0.5 -mt-3 rounded ${i < 2 ? 'bg-terracotta' : 'bg-carbon/10'}`} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ítems del pedido */}
                  <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-carbon/[0.06] flex flex-col gap-2">
                    {[
                      ['2× Trucha a la Plancha', 'S/ 56.00'],
                      ['1× Chicha Morada', 'S/ 12.00'],
                    ].map(([n, p]) => (
                      <div key={n} className="flex justify-between text-[10px] font-medium text-carbon">
                        <span>{n}</span><span className="font-bold">{p}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-[11px] font-black text-carbon border-t border-carbon/[0.08] pt-2">
                      <span>Total</span><span>S/ 68.00</span>
                    </div>
                  </div>

                  {/* Notificación entrante */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    className="bg-carbon text-white rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-lg"
                  >
                    <Bell size={12} className="text-amber shrink-0" />
                    <p className="m-0 text-[9px] leading-snug">
                      <span className="font-bold">Rincón Andino</span> · Tu repartidor está cerca 📍
                    </p>
                  </motion.div>

                  {/* Mini bottom nav */}
                  <div className="mt-auto bg-white rounded-xl border border-carbon/[0.06] h-10 flex items-center justify-around px-3 shadow-sm">
                    {[ShoppingBag, Calendar, MapPin, Smartphone].map((Icon, i) => (
                      <Icon key={i} size={14} className={i === 2 ? 'text-terracotta' : 'text-carbon/30'} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-carbon border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-terracotta text-white flex items-center justify-center font-display font-black text-[10px]">RA</div>
            <span className="text-white/60 text-sm font-medium">Rincón Andino · Puno, Perú</span>
          </div>
          <p className="m-0 text-white/30 text-xs">Jr. Lima 245, Puno · 951 234 567 · 12:00–22:00</p>
        </div>
      </footer>

      {/* Carrito flotante con checkout de invitado */}
      <CartDrawer onSuccess={() => navigate('/cliente/pedidos')} />
    </div>
  )
}
