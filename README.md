# 🥘 Rincón Andino PWA — Rediseño Gastronómico con Enfoque HCI

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blueviolet.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Rincón Andino** es una Progressive Web App (PWA) diseñada para modernizar la experiencia gastronómica en la región de Puno, Perú. Este proyecto se centra en la aplicación de principios avanzados de **Interacción Humano-Computador (HCI)** y las **10 Heurísticas de Nielsen** para ofrecer una interfaz intuitiva, eficiente y visualmente impactante.

---

## 🚀 Características Principales

### 👤 Rol: Cliente (Comensal)
- **Menú Digital Interactivo**: Exploración de platos con imágenes de alta calidad y categorización fluida.
- **Reserva Visual de Mesas**: Selección de mesas en tiempo real mediante un plano SVG interactivo (`FloorPlanSVG`).
- **Order Tracker (Domino's Style)**: Seguimiento en tiempo real del estado del pedido (Recibido → Preparando → En Camino → Entregado) con micro-animaciones.
- **Gestión de Carrito**: Flujo de compra optimizado con validación de datos de pago.

### 🏔️ Rol: Administrador (Gestión)
- **Dashboard de KPIs**: Visualización de ingresos, pedidos activos y ocupación de mesas.
- **Plano de Planta Dinámico**: Control total de la disponibilidad de mesas por fecha y hora.
- **Gestión de Menú**: Actualización instantánea de precios y disponibilidad de platos.

### 🛵 Rol: Repartidor (Delivery)
- **Panel de Entregas**: Gestión de pedidos asignados con estados simplificados.
- **Navegación Externa**: Integración directa con Google Maps para rutas eficientes.
- **Swipe-to-Confirm**: Interacción de deslizamiento para confirmar entregas, optimizada para uso en movimiento y prevención de errores (Ley de Fitts).

---

## 🧠 Estrategia de Diseño UI/UX (HCI)

El proyecto implementa rigurosamente los siguientes principios:
- **Heurísticas de Nielsen**: Enfoque especial en *Visibilidad del estado del sistema (H1)*, *Prevención de errores (H5)* y *Estética y diseño minimalista (H8)*.
- **Ley de Miller**: Agrupación de elementos para reducir la carga cognitiva.
- **Navegación de Pulgar**: Diseño adaptado a la anatomía de la mano para uso móvil con una sola mano.
- **Diseño Rústico Moderno**: Una paleta de colores inspirada en la cultura puneña (Terracotta, Bone, Carbon) con toques de Glassmorphism.

*Para un análisis detallado, consulta nuestro [Documento de Estrategia UI/UX](UX_UI_DESIGN.md).*

---

## 🛠️ Stack Tecnológico

- **Frontend**: [React 19](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Estado**: [Zustand](https://github.com/pmndrs/zustand) + [Immer](https://immerjs.github.io/immer/)
- **Iconos**: [Lucide React](https://lucide.dev/)

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
├── components/     # Componentes UI reutilizables (ui, layout, delivery, cliente)
├── hooks/          # Hooks personalizados (auth, UI states)
├── pages/          # Vistas principales por rol (cliente, admin, delivery)
├── store/          # Estado global con Zustand
├── types/          # Definiciones de TypeScript
└── routes/         # Configuración de navegación con React Router
```

---

## 👤 Autor

**Yoel Canaza** - *Estudiante de Ingeniería de Sistemas - UNAP*

---
© 2026 Rincón Andino - Innovación Gastronómica desde Puno.
