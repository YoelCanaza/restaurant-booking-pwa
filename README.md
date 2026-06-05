# 🥘 Rincón Andino PWA — Rediseño Gastronómico con Enfoque HCI

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blueviolet.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Rincón Andino** es una Progressive Web App (PWA) diseñada para modernizar la experiencia gastronómica en la región de Puno, Perú. Este proyecto se centra en la aplicación de principios avanzados de **Interacción Humano-Computador (HCI)** y las **10 Heurísticas de Nielsen** para ofrecer una interfaz intuitiva, eficiente y visualmente impactante, abarcando no solo la experiencia del comensal, sino toda la operación interna del restaurante.

---

## 🚀 Características Principales

El sistema aborda las necesidades de **6 roles** distintos, cada uno con una interfaz adaptada a su contexto de uso (Mobile-first, Desktop-first o KDS-first):

### 👤 Rol: Cliente (Comensal)
- **Menú Digital Interactivo**: Exploración de platos con imágenes, categorización fluida y gestión de expectativas (tiempo de preparación).
- **Reserva Visual de Mesas**: Selección interactiva de mesas mediante un plano SVG en tiempo real.
- **Order Tracker (Domino's Style)**: Seguimiento en vivo del estado del pedido delivery (Nuevo → Preparando → En Camino → Entregado) con ETA dinámico.
- **Flujo de Invitado**: Capacidad de realizar pedidos sin registrarse obligatoriamente, con incentivo de puntos de fidelidad para usuarios con cuenta.

### 🏔️ Rol: Administrador (Gestión)
- **Dashboard de KPIs**: Visualización en tiempo real de ingresos, pedidos activos, reservas y ocupación de mesas.
- **Plano de Planta Dinámico**: Control total sobre el estado físico de las mesas (`libre`, `ocupada`, `reservada`).
- **Gestión de Menú**: Actualización instantánea de precios, disponibilidad de platos y adición de nuevos elementos.

### 🍽️ Rol: Mesero (Salón)
- **Dashboard Móvil**: Visualización rápida del plano de mesas para conocer el estado y disponibilidad de su zona.
- **Toma de Comandas Ágil**: Selección de platos directamente en la mesa con soporte para notas o requerimientos especiales (ej. "sin picante").
- **Flujo de Servicio Integrado**: Solicitar cuenta al cajero (`pagando`) y marcar platos de cocina como servidos al cliente.

### 👨‍🍳 Rol: Cocina (KDS - Kitchen Display System)
- **Kanban Optimizado (Drag & Drop)**: Vista de tarjetas de pedidos ordenadas de manera FIFO.
- **Control de Estados Rápidos**: Interfaz pensada para avanzar pedidos (`nuevo` → `preparando` → `listo`) adaptada para pantallas táctiles de gran tamaño y uso con manos ocupadas.

### 💰 Rol: Cajero (POS)
- **Punto de Venta Centralizado**: Cola automática de mesas y pedidos en estado de cobro.
- **Cálculo Automático**: Desglose de consumos, selección de métodos de pago (Efectivo/Yape/Plin/Tarjeta), cálculo de vueltos y liberación de la mesa al confirmar.

### 🛵 Rol: Repartidor (Delivery)
- **Panel de Entregas**: Gestión de pedidos asignados y visualización de totales a cobrar en pagos contra entrega.
- **Navegación Delegada**: Integración directa con Google Maps para cálculo de rutas eficientes.
- **Swipe-to-Confirm**: Interacción tipo deslizamiento para marcar entregas, previniendo toques accidentales mientras se conduce (Ley de Fitts).

---

## 🧠 Estrategia de Diseño UI/UX (HCI)

El proyecto implementa rigurosamente principios avanzados de experiencia de usuario:
- **Heurísticas de Nielsen**: 
  - *Visibilidad del estado del sistema (H1)* mediante trackers y actualización en tiempo real de mesas/pedidos.
  - *Prevención de errores (H5)* con interacciones como "Swipe-to-confirm" o confirmaciones críticas antes de cancelar.
  - *Consistencia y Estándares (H4)* usando el mismo design system para 6 layouts diferentes.
- **Leyes de Miller y Fitts**: Agrupación inteligente de elementos para bajar la carga cognitiva, áreas táctiles amplias (≥ 44px) y navegación inferior (Navegación de Pulgar) para móviles.
- **Sistema "Rústico Moderno"**: Paleta de colores cálida inspirada en la cultura andina/puneña (Terracotta, Bone, Carbon, Amber), enriquecida con sombras suaves, componentes Glassmorphism y tipografías nítidas (Inter).
- **Tres Layouts Contextuales**: Se definen `MobileLayout` para uso en calle y mesas, `DesktopLayout` para las labores de caja/admin, y `KdsLayout` en modo oscuro para los cocineros.

*Para un análisis más profundo, consulta nuestra [Estrategia UI/UX](UX_UI_DESIGN.md), [Lógica de Negocio](BUSINESS_LOGIC.md) y [Arquitectura](ARCHITECTURE.md).*

---

## 🛠️ Stack Tecnológico

- **Frontend**: [React 19](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Estado Global**: [Zustand 5](https://github.com/pmndrs/zustand) + [Immer](https://immerjs.github.io/immer/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Interacciones Avanzadas**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) para KDS
- **PWA**: Configuración de manifest y offline features usando `vite-plugin-pwa`

---

## 📦 Instalación y Uso

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/TuUsuario/rediseño-rincon-andino.git
   cd rediseño-rincon-andino
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Construir para producción**
   ```bash
   npm run build
   ```

---

## 📂 Estructura del Proyecto

```text
src/
├── components/     # Componentes UI reutilizables y layouts específicos (mobile, desktop, kds)
├── hooks/          # Hooks personalizados de UI y estados de formulario
├── pages/          # Vistas principales y dashboards para los 6 roles
├── store/          # Gestión de estado global con Zustand y simulación de persistencia de datos
├── types/          # Tipados de TypeScript (entidades relacionales, eventos, etc.)
└── routes/         # Configuración de rutas protegidas y públicas
```

---

## 👤 Autor

**Yoel Canaza** - *Estudiante de Ingeniería de Sistemas - UNAP*

---
© 2026 Rincón Andino - Innovación Gastronómica desde Puno.
