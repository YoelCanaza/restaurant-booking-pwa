# Rincón Andino PWA — Estrategia de Diseño UI/UX y Heurísticas HCI

Este documento detalla los principios de Interacción Humano-Computador (HCI), las heurísticas de Nielsen y los patrones de diseño aplicados en el rediseño de la aplicación **Rincón Andino**.

---

## 🎨 Sistema de Diseño: "Rústico Moderno"

La estética combina la calidez de la tradición puneña con la limpieza de las interfaces modernas (Glassmorphism y Dark Mode suave).

- **Paleta de Colores**:
  - `Terracotta (#E05936)`: Energía y gastronomía (Color de acento principal).
  - `Bone (#F9F6F0)`: Calma y limpieza (Fondo base).
  - `Carbon (#2D2A26)`: Elegancia y legibilidad (Texto y Admin).
  - `Amber (#D4A853)`: Tradición y estados de advertencia (Delivery).
- **Tipografía**: `Inter` (Sans-serif) para máxima legibilidad en dispositivos móviles.
- **Ley de Fitts**: Todos los elementos interactivos tienen un área táctil mínima de **44px** y los botones principales se ubican en la zona de fácil alcance del pulgar.

---

## 📱 Flujo 1: Cliente (Comensal)
*Objetivo: Facilitar la reserva y el pedido con la menor carga cognitiva posible.*

### Características UI/UX:
- **Reserva Visual de Mesas**: Uso de un mapa SVG interactivo del restaurante.
- **Tracker de Pedidos (Domino's Style)**: Barra de progreso con hitos (`Recibido`, `Preparando`, `En Camino`, `Entregado`) y micro-animación de una motocicleta.
- **Gestión de Expectativas (ETA)**: Visualización prominente del rango de tiempo estimado de llegada para reducir la incertidumbre.
- **Micro-interacciones**: Feedback inmediato al añadir productos al carrito (Haptic feel).
- **Esqueletos de Carga**: `SkeletonCard` para reducir la percepción del tiempo de espera.

### Heurísticas Aplicadas:
1. **Consistencia y Estándares (H4)**: El flujo de reserva sigue el estándar de "pasos" (StepIndicator), permitiendo al usuario saber en qué etapa se encuentra.
2. **Reconocimiento antes que Recuerdo (H6)**: Los platos se presentan con imágenes claras y etiquetas de precio grandes, evitando que el usuario deba recordar los detalles de la carta.
3. **Estética y Diseño Minimalista (H8)**: Uso de espacios en blanco y jerarquía visual clara para destacar lo más importante: el botón de acción principal.
4. **Relación entre el Sistema y el Mundo Real (H2)**: El mapa de mesas (`FloorPlanSVG`) refleja la disposición física real del local, facilitando la orientación.
5. **Visibilidad del Estado del Sistema (H1)**: El `OrderTracker` permite al usuario saber exactamente en qué fase se encuentra su comida sin necesidad de mapas complejos.

---

## 🏔️ Flujo 2: Administrador (Gestión)
*Objetivo: Visibilidad total del negocio y control eficiente de operaciones.*

### Características UI/UX:
- **Dashboard de KPIs**: Tarjetas visuales con ingresos, pedidos activos y ocupación.
- **Gestión de Estados**: Cambio rápido de estado de reservas y mesas mediante gestos simples.
- **Notificaciones Toast**: Confirmación visual no intrusiva de acciones realizadas.

### Heurísticas Aplicadas:
1. **Visibilidad del Estado del Sistema (H1)**: El dashboard muestra en tiempo real cuántas mesas están ocupadas y cuántos pedidos están pendientes.
2. **Prevención de Errores (H5)**: Acciones críticas (como cancelar una reserva) se presentan con confirmaciones claras para evitar clics accidentales.
3. **Flexibilidad y Eficiencia de Uso (H7)**: Los accesos directos en el dashboard permiten al administrador saltar directamente a la gestión de mesas o menú sin navegar por todo el árbol.
4. **Control y Libertad del Usuario (H3)**: Capacidad de cambiar el estado de cualquier mesa o plato en cualquier momento de forma reversible.

---

## 🛵 Flujo 3: Repartidor (Delivery)
*Objetivo: Operación manos libres y actualización rápida en movimiento.*

### Características UI/UX:
- **Swipe-to-Confirm**: Interacción tipo "Deslizar para confirmar" que evita errores de toque accidental mientras se conduce.
- **Navegación Delegada**: Botón prominente de **"Abrir en Google Maps"** para aprovechar herramientas de navegación profesional y optimizar la batería del dispositivo.
- **Modo de Alto Contraste**: Colores vibrantes para legibilidad en exteriores bajo la luz del sol.

### Heurísticas Aplicadas:
1. **Prevención de Errores (H5)**: El componente `SwipeToConfirm` requiere una acción deliberada (deslizar) en lugar de un simple toque, lo que previene actualizaciones de estado erróneas.
2. **Visibilidad del Estado del Sistema (H1)**: Uso de `Chip` animados (pulse) para indicar cuándo un pedido está "En Camino", manteniendo al repartidor informado.
3. **Ayuda a los Usuarios a Reconocer y Diagnosticar Errores (H9)**: Si no hay pedidos asignados, se muestra un mensaje claro de "No tienes pedidos" con un estado vacío ilustrado.
4. **Diseño para la Movilidad (Ley de Fitts)**: Botones de navegación y confirmación sobredimensionados para ser operados con una sola mano o guantes.
5. **Flexibilidad y Eficiencia de Uso (H7)**: La integración con apps de mapas externas permite al repartidor usar su herramienta preferida sin fricción.

---

## 🛠️ Principios HCI Transversales

- **Ley de Miller**: Las listas de platos y categorías se agrupan en bloques de máximo 7 elementos para no saturar la memoria a corto plazo del usuario.
- **Jerarquía Visual (Gestalt)**: Uso de tarjetas (`Card`) con sombras sutiles para agrupar información relacionada y separar capas de contenido.
- **Navegación de Pulgar**: El `BottomNav` centraliza todas las funciones críticas en la parte inferior de la pantalla, respetando la anatomía de la mano al usar el smartphone.
