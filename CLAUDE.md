# CLAUDE.md — Rincón Andino PWA

Guía para trabajar en este repo. Documentos de referencia:
- **[BUSINESS_LOGIC.md](BUSINESS_LOGIC.md)** — reglas de negocio, flujos, catálogo de botones/acciones (fuente de verdad funcional).
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — stack, backend, despliegue, principios UX/UI y plan de migración mock → backend real.

**Dirección técnica decidida:** backend objetivo **Supabase** (Postgres + Auth + Realtime + Storage), frontend en **Vercel**. Estado de servidor con **TanStack Query**, estado de cliente con Zustand. Ver ARCHITECTURE.md §3–§4.

## Qué es
PWA de restaurante de gastronomía puneña (Puno, Perú). 6 roles: cliente, admin, mesero, cocina, caja (cajero), delivery. Proyecto académico (UNAP, Interacción Humano-Computador).

## Stack
- **React 19** + **TypeScript** + **Vite 8**
- **Zustand 5** (`persist` + `immer`) para estado global
- **React Router 7** para rutas
- **Tailwind CSS 4** (vía `@tailwindcss/vite`)
- **framer-motion** (animaciones), **lucide-react** (iconos), **@hello-pangea/dnd** (drag&drop)
- **vite-plugin-pwa** para capacidades PWA
- **json-server** como backend mock (`db.json`, puerto 3001) — aún no cableado al frontend

## Comandos
```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # eslint
npm run preview   # previsualizar build
npm run server    # json-server --watch db.json --port 3001
```

## Arquitectura de estado
- **`src/store/useAuthStore.ts`** — sesión y usuarios. Persiste en `localStorage` key `rincon-andino-auth`.
- **`src/store/useAppStore.ts`** — dominio (platos, mesas, reservas, pedidos, activityLogs, carrito). Persiste en key `rincon-andino-app` con `partialize` (solo datos de dominio + logs marcados `persistido`).
- **`src/store/useToastStore.ts`** — notificaciones/toasts.
- **`src/types/index.ts`** — todos los tipos del dominio. **Es la referencia canónica de literales** (ver convenciones abajo).

Hoy los datos son **mock en memoria** (constantes `MOCK_*` en los stores). No hay fetch real a `db.json` todavía.

## Convenciones clave (NO romper)
- **El literal del rol cajero es `'caja'`**, no `'cajero'`. Ruta `/caja`. Etiqueta visible "Cajero".
- **`UserRole`** = `'cliente' | 'admin' | 'mesero' | 'cocina' | 'caja' | 'delivery'`.
- **Acciones que pueden fallar devuelven `OperationResult` = `{ ok: boolean; error?: string }`**. El llamador muestra `error` vía `useToastStore` cuando `!ok`. No lanzar excepciones para errores de validación de negocio.
- **Todo cambio de estado relevante llama a `logActivity(...)`**. Si el `TipoEvento` está en `EVENTOS_PERSISTENTES`, se guarda en `localStorage`; si no, queda solo en memoria.
- **Mutaciones con immer**: dentro de `set((state) => { ... })` se muta directamente (no spread).
- **IDs** se generan con `generateId(prefix)` → `prefix_timestamp_random`.
- **Sincronización mesa ↔ pedido de salón** vive en las acciones del store (`crearComandaSalon`, `updatePedidoEstado`, `solicitarCuenta`, `procesarPago`). Ver tabla en BUSINESS_LOGIC §9.3.
- **Layouts por rol**: `MobileLayout` (cliente/mesero/delivery, `BottomNav`), `DesktopLayout` (admin/caja, `SidebarNav`), `KdsLayout` (cocina). Rutas protegidas con `ProtectedRoute requiredRole`.
- **`switchRole(role)`** es login de desarrollo sin contraseña (RoleSelectorPage). El login/registro real (`login`, `registrarCliente`) está parcialmente cableado.

## Sistema de diseño ("Andino elevado")
- **Tokens** en `@theme` de [src/index.css](src/index.css): colores (terracota/carbón/hueso/ámbar + semánticos), `--font-sans` (Inter), `--font-display` (Fraunces), escala de sombras `--shadow-sm/md/lg/xl`, radios. Usar tokens vía clases Tailwind, **no** hex sueltos ni estilos inline nuevos.
- **Fuentes** self-hosted (`@fontsource-variable/inter` y `/fraunces`) importadas en [src/main.tsx](src/main.tsx). Títulos: clase `.font-display` (Fraunces). Body: Inter por defecto.
- **Estados → color/etiqueta**: fuente única en [src/lib/estados.ts](src/lib/estados.ts) (`visualPedido`/`visualMesa`/`visualReserva` → `{label,color,bg}`). No volver a duplicar diccionarios de color por pantalla.
- **Primitivos UI** en [src/components/ui/](src/components/ui/): `Button`, `Card`, `Chip`, `Switch`, `Modal`, `Input`, `StatusPill`, `EmptyState`, `PageHeader`, `StatCard`, `SkeletonCard`, `StepIndicator`, `SwipeToConfirm`, `Toast`. Preferir estos antes de escribir markup/estilos a mano. Modales → `Modal`; estado → `StatusPill`; vacíos → `EmptyState`; encabezados → `PageHeader`.
- **Feedback**: usar `useToastStore` (toast global), no toasts locales por pantalla.
- **Features sin backend** se muestran como **demo**: toast "… (demo)" o badge "Demo", nunca `alert()` ni links rotos.
- **Animación**: sutil y profesional (microinteracciones framer-motion); respeta `prefers-reduced-motion` (ya en index.css).

## Idioma
- Código de dominio y comentarios en **español** (nombres de tipos, acciones, estados). Mantener ese estilo.
- Responder al usuario en español.

## Decisiones tomadas
- **Cola del cajero (Opción A):** `getPedidosPendientesCobro()` es la única fuente de verdad. Salón solo cuando `mesa.estado === 'pagando'` (mesero pulsó "Pedir cuenta") + delivery efectivo entregado para reconciliación. POSView consume el selector directamente.

## Puntos abiertos / roadmap (ver BUSINESS_LOGIC para detalle)
- **El repo compila y construye** (`tsc -b` y `npm run build` en verde). Quedan ~24 errores de **lint** pre-existentes (tipos `any` y `Date.now()` en render / regla `react-hooks/purity`) que no bloquean el build — limpiar antes de activar CI con eslint.
- Pantallas de Admin faltantes: Reservas, Pedidos, Personal, Clientes, Reportes (las acciones del store ya existen).
- Login/registro real, notificaciones push PWA, y migración de mock a backend (Supabase) pendientes.

## Estado del repo
Rama `main`. Hay mucho trabajo sin commitear (nuevas páginas de mesero/cocina/cajero, layouts, db.json). Commitear/pushear solo cuando el usuario lo pida.
