# Rincón Andino PWA

> Sistema de gestión gastronómica para restaurante de cocina puneña — rediseñado con enfoque en Interacción Humano-Computador (HCI).

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange)](https://github.com/pmndrs/zustand)
[![Deploy](https://img.shields.io/badge/Vercel-Live-black?logo=vercel)](https://restaurant-booking-pwa.vercel.app/)

**[Ver demo en vivo →](https://restaurant-booking-pwa.vercel.app/)**

---

## Sobre el proyecto

Rincón Andino es una **Progressive Web App** que digitaliza la operación completa de un restaurante: desde que el cliente navega el menú hasta que el cajero cierra el cobro. El rediseño aplica las **10 heurísticas de Nielsen**, la **Ley de Fitts**, la **Ley de Miller** y principios de diseño Gestalt a cada pantalla del sistema.

El proyecto cubre **6 roles** con interfaces completamente distintas, cada uno optimizado para su contexto de uso:

| Rol | Dispositivo principal | Layout |
|-----|----------------------|--------|
| Cliente | Celular | Mobile-first + BottomNav |
| Mesero | Celular | Mobile-first + BottomNav |
| Cocina | Pantalla grande (KDS) | KdsLayout — alto contraste |
| Cajero | Escritorio / tablet | Desktop-first + SidebarNav |
| Administrador | Escritorio | Desktop-first + SidebarNav |
| Repartidor | Celular | Mobile-first + BottomNav |

---

## Funcionalidades por rol

### Cliente
- Navegación del menú sin login — *invitado primero, registro diferido al confirmar*
- Reserva de mesa con plano SVG interactivo del restaurante (*mundo en miniatura*)
- Order tracker en tiempo real: Recibido → Preparando → En Camino → Entregado
- Carrito persistente con drawer lateral y cálculo de total en vivo

### Mesero
- Plano de mesas con estado por color (libre / ocupada / reservada / pagando)
- Toma de comandas y soporte para pedidos adicionales sin cerrar la mesa
- Flujo de "pedir cuenta" que notifica al cajero directamente

### Cocina (KDS)
- Cola FIFO de pedidos con temporizador de espera
- Avance de estado por ticket: nuevo → preparando → listo
- Reordenamiento manual con drag & drop

### Cajero (POS)
- Cola automática de cobros pendientes (salón en estado *pagando* + delivery en efectivo)
- Comprobante con desglose: subtotal, IGV 18 %, servicio 10 %
- Validación de monto antes de confirmar el pago

### Administrador
- Dashboard con KPIs: ingresos del día, mesas ocupadas, pedidos activos
- Gestión de menú (precios, disponibilidad, nuevos platos)
- Gestión de reservas, pedidos, personal y clientes

### Repartidor
- Panel de entregas asignadas con totales de cobro por turno
- Integración con Google Maps para navegación externa
- Swipe-to-confirm para marcar entregas (previene toques accidentales en movimiento)

---

## Principios HCI aplicados

**Heurísticas de Nielsen:**

| # | Heurística | Dónde se ve |
|---|------------|-------------|
| H1 | Visibilidad del estado | OrderTracker, badges de cocina, colores de mesa |
| H2 | Mundo real | Plano SVG, lenguaje de dominio ("comanda", "pedir cuenta") |
| H3 | Control y libertad | Cancelar reserva, cerrar modales, deshacer carrito |
| H4 | Consistencia | StepIndicator en reservas, mismo design system en 6 layouts |
| H5 | Prevención de errores | SwipeToConfirm, validación de monto en caja, confirmación en acciones críticas |
| H6 | Reconocer antes que recordar | Imágenes en menú, carrito siempre visible, resumen antes de confirmar |
| H7 | Flexibilidad | Accesos directos en admin dashboard, drag & drop en cocina |
| H8 | Diseño minimalista | KDS solo con lo esencial, jerarquía visual clara por sección |
| H9 | Recuperación de errores | Mensajes de toast con causa exacta vía `OperationResult` |
| H10 | Ayuda y documentación | Estados vacíos con guía de acción, tooltips en admin |

**Leyes de diseño:**
- **Ley de Fitts** — áreas táctiles ≥ 44 px, botones primarios en zona de pulgar
- **Ley de Miller** — categorías del menú agrupadas en bloques de máximo 7 ítems
- **Gestalt** — tarjetas con sombra para agrupar, separación visual de capas

---

## Sistema de diseño

Paleta "Andino elevado" — cuatro tokens semánticos usados en toda la app:

| Token | Color | Uso |
|-------|-------|-----|
| `--color-terracotta` | `#E05936` | Acción principal, estados activos |
| `--color-carbon` | `#2D2A26` | Texto, fondos de admin/cocina |
| `--color-bone` | `#F9F6F0` | Fondo base, superficies claras |
| `--color-amber` | `#D4A853` | Delivery, advertencias, estados pendientes |

Tipografía: **Fraunces** (display/títulos) + **Inter** (body) — ambas self-hosted.

---

## Stack

```
React 19 + TypeScript
Vite 8                    — build y dev server
Tailwind CSS 4            — estilos vía @tailwindcss/vite
Zustand 5 + Immer         — estado global con persistencia en localStorage
React Router 7            — ruteo por rol con ProtectedRoute
Framer Motion             — microinteracciones y transiciones
Lucide React              — iconografía consistente
@hello-pangea/dnd         — drag & drop en KDS
vite-plugin-pwa           — manifiesto y service worker
```

Backend objetivo (roadmap): **Supabase** (Postgres + Auth + Realtime + Storage). Hoy el estado es mock en memoria.

---

## Instalación

```bash
git clone https://github.com/YoelCanaza/restaurant-booking-pwa.git
cd restaurant-booking-pwa
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # producción
npm run preview    # previsualizar build
npm run lint       # eslint
```

---

## Estructura

```
src/
├── components/
│   ├── ui/          # Primitivos: Button, Card, Chip, Modal, Input, StatusPill…
│   ├── cliente/     # OrderTracker, StepIndicator
│   └── delivery/    # CartDrawer, OrderCard, SwipeToConfirm
├── pages/
│   ├── cliente/     # LandingPage, DeliveryMenu, ReservationFlow, MyOrdersPage…
│   ├── mesero/      # WaiterDashboard
│   ├── cocina/      # KitchenKDS
│   ├── caja/        # POSView
│   ├── admin/       # AdminDashboard + 5 subpáginas de gestión
│   └── delivery/    # DeliveryView
├── store/
│   ├── useAppStore.ts   # Dominio: platos, mesas, reservas, pedidos, carrito
│   ├── useAuthStore.ts  # Sesión y usuarios
│   └── useToastStore.ts # Notificaciones globales
├── types/index.ts       # Tipos canónicos del dominio
└── lib/
    ├── estados.ts        # Colores y etiquetas de estado (fuente única)
    └── supabase.ts       # Cliente futuro (roadmap)
```

---

## Contexto académico

Proyecto desarrollado para el curso **Interacción Humano-Computador** — Ingeniería de Sistemas, Universidad Nacional del Altiplano (UNAP), Puno, Perú. Ciclo 2026-I.

**Autor:** Yoel Nhelio Canaza Chagua  
**Docente:** Ing. Donia Alizandra Ruelas Acero
