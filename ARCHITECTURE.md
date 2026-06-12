# 🏗️ Rincón Andino — Arquitectura Técnica

> Documento de referencia para la evolución del proyecto: del **mock actual** (demo de interfaz) a un **backend real, sólido y desplegado**. Complementa a [BUSINESS_LOGIC.md](BUSINESS_LOGIC.md) (qué hace la app) explicando **cómo** se construye y despliega.

---

## 1. Estado actual vs. objetivo

| Aspecto | Hoy (demo / mock) | Objetivo (producción) |
|---------|-------------------|------------------------|
| Datos | Constantes `MOCK_*` en memoria + `localStorage` (Zustand `persist`) | Backend real con base de datos persistente |
| Auth | `switchRole()` sin contraseña | Autenticación real (teléfono + contraseña), sesiones seguras |
| Tiempo real | No (estado local) | Suscripciones en vivo (KDS, tracker de pedidos, estado de mesas) |
| Multi-dispositivo | Cada navegador tiene su propio estado | Estado compartido entre dispositivos del restaurante |
| Despliegue | Frontend en Vercel | Frontend en Vercel + backend gestionado |

**Estrategia de migración:** mantener la **capa de stores** (`useAppStore`, `useAuthStore`) como fachada. Hoy sus acciones mutan estado local; mañana llamarán a la API/SDK del backend. Los componentes no deberían notar el cambio si respetamos los contratos actuales (`OperationResult`, selectores). Ver §6.

---

## 2. Frontend — evaluación del stack

**Veredicto: el stack actual es moderno y adecuado.** No hay que cambiarlo, solo completarlo.

| Tecnología | Veredicto | Nota |
|------------|-----------|------|
| React 19 + TypeScript | ✅ Excelente | Estándar actual. |
| Vite 8 | ✅ Excelente | Build rápido, ideal con Vercel. |
| Zustand 5 (`persist` + `immer`) | ✅ Bien (estado de cliente) | Mantener para sesión, carrito y UI. Ver matiz abajo. |
| React Router 7 | ✅ Bien | Suficiente para el ruteo por rol. |
| Tailwind CSS 4 | ✅ Bien, pero infrautilizado | Hoy conviven Tailwind y **estilos inline** (ej. `POSView`). Unificar (§5.4). |
| framer-motion | ✅ Bien | Animaciones; usar con mesura por rendimiento. |
| lucide-react | ✅ Bien | Iconos consistentes. |
| @hello-pangea/dnd | ✅ OK | Drag & drop (reordenar cola de cocina). |
| vite-plugin-pwa | ✅ Clave | Habilita offline para delivery (requisito §10.4 de negocio). |

### 2.1 Recomendación importante: separar "estado de servidor" de "estado de cliente"

Cuando exista backend real, **no metas los datos del servidor en Zustand**. Adopta:

- **TanStack Query (React Query)** → datos que viven en el backend: platos, mesas, reservas, pedidos, usuarios. Da caché, revalidación, estados `loading/error`, reintentos y sincronización automática.
- **Zustand** → estado puramente de cliente: sesión/token, carrito en construcción, filtros de UI, preferencias.

Esto evita el clásico problema de "datos del servidor desincronizados en un store global" y encaja con el patrón realtime (§4).

---

## 3. Backend — recomendación

Para una app de restaurante con **necesidad fuerte de tiempo real** (cocina, tracker, estado de mesas), relaciones claras entre entidades (usuarios, mesas, pedidos, reservas) y un equipo pequeño/académico, la recomendación es:

### 🥇 Opción recomendada: **Supabase**

Postgres gestionado + Auth + Realtime + Storage + APIs autogeneradas. Por qué encaja casi perfecto aquí:

- **Postgres (relacional):** el dominio es naturalmente relacional (FK `pedido → mesa`, `reserva → usuario`). Mapea 1:1 con los tipos de [src/types/index.ts](src/types/index.ts).
- **Supabase Auth:** soporta login por teléfono/contraseña — justo el modelo de negocio (teléfono como identificador, §3 de negocio).
- **Realtime:** suscripciones a cambios de tabla → la cola de cocina y el `OrderTracker` se actualizan solos, sin polling. Es el "killer feature" para esta app.
- **Row Level Security (RLS):** las políticas por rol reemplazan/complementan los guards de ruta del frontend, asegurando los permisos en el servidor (un cliente no puede leer pedidos de otro).
- **Storage:** imágenes de platos (hoy `placehold.co`).
- **Plan gratuito** suficiente para un proyecto académico y demo desplegada.

### 🥈 Alternativa: backend propio (Node + Postgres)

**NestJS** (o Express/Fastify) + Postgres (Prisma/Drizzle como ORM) + WebSockets (Socket.IO) para realtime.

- ✅ Control total, buen ejercicio académico de arquitectura backend.
- ❌ Más trabajo: auth, realtime, validaciones y despliegue los construyes tú.
- Recomendado solo si el objetivo del curso es **demostrar diseño de backend**; si el objetivo es la **experiencia/PWA**, Supabase rinde más por hora invertida.

### 🥉 Otra opción: **Firebase**

Realtime sólido y auth fácil, pero base NoSQL (Firestore) que encaja peor con un dominio tan relacional. Solo si ya tienes experiencia con Firebase.

> **Recomendación final:** **Supabase** como backend + **Vercel** para el frontend. Te da el 90% de lo que necesitas (DB, auth, realtime, storage) sin desplegar servidores propios.

---

## 4. Despliegue recomendado

```
┌─────────────────────┐      HTTPS/WSS      ┌──────────────────────────┐
│   Frontend (PWA)    │ ─────────────────▶  │  Supabase (gestionado)   │
│   React + Vite      │   @supabase/        │  · Postgres              │
│   ▶ Vercel          │   supabase-js       │  · Auth                  │
│   (ya desplegado)   │ ◀───────────────── │  · Realtime (WS)         │
└─────────────────────┘    suscripciones    │  · Storage (imágenes)    │
                                             └──────────────────────────┘
```

### 4.1 Frontend → **mantener Vercel**
Es la mejor opción para Vite/React/PWA: build automático por push, preview deployments por PR, CDN global, HTTPS, headers para PWA. **No cambiar.**

- Variables de entorno en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (la `anon key` es pública por diseño; la seguridad real la dan las políticas RLS).
- Asegurar que `vite-plugin-pwa` genere el service worker en producción y que el manifest tenga iconos/`theme_color`.

### 4.2 Backend → **Supabase Cloud (sin servidor propio)**
- Proyecto gestionado: no hay que "desplegar" en el sentido tradicional; se administra por dashboard + migraciones SQL versionadas en el repo (`/supabase/migrations`).
- Región: la más cercana a Perú (ej. `us-east`) para baja latencia.

### 4.3 Alternativa si usas backend Node propio
- **Backend:** Railway, Render o Fly.io (despliegue por Docker/Git, plan gratuito/bajo costo).
- **Base de datos:** Neon o Supabase Postgres (Postgres serverless gestionado).
- **Frontend:** sigue en Vercel, apuntando a la URL del backend.

### 4.4 CI/CD
- Vercel ya da CD del frontend. Añadir un workflow de **GitHub Actions** que corra `tsc -b` + `eslint` en cada PR para impedir merges que rompan el build (ver §7 — hoy el build no pasa por errores de tipo).

---

## 5. UX/UI — principios rectores (requisito crítico del proyecto)

La app sirve a **6 roles en 3 contextos de uso muy distintos**. El principio macro es: **una UI por contexto, no una talla única.** Esto ya está bien encaminado con los tres layouts (`MobileLayout`, `DesktopLayout`, `KdsLayout`).

### 5.1 Responsive: ¿desktop y móvil?
No se trata de "dos versiones de la web", sino de **layouts apropiados por rol**, cada uno responsive dentro de su rango:

| Rol | Dispositivo principal | Estrategia |
|-----|----------------------|------------|
| Cliente, Mesero, Repartidor | Celular | **Mobile-first**. Targets táctiles ≥ 44px, navegación inferior (`BottomNav`), una columna. |
| Admin, Cajero | Escritorio / tablet | **Desktop-first** con `SidebarNav`. Debe degradar bien a tablet (el dueño puede usar iPad). |
| Cocina | Pantalla grande fija (KDS) | Layout dedicado, alto contraste, tipografía y botones **grandes** (se usa con las manos ocupadas/sucias). |

Regla práctica: **mobile-first en CSS** (estilos base para móvil, `@media (min-width)` para ampliar). Cada pantalla debe verse correcta de 360px a 1440px.

### 5.2 Heurísticas de Nielsen aplicadas a este sistema

1. **Visibilidad del estado del sistema** → estados de pedido/mesa siempre visibles; `OrderTracker` en vivo; badges de "pedidos nuevos" en cocina/admin. Realtime hace esto natural.
2. **Correspondencia con el mundo real** → lenguaje del dominio ("comanda", "pedir cuenta", "en camino"), no jerga técnica. Plano de mesas que imita el salón real.
3. **Control y libertad del usuario** → cancelar pedido/reserva (dentro de las reglas), cerrar modales, deshacer selección en POS.
4. **Consistencia y estándares** → mismos componentes (`Button`, `Card`, `Chip`, `Switch`) y tokens en toda la app. Iconografía `lucide` uniforme.
5. **Prevención de errores** → confirmación en acciones destructivas (cancelar, no-show, eliminar plato); validación de monto recibido ≥ total en caja; deshabilitar "agregar" en platos agotados.
6. **Reconocer mejor que recordar** → datos de contacto pre-llenados en reservas; carrito siempre visible; resúmenes antes de confirmar.
7. **Flexibilidad y eficiencia** → atajos para el mesero (tomar comanda rápido); cola FIFO en cocina con reordenamiento manual (drag & drop).
8. **Diseño estético y minimalista** → jerarquía visual clara; en KDS, solo lo esencial (mesa, ítems, tiempo).
9. **Ayuda a reconocer y recuperarse de errores** → mensajes claros vía `useToastStore` (el patrón `OperationResult.error` ya alimenta esto); explicar *por qué* falló (ej. "Solo puedes cancelar hasta 2h antes").
10. **Ayuda y documentación** → estados vacíos con guía ("No hay cobros pendientes 🎉"), tooltips en acciones poco frecuentes del admin.

### 5.3 Estados obligatorios por pantalla
Toda vista que lee datos debe manejar **4 estados**: *cargando* (usar `SkeletonCard`), *vacío* (mensaje guía), *error* (con reintento) y *con datos*. Hoy el mock salta directo a "con datos"; al integrar backend hay que cubrir los otros tres.

### 5.4 Deuda de diseño a resolver
- **Unificar el sistema de estilos.** Hoy hay estilos **inline** extensos (ej. todo `POSView.tsx`) conviviendo con Tailwind. Decidir uno:
  - **Recomendado:** Tailwind + **design tokens** (los colores ya existen como variables CSS: `--color-terracotta`, `--color-carbon`, `--color-bone`, `--color-border`). Formalizarlos en `tailwind.config`/`@theme` y migrar los inline a clases. Mejora consistencia, dark mode futuro y mantenibilidad.
- **Accesibilidad:** asegurar contraste AA, estados de `:focus` visibles, navegación por teclado y `aria-label` en botones de solo icono. Usar elementos semánticos (`<button>`, no `<div onClick>`).
- **Tokens de motion:** definir duraciones/curvas estándar para que las animaciones de `framer-motion` sean coherentes.

### 5.5 PWA como experiencia
- **Instalable** (manifest + iconos) → el restaurante "instala" la app en sus tablets.
- **Offline para delivery** (requisito de negocio §10.4): cachear el último estado de los pedidos asignados; encolar el "Entregado" si no hay red y sincronizar al reconectar.
- **Notificaciones push** (roadmap de negocio §8): confirmación de reserva, pedido listo, etc.

---

## 6. Plan de migración mock → backend (sin reescribir la UI)

> **Estado (11-jun-2026): pasos 1–3, 6 y 7 COMPLETADOS y en producción.** La app desplegada en Vercel corre contra Supabase con realtime multi-dispositivo.

1. ✅ **Esquema en Postgres** — [supabase/schema.sql](supabase/schema.sql): 7 tablas desde `src/types`, RLS (políticas demo), realtime, seed. Idempotente (re-ejecutar = reset de la demo).
2. ✅ **Cliente** — [src/lib/supabase.ts](src/lib/supabase.ts), credenciales por env vars (`.env` local / dashboard de Vercel).
3. ✅ **Acciones de los stores cableadas** — patrón *write-through*: mutación local síncrona (firma `OperationResult` intacta, cero cambios en componentes) + push a Supabase por la **cola serializada** de [src/lib/db.ts](src/lib/db.ts) (orden de FKs garantizado). Errores → toast + re-hidratación automática.
   - **Lecturas**: hidratación completa al montar + **realtime** ([src/lib/sync.ts](src/lib/sync.ts), canal único sobre pedidos/items/mesas/reservas/platos/usuarios) que hace upsert al store. El store Zustand actúa como caché de cliente.
4. ⏸️ **TanStack Query** — pospuesto: el patrón actual (store hidratado + realtime) cubre las necesidades de la app; TanStack aportaría caching fino/refetch que hoy no hacen falta. Reevaluar si crecen las vistas de datos.
5. 🔜 **Auth real** (siguiente fase): Supabase Auth — Google para clientes, teléfono+contraseña para personal (hash real; hoy texto plano en la tabla `usuarios`, solo demo), endurecer RLS por rol con `auth.uid()`.
6. ✅ **Activity log** en tabla `activity_logs` (los eventos de `EVENTOS_PERSISTENTES` se escriben a DB; el resto queda en memoria).
7. ✅ **CI** — GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)): tsc + eslint + build en cada push/PR a main.

---

## 7. Salud del repo (hallazgos actuales)

> **Estado (11-jun-2026):** `tsc -b`, `npm run build` y `eslint .` pasan **en verde, lint en cero**. Listo para activar CI y arrancar la migración a Supabase (§6).

**Corregido en esta iteración (el repo ya compila y construye):**
- Tipo de `logActivity` (resolvía a `never` y rompía ~10 llamadas) → ahora `actorRole: UserRole`.
- Cola de cobro del cajero unificada (Opción A, ver BUSINESS_LOGIC §4.5).
- `CartDrawer.tsx`: `addPedido` → `addPedidoDelivery` con forma de objeto correcta + manejo de `OperationResult`.
- `OrderCard.tsx`, `AdminDashboard.tsx`, `MenuManagerPage.tsx`, `ReservationFlow.tsx`: añadidos `actorId`/`actorRole` a las llamadas del store.
- `MyReservationsPage.tsx`: la cancelación del cliente ahora usa `cancelarReservaCliente` (aplica la regla de 2h) con feedback por toast.
- `Navbar.tsx`: `Record<UserRole, string>` completado.
- `FloorPlanSVG.tsx`: mapa de colores cubre los 7 estados de mesa, tipado `Record<EstadoMesa | 'deshabilitada', string>`.
- `WaiterDashboard.tsx`: eliminada comparación inválida de `pedido.estado` con `'comiendo'` (estado de mesa).
- `KdsLayout.tsx`: import `motion` sin uso eliminado; params sin uso del store removidos.

**Saneado (11-jun-2026) — lint 21→0:**
- `no-explicit-any` eliminado: `OrderCard` (`Pedido`/`EstadoPedido`), `SwipeToConfirm` (`PanInfo`), `MenuManagerPage` (`CategoriaPlato`), `MyOrdersPage` (`OrderTrackerState`).
- `react-hooks/purity`: `POSView` usa reloj en `useState` + intervalo de 60 s; `MenuGrid` resetea su skeleton en render (patrón oficial), no en effect.
- `react-refresh/only-export-components`: `CATEGORIAS` movido a `src/lib/categorias.ts`; `LAYOUT` de `FloorPlanSVG` ya no se exporta.
- `dev-dist/` (artefacto del PWA en dev) ignorado en `eslint.config.js`.
- **Siguiente paso:** activar CI (GitHub Actions) con `tsc` + `eslint` — ya no hay bloqueadores.

---

*Creado el 29 de mayo de 2026 — referencia de arquitectura para Rincón Andino (UNAP, Ingeniería de Sistemas).*
</content>
</invoke>
