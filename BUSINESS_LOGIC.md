# 🏔️ Rincón Andino PWA — Arquitectura de Lógica de Negocio

> **Documento vivo.** Este archivo define el propósito, los flujos, las reglas de negocio y la gestión de cuentas de la aplicación. Es la fuente de verdad para el comportamiento esperado del sistema.

---

## 1. Propósito del Sistema

**Rincón Andino** es una Progressive Web App (PWA) destinada a digitalizar y optimizar la operación completa de un restaurante de gastronomía puneña ubicado en Puno, Perú.

La aplicación busca:

- **Eliminar fricciones** en la experiencia del comensal: desde ver el menú hasta rastrear su pedido.
- **Centralizar las operaciones internas** del restaurante en un único sistema accesible desde cualquier dispositivo con navegador.
- **Reducir errores humanos** al digitalizar la toma de pedidos, la comunicación entre meseros y cocina, y la asignación de delivery.
- **Proveer inteligencia de negocio** al administrador mediante métricas de ventas, ocupación y preferencias de los clientes.

---

## 2. Actores del Sistema

El sistema reconoce **seis roles** diferenciados. Cada rol ve una interfaz distinta y tiene permisos exclusivos.

| Rol | Símbolo | Descripción |
|-----|---------|-------------|
| **Cliente** | 👤 | Comensal externo que accede a la app desde su propio dispositivo. |
| **Administrador** | 🏔️ | Dueño o gerente del restaurante. Control total del sistema. |
| **Mesero** | 🍽️ | Personal de sala. Toma pedidos en mesa y gestiona el servicio. |
| **Cocina** | 👨‍🍳 | Chef o personal de cocina. Ve y actualiza el estado de los platos en preparación. |
| **Cajero** | 💰 | Personal de caja. Gestiona cobros, cierra cuentas y emite comprobantes. |
| **Repartidor** | 🛵 | Delivery. Recibe pedidos asignados y actualiza el estado de entrega. |

> ⚙️ **Nota de implementación (literales de rol):** En el código el tipo `UserRole` usa los literales `'cliente' | 'admin' | 'mesero' | 'cocina' | 'caja' | 'delivery'`. El rol de Cajero se representa internamente como **`'caja'`** (no `'cajero'`). La etiqueta visible es "Cajero", pero cualquier referencia técnica (rutas, guards, `switchRole`) usa `caja`.

---

## 3. Gestión de Cuentas de Usuario

### 3.1 Clientes — Registro Público

Los clientes **crean su propia cuenta** desde la app sin intervención del administrador.

**Flujo de registro de cliente:**

```
[Pantalla de inicio]
    → "¿No tienes cuenta? Regístrate"
        → Nombre completo
        → Número de teléfono (usado como identificador único)
        → Contraseña
        → (Opcional) Correo electrónico
    → Validación de unicidad del teléfono
    → Cuenta creada → Login automático → Vista de Cliente
```

**Reglas:**
- El **teléfono** es el identificador principal (más accesible que el email en el contexto andino).
- No se requiere verificación por SMS en la versión actual (puede añadirse como mejora).
- Un cliente recién registrado tiene rol `cliente` asignado automáticamente.
- El cliente **no puede** cambiar su propio rol.

---

### 3.2 Personal del Restaurante — Cuentas Gestionadas por el Admin

Las cuentas de **meseros, cocineros, cajeros y repartidores** son creadas exclusivamente por el Administrador. Estos empleados **no se registran solos**.

**Flujo de creación de cuenta de empleado (Admin):**

```
[Dashboard Admin] → Panel "Gestión de Personal"
    → "Agregar empleado"
        → Nombre completo
        → Teléfono (identificador de login)
        → Rol: [mesero | cocina | cajero | delivery]
        → Contraseña temporal (el admin la asigna)
    → Empleado recibe credenciales y puede cambiar su contraseña en el primer login
```

**Reglas:**
- El Admin puede **activar / desactivar** cuentas de empleados sin eliminarlas (para conservar historial).
- El Admin puede **cambiar el rol** de un empleado en cualquier momento.
- El Admin puede **resetear la contraseña** de cualquier empleado.
- Un empleado desactivado **no puede iniciar sesión**.
- El Admin **no puede** eliminar su propia cuenta.

---

### 3.3 ¿Puede el Admin ver las cuentas de los clientes?

**Sí, con limitaciones deliberadas:**

| Dato visible para el Admin | Dato privado (solo el cliente) |
|----------------------------|-------------------------------|
| Nombre | Contraseña |
| Teléfono | — |
| Historial de reservas | — |
| Historial de pedidos | — |
| Nivel de actividad / frecuencia | — |
| Preferencias inferidas del menú | — |

El Admin puede buscar un cliente por nombre o teléfono y ver su perfil de actividad para gestionar ofertas, pero **no puede suplantar su sesión**.

---

### 3.4 Modelo de acceso, invitados y fidelidad (decisiones)

Decisiones de producto tomadas (mayo 2026), fundamentadas en principios de UX (caso *"$300M button"* de Spool y el anti-patrón *registration wall* de NN/g):

**A. Entrada: landing pública primero.** La app abre en una **landing pública** (vitrina: hero + especialidades + "Reservar"/"Pedir delivery"), navegable **sin cuenta**. No se pide login de entrada. El usuario logueado es redirigido a su panel según rol.

**B. Invitado primero, cuenta opcional (NO se obliga a registrarse).** El cliente puede **pedir y reservar como invitado**, ingresando solo los datos que la acción ya necesita (nombre, teléfono, [dirección]) — **sin cuenta, sin contraseña, sin muro**. Tras confirmar, se ofrece (opcional, descartable) **crear cuenta con Google** como *incentivo* ("guarda tu historial y junta puntos"), nunca como obstáculo. Se conserva el progreso (carrito/datos) si decide autenticarse (return path).
- **Compromisos del invitado:** sin cuenta no hay historial entre sesiones ni puntos; los límites (1 pedido activo, 2 reservas) y el no-show se controlan de forma más débil (por teléfono). Esto hace de la cuenta un beneficio deseable, no una obligación.
- **Seguridad (importante).** El "invitado" no es anónimo: al confirmar se crea/asocia una cuenta por teléfono (hay rastro y responsabilidad). Riesgos reales: **reserva** = bajo (gratis; mitigado por la política de no-show §6.4). **Delivery** = el clásico riesgo de **pedidos falsos** en pago contra entrega (preparar comida / mover repartidor sin que haya nadie). Mitigaciones actuales: 1 pedido activo por teléfono, sin pago anticipado, el admin puede cancelar. **Salvaguarda recomendada (backend):** **verificación de teléfono por OTP** antes del primer pedido de delivery (confirma que el número es real) — es lo que hacen las apps de delivery para frenar pedidos falsos. Hoy (mock) no hay verificación: es aceptable para demo, no para producción.

**C. Autenticación — dos modelos según audiencia:**
- **Clientes (externos): Google (un toque) o invitado.** Sin contraseña → no hay "contraseña perdida". Roadmap: teléfono + OTP para *phone-first* (no bloquea porque el invitado siempre opera). No se auto-registra contraseña.
- **Personal (mesero/cocina/caja/delivery): usuario (teléfono) + contraseña temporal que asigna el admin.** El admin crea la cuenta en `/admin/personal`, define/genera una contraseña temporal y se la entrega; el empleado la cambia en su primer ingreso (`debeCambiarPassword`). Es lo correcto para cuentas internas (el personal suele no usar Google; el admin controla el alta de punta a punta, como un POS). *Esto recupera el modelo del §3.2.*
- **Admin:** **sembrado** en la instalación inicial (seed/migración). No se auto-registra.
- Acceso de demostración por rol en `/demo` para sustentación.

**D. Recuperación de cuenta.** Clientes (Google): la gestiona Google, no hay contraseña que recuperar. Personal: si olvida su contraseña, **el admin la resetea** (§3.2) — no hay autoservicio de recuperación para cuentas internas.

**E. Reserva sin costo (recuerdo §6.5).** Reservar es gratis (invitado o con cuenta). La cuenta sirve para gestionar/seguir la reserva y aplicar no-show, nunca para cobrar.

**F. Fidelidad (puntos).** Regla: **1 punto por cada S/1** en pedidos **pagados/entregados**. Solo acumulan las **cuentas** (el invitado no junta puntos — incentivo a registrarse). El saldo se **calcula del historial** del cliente (no es un número fijo). El **canje** (descuentos) es roadmap (requiere backend). En el mock se muestra el saldo calculado de los pedidos reales del cliente, con el canje "próximamente".

**Mock ahora vs. backend:** el flujo *invitado + cuenta opcional*, la landing pública y los **puntos calculados** se implementan ya sobre el mock. **Google OAuth, la invitación por correo del personal, el seed del admin y la persistencia/canje de puntos** son del backend (Supabase). Mientras tanto, "Continuar con Google" se muestra como vía prevista y el acceso interino es por teléfono + `/demo`.

---

## 4. Flujos de Usuario Detallados

---

### 4.1 Flujo: Cliente

#### A. Explorar el Menú

```
Inicio de sesión como cliente
    → Vista: Menú Digital
        → Filtrar por categoría (Sopas, Segundos, Entradas, Postres, Bebidas)
        → Ver ficha del plato: foto, descripción, precio, tiempo de preparación
        → Solo se muestran platos con estado: disponible = true
```

#### B. Hacer un Pedido Delivery

```
[Menú] → Agregar al carrito
    → Ajustar cantidades
    → "Ir al carrito"
        → Revisar ítems y subtotal
        → Ingresar dirección de entrega
        → Método de pago: Efectivo al recibir / Yape / Plin
        → Confirmar pedido
    → [Sistema] → Pedido creado con estado: "nuevo"
    → [Cliente] → Redirigido al OrderTracker
        → Ve estados en tiempo real: Nuevo → Preparando → En Camino → Entregado
        → Ve ETA estimado (basado en tiempoPreparacion promedio)
```

**Reglas:**
- Un cliente **no puede tener dos pedidos activos simultáneamente** (solo uno a la vez en estado ≠ `entregado`).
- El cliente puede **cancelar** un pedido solo si está en estado `nuevo` (antes de que cocina lo tome).
- Una vez en `preparando`, **no se puede cancelar** sin contactar al restaurante.

#### C. Reservar una Mesa

```
[Menú Principal] → "Reservar Mesa"
    → Paso 1: Seleccionar fecha y hora (rango: hoy + 30 días)
    → Paso 2: Indicar número de comensales
    → Paso 3: Mapa SVG del restaurante
        → Solo se muestran mesas con capacidad ≥ comensales solicitados
        → Mesas libres: verde / Ocupadas: rojo / Reservadas en esa franja: amarillo
    → Paso 4: Confirmar datos de contacto (pre-llenados con el perfil)
    → Confirmar → Estado: "pendiente"
    → [Sistema] notifica al Admin
    → [Admin] confirma o rechaza → Cliente recibe notificación de cambio de estado
```

**Reglas:**
- Una reserva bloquea una mesa para una franja de **2 horas** por defecto.
- El cliente puede **cancelar** su reserva hasta **2 horas antes** de la hora reservada.
- Máximo **2 reservas activas** por cliente simultáneamente.
- Si el cliente no se presenta (no-show), el Admin puede marcarla como `cancelada` y liberar la mesa.

#### D. Ver Historial

```
[Perfil] → "Mis Reservas"
    → Lista cronológica: confirmadas, pendientes, pasadas, canceladas
[Perfil] → "Mis Pedidos"
    → Lista con estado actual, ítems y total de cada pedido
```

---

### 4.2 Flujo: Administrador

El administrador tiene acceso a **todo el sistema**. Su dashboard es el centro de operaciones.

#### A. Dashboard Principal (KPIs en Tiempo Real)

```
Métricas visibles:
    - Ingresos del día (suma de pedidos entregados con método de pago ≠ pendiente)
    - Pedidos activos (estado: nuevo + preparando + en_camino)
    - Ocupación actual de mesas (ocupadas / total)
    - Reservas del día (confirmadas)
    - Plato más vendido del día
    - Repartidores en ruta
```

#### B. Gestión de Reservas

```
[Admin] → Panel "Reservas"
    → Ver todas las reservas: pendientes (requieren atención), confirmadas, canceladas
    → Filtrar por fecha / estado
    → Acción: Confirmar reserva pendiente → Estado: "confirmada" → Mesa queda bloqueada
    → Acción: Cancelar reserva → Estado: "cancelada" → Mesa liberada → Notificación al cliente
    → Acción: Marcar como no-show → igual que cancelar pero con registro de incidencia
```

#### C. Gestión del Plano de Mesas

```
[Admin] → Panel "Mesas"
    → Ver plano en tiempo real
    → Seleccionar mesa → Cambiar estado: libre | ocupada | reservada
    → Ver qué reserva está asociada a una mesa reservada
    → Asignar mesa a una reserva existente
```

#### D. Gestión del Menú

```
[Admin] → Panel "Menú"
    → Ver todos los platos con estado de disponibilidad
    → Toggle disponibilidad de un plato (p.ej. "Se acabó el cuy")
    → Editar precio de un plato
    → Agregar nuevo plato (nombre, descripción, precio, categoría, imagen, tiempo)
    → Eliminar plato (solo si no tiene pedidos activos que lo incluyan)
```

#### E. Gestión de Pedidos Delivery

```
[Admin] → Panel "Pedidos"
    → Ver pedidos en estado "nuevo" sin asignar
    → Asignar pedido a un repartidor disponible
    → Ver todos los pedidos en curso con su repartidor y estado
    → Puede actualizar estado manualmente en caso de emergencia
```

#### F. Gestión de Personal

```
[Admin] → Panel "Personal"
    → Ver lista de empleados con rol y estado (activo / inactivo)
    → Crear nuevo empleado (ver sección 3.2)
    → Desactivar / reactivar empleado
    → Cambiar rol de empleado
    → Resetear contraseña de empleado
    → Ver historial de actividad del empleado (últimas acciones registradas)
```

#### G. Reportes y Analítica

```
[Admin] → Panel "Reportes"
    → Ventas por período (día / semana / mes)
    → Platos más vendidos (ranking)
    → Horas pico de ocupación (histograma)
    → Clientes frecuentes (top 10 por número de pedidos)
    → Tasa de cancelación de reservas
    → Ingresos por canal (salón vs. delivery)
```

---

### 4.3 Flujo: Mesero

El mesero opera desde su propio dispositivo (tablet o celular) dentro del restaurante.

#### A. Ver Mesas Asignadas

```
Login como mesero
    → Vista: Plano de mesas filtrado a sus mesas asignadas (o todas si no hay asignación)
    → Mesa ocupada: ver los pedidos activos de esa mesa
```

#### B. Tomar Pedido en Mesa

```
[Mesero] → Seleccionar mesa ocupada
    → "Tomar pedido"
        → Explorar menú (solo platos disponibles)
        → Agregar ítems por comensal o de forma general
        → Agregar notas especiales por ítem (p.ej. "sin picante")
    → Confirmar pedido → Se envía a Cocina con estado "nuevo"
    → La mesa queda marcada como "pidiendo" (visualmente) y luego "esperando" (comida)
```

**Nota de Diseño**: El cliente *no puede* hacer pedidos directamente desde la app cuando está en salón. Todo pedido de mesa debe pasar por el mesero para garantizar el control de calidad, manejar excepciones y mantener el flujo tradicional del restaurante.

#### C. Comunicación con Cocina

```
[Cocina] actualiza estado del plato → [Mesero] ve notificación
    → Estado del pedido: nuevo → preparando → listo_para_servir
    → Cuando cocina marca "listo para servir", el mesero recibe alerta
    → Mesero lleva el plato → Marca ítem como "servido"
```

#### D. Cerrar Mesa y Solicitar Cuenta

```
[Mesero] → Seleccionar mesa en estado "comiendo"
    → "Pedir Cuenta"
    → El estado de la mesa cambia a "pagando"
    → La comanda aparece inmediatamente en la cola del Cajero
```

**Nota de Seguridad**: El mesero *nunca* cobra ni cierra definitivamente la mesa. Su rol termina al solicitar la cuenta. Esto previene fraudes y centraliza el control financiero en la caja.

---

### 4.4 Flujo: Cocina

La pantalla de cocina es una **vista de solo lectura + actualización de estado** diseñada para ser usada con las manos sucias (pantalla grande, botones grandes).

```
Login como cocina
    → Vista: Cola de pedidos ordenada por hora de entrada (FIFO)
    → Cada tarjeta de pedido muestra:
        - Número de mesa o "DELIVERY"
        - Ítems del pedido con cantidades y notas especiales
        - Tiempo transcurrido desde que llegó el pedido
    → Acción: "Tomar pedido" → Estado: nuevo → preparando
    → Acción: "Listo para servir" → Estado: preparando → listo
        → Notifica automáticamente al mesero (para pedidos de mesa)
        → Notifica al Admin (para delivery → listo para despacho)
```

**Reglas:**
- Cocina **no puede** editar el pedido, solo cambiar su estado.
- Si falta un ingrediente, debe notificar al Admin (a través de un botón de incidencia).

---

### 4.5 Flujo: Cajero

```
Login como cajero
    → Vista: Cuentas pendientes de cobro (mesas en estado "pagando" y pedidos delivery en efectivo)
    → Seleccionar cuenta de la cola
        → Ver desglose: ítems, cantidades, subtotal, total
        → Seleccionar método de pago: efectivo | tarjeta | Yape | Plin
        → Si es efectivo: ingresar monto recibido → sistema calcula vuelto
        → Confirmar cobro → Pedido/Cuenta marcados como "pagado"
        → Mesa liberada automáticamente (vuelve a "libre")
        → Emisión de ticket / comprobante electrónico
```

> ⚠️ **Punto de decisión pendiente (cola de cobro).** Hoy el selector `getPedidosPendientesCobro()` arma la cola con: (a) pedidos de **salón** en estado `servido` o `listo`, y (b) pedidos de **delivery** `entregado` pagados en efectivo (reconciliación). En cambio, `solicitarCuenta` cambia la **mesa** a `pagando` pero **no cambia el estado del pedido**. Resultado: un pedido aparece en la cola del cajero apenas está `servido`, aún sin que el mesero haya pedido la cuenta. **Hay que decidir el criterio único:**
> - **Opción A (recomendada):** la cola se basa en `mesa.estado === 'pagando'` → el cajero solo ve cuentas que el mesero solicitó explícitamente.
> - **Opción B:** mantener `servido`/`listo` y eliminar el estado `pagando` como gatillo.
>
> Mientras no se decida, el comportamiento documentado en el flujo de arriba (cajero ve mesas en `pagando`) **no coincide** con el código.

---

### 4.6 Flujo: Repartidor

```
Login como delivery
    → Vista: Mis pedidos asignados (estado ≠ entregado)
    → Tarjeta de pedido muestra:
        - Nombre y teléfono del cliente
        - Dirección de entrega
        - Ítems del pedido
        - Total a cobrar (si es pago contra entrega)
    → Acción: "Salir a entregar" → Estado: preparando → en_camino
        → Botón: "Abrir en Google Maps" (con la dirección pre-cargada)
    → Al llegar: SwipeToConfirm "Entregado" → Estado: en_camino → entregado
    → Si hay problema: botón "Reportar incidencia" (cliente no contesta, dirección errónea, etc.)
```

---

## 5. Registro de Actividad y Gestión de Ofertas

### 5.1 Qué se registra automáticamente

Cada acción relevante del sistema queda registrada en un log de actividad:

| Evento | Actor | Datos registrados |
|--------|-------|-------------------|
| Pedido creado | Cliente/Mesero | userId, tipo (salón/delivery), items, total, timestamp |
| Pedido estado cambiado | Cualquiera | pedidoId, estado_anterior, estado_nuevo, timestamp |
| Pedido cancelado | Cliente/Admin | pedidoId, motivo, timestamp |
| Reserva creada | Cliente | userId, fecha, hora, personas, mesaId |
| Reserva cancelada | Cliente/Admin | reservaId, motivo, timestamp, horas_de_antelación |
| No-show | Admin | reservaId, userId, timestamp |
| Pago procesado | Cajero | pedidoId, metodoPago, total, mesaId |
| Empleado creado/activado | Admin | userId_empleado, role |
| Disponibilidad de plato cambiada | Admin/Cocina | platoId, disponible, nombre |
| Estado de mesa cambiado | Sistema/Admin | mesaId, estado |
| Inicio de sesión | Cualquiera | userId, role |

> El tipo `TipoEvento` en código incluye: `pedido_creado`, `pedido_cancelado`, `pedido_estado_cambiado`, `reserva_creada`, `reserva_confirmada`, `reserva_cancelada`, `no_show_registrado`, `pago_procesado`, `plato_disponibilidad_cambiada`, `mesa_estado_cambiado`, `empleado_creado`, `empleado_desactivado`, `login`. El `Set` `EVENTOS_PERSISTENTES` define cuáles se guardan en `localStorage` (los de UI menor, como `login` o `mesa_estado_cambiado`, quedan solo en memoria).

**Persistencia**: Los eventos de negocio críticos (listados arriba) se guardan en el `localStorage` del dispositivo usando un **buffer circular de 500 eventos** para no saturar la memoria. Eventos de UI menores (como vistas de platos) se mantienen solo en memoria volátil.

### 5.2 Cómo el Admin usa la actividad para generar ofertas

El sistema provee al Admin una vista de **segmentos de clientes** basada en el historial acumulado:

```
[Admin] → Panel "Clientes"
    → Segmentos automáticos:
        - 🔥 Clientes frecuentes (≥ 4 pedidos en el último mes)
        - 🌟 Clientes nuevos (primer pedido en los últimos 7 días)
        - 😴 Clientes inactivos (sin pedidos en los últimos 30 días)
        - 🎂 Con cumpleaños este mes (si proporcionaron fecha)
    → Para cada segmento, el Admin puede crear una oferta:
        - Descuento porcentual en el próximo pedido
        - "2x1 en postres los martes"
        - Texto personalizado para notificación push (PWA)
```

### 5.3 Preferencias inferidas

A partir del historial de pedidos, el sistema puede mostrar al Admin:

```
Top 3 platos más pedidos por cada cliente
Categoría preferida (si el 60%+ de sus pedidos son "segundos")
Horario habitual de pedido
Canal preferido: salón vs. delivery
```

Esto **no es visible para el cliente** en su propio perfil (privacidad). El Admin lo usa internamente para personalizar la oferta.

---

## 6. Reglas de Negocio Transversales

### 6.1 Disponibilidad del Menú

- El Admin y el personal de Cocina pueden marcar un plato como **no disponible** en tiempo real.
- Los clientes **nunca ven** platos no disponibles en su menú.
- Los meseros ven todos los platos pero los no disponibles aparecen con indicador visual "Agotado" y no se pueden agregar al pedido.

### 6.2 Gestión de Mesas

- Una mesa puede estar en tres estados físicos: `libre`, `ocupada`, `reservada`.
- Una mesa `reservada` para una hora futura sigue siendo `libre` físicamente hasta que llegan los comensales.
- El sistema muestra la disponibilidad de una mesa **en función de la fecha y hora consultada** (no solo el estado físico actual).
- El Admin puede anular una reserva y liberar la mesa en cualquier momento.

### 6.3 Prioridad de Pedidos en Cocina

- Los pedidos de **salón tienen prioridad** sobre delivery por defecto (el cliente está en el local).
- El chef puede reordenar manualmente si lo considera necesario.
- Un pedido lleva más de **30 minutos** en `preparando` → alerta automática al Admin.

### 6.4 Cancelaciones y Política de No-Show

- **Reserva:** El cliente puede cancelar hasta 2 horas antes sin penalización.
- **No-show:** Registrado en el historial del cliente. A los 3 no-shows, el Admin recibe una alerta y puede decidir bloquear futuras reservas de ese cliente.
- **Pedido delivery:** Cancelable solo en estado `nuevo`. Si está `preparando`, la cancelación requiere aprobación del Admin.

### 6.5 Método de Pago

- Pago en efectivo, Yape, Plin o tarjeta.
- Para delivery: el cliente declara el método al hacer el pedido (**efectivo / Yape / Plin**, pago **contra entrega**). Si es efectivo, el repartidor lleva vuelto.
- Para salón: el cajero gestiona el método al cierre de la mesa.
- El sistema **no procesa pagos en línea** en la versión actual (no hay integración con pasarela de pagos). Es informativo.
- **Las reservas NO tienen costo (decisión tomada).** Se crean como `pendiente`, el admin las confirma y el cliente paga su consumo en el local. El flujo de reserva no cobra ni pide método de pago; solo muestra un aviso explicativo. **Fundamento:**
  1. Es la norma del segmento (restaurante regional casual/medio): reservar es gratis.
  2. El sistema **no tiene pasarela de pagos** (§6.5), así que cobrar/retener tarjeta no es ejecutable; pedir pago sería una promesa falsa en la UI.
  3. El riesgo de **no-show** ya se mitiga sin cobrar, vía la política de no-show (§6.4: registro + bloqueo a los 3).
  4. Menos fricción → más reservas y mejor experiencia.
  - **Futuro (roadmap):** si los no-shows se vuelven un problema *y* se integra pasarela, lo correcto sería un **depósito reembolsable / retención que solo se ejecuta ante no-show**, no un pago por reservar.

---

## 7. Arquitectura de Autenticación y Roles

### 7.1 Sesión

- La sesión del usuario se persiste en `localStorage` (via Zustand `persist`).
- Al abrir la app, si hay sesión activa, el usuario va directamente a su vista de rol.
- Si no hay sesión, la app muestra la pantalla de login / selector de rol.

### 7.2 Guards de Ruta

Cada ruta de la aplicación está protegida por un guard que verifica:

1. ¿Hay sesión activa? Si no → redirigir a `/login`
2. ¿El rol del usuario tiene acceso a esta ruta? Si no → redirigir a su dashboard correspondiente

```
Rutas protegidas por rol:

/cliente/*      → solo rol: cliente
/admin/*        → solo rol: admin
/mesero/*       → solo rol: mesero
/cocina/*       → solo rol: cocina
/caja           → solo rol: caja (etiqueta visible: "Cajero")
/delivery/*     → solo rol: delivery
```

> La ruta del cajero es **`/caja`** (no `/cajero`), consistente con el literal `'caja'` del tipo `UserRole`.

### 7.3 El Admin puede impersonar vistas (NO sesiones)

El Admin tiene acceso a una opción de **"Ver como [rol]"** que le permite previsualizar la interfaz de cada rol sin cambiar su propia sesión. Esto es útil para capacitar personal o verificar que la UI funciona correctamente.

---

## 8. Notificaciones y Alertas

| Evento | Destinatario | Canal |
|--------|--------------|-------|
| Nueva reserva creada | Admin | Toast en dashboard + badge |
| Reserva confirmada | Cliente | Notificación push PWA |
| Reserva cancelada | Cliente | Notificación push PWA |
| Nuevo pedido delivery | Admin + Cocina | Toast + badge en cola |
| Pedido listo para despacho | Admin + Repartidor | Toast + badge |
| Pedido entregado | Admin | Actualización de dashboard |
| Plato agotado (marcado por cocina) | Admin | Toast de alerta |
| Pedido sin asignar > 10 min | Admin | Alerta de urgencia |

---

## 9. Estado del Sistema — Máquinas de Estado

### 9.1 Estados de un Pedido

```
nuevo ──────────→ preparando ──────────→ listo ──────────→ en_camino ──────────→ entregado
  │                   │
  └── cancelado ◄─────┘ (solo si Admin aprueba)
```

Para pedidos de salón, el estado `en_camino` no aplica; va directo a `listo → servido`.

### 9.2 Estados de una Reserva

Tipo en código: `EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'no_show'`.

```
pendiente ──────→ confirmada
    │                 │
    │                 ├──→ no_show      (admin: cliente no llegó)
    └── cancelada ◄───┘
        (cliente hasta 2h antes, o admin en cualquier momento)
```

> No existen estados `expirada` ni `completada` en la versión actual. Una reserva pasada simplemente queda en `confirmada` en el historial. Si se quisiera distinguir "completada" habría que añadir el literal al tipo (roadmap).

### 9.3 Estados de una Mesa

Tipo en código: `EstadoMesa = 'libre' | 'ocupada' | 'reservada' | 'pidiendo' | 'esperando' | 'comiendo' | 'pagando'`.

```
libre ──→ reservada                                  (reserva confirmada para una franja)
  │
  └──→ ocupada ──→ pidiendo ──→ esperando ──→ comiendo ──→ pagando ──→ libre
        (llegan    (mesero      (comanda      (platos      (cuenta     (cajero
         comen-     toma la      en cocina)    servidos)    solicitada)  cobra →
         sales)     comanda)                                            libera)
```

**Sincronización mesa ↔ pedido (implementada en `updatePedidoEstado` / `solicitarCuenta` / `procesarPago`):**

| Acción / estado del pedido de salón | Estado resultante de la mesa |
|-------------------------------------|------------------------------|
| `crearComandaSalon` (pedido → `nuevo`) | `pidiendo` |
| pedido → `preparando` | `esperando` |
| pedido → `listo` | `esperando` (mesero va a recoger) |
| pedido → `servido` | `comiendo` |
| `solicitarCuenta` | `pagando` |
| `procesarPago` (pedido → `pagado`) | `libre` (mesa liberada) |

---

## 10. Escenarios Especiales y Edge Cases

| Escenario | Comportamiento esperado |
|-----------|------------------------|
| Cliente intenta reservar una mesa ya tomada en esa franja | Sistema bloquea la acción y muestra mesas disponibles alternativas |
| Admin desactiva un plato que está en un carrito activo | El carrito muestra el ítem con aviso "Ya no disponible". Al confirmar el pedido, el sistema valida disponibilidad y rechaza ese ítem |
| Repartidor pierde conectividad | La app guarda el último estado en caché (PWA offline). Al reconectar, sincroniza el estado |
| Admin elimina a un mesero con pedidos activos | Sistema bloquea la eliminación. Debe reasignar o cerrar los pedidos primero |
| Cliente cancela reserva justo en el límite de 2 horas | Sistema calcula el tiempo con precisión de minuto. Si es exactamente 2h, se permite. Si es 1h59m, se bloquea con mensaje explicativo |

---

## 11. Mapa de Navegación y Layouts

La app usa **tres layouts** según el rol (ya implementados en `src/components/layout/`):

| Layout | Roles | Navegación | Dispositivo objetivo |
|--------|-------|-----------|----------------------|
| **MobileLayout** | Cliente, Mesero, Repartidor | `BottomNav` (barra inferior) | Celular (uso en mano / en sala) |
| **DesktopLayout** | Admin, Cajero | `SidebarNav` (barra lateral) | Escritorio / tablet horizontal |
| **KdsLayout** | Cocina | Sin nav — pantalla única a full | Pantalla grande de cocina (KDS) |

### 11.1 Rutas por rol

```
PÚBLICO
  /                       → RoleSelectorPage (si no hay sesión) / redirige al dashboard del rol

CLIENTE  (MobileLayout)
  /cliente                → ClientHome (inicio: menú destacado + accesos)
  /cliente/menu           → DeliveryMenu (catálogo para pedido delivery)
  /cliente/reserva        → ReservationFlow (asistente de reserva en pasos)
  /cliente/reservas       → MyReservationsPage (historial de reservas)
  /cliente/pedidos        → MyOrdersPage (historial + OrderTracker en vivo)

ADMIN  (DesktopLayout)
  /admin                  → AdminDashboard (KPIs)
  /admin/mesas            → FloorPlanPage (plano de mesas)
  /admin/menu             → MenuManagerPage (gestión de menú)
  [roadmap] /admin/reservas, /admin/pedidos, /admin/personal, /admin/clientes, /admin/reportes

MESERO  (MobileLayout)
  /mesero                 → WaiterDashboard (plano + toma de comanda)

COCINA  (KdsLayout)
  /cocina                 → KitchenKDS (cola de tickets)

CAJA  (DesktopLayout)
  /caja                   → POSView (cola de cobro + cobro)

DELIVERY  (MobileLayout)
  /delivery               → DeliveryView (mis pedidos asignados)
```

> **Estado actual vs. roadmap:** Las pantallas marcadas `[roadmap]` están descritas en los flujos del Admin (Sección 4.2) pero **aún no tienen ruta/página creada**. El Admin hoy solo tiene Dashboard, Mesas y Menú. Las acciones del store para reservas/pedidos/personal **ya existen**; falta construir las pantallas que las invoquen.

---

## 12. Catálogo de Pantallas → Botones → Acciones

> ⚠️ **Esto es la ESPECIFICACIÓN OBJETIVO, no el estado construido.** Define qué controles *debe* tener cada pantalla, qué *debe* hacer cada uno y a qué acción del store (`useAppStore` / `useAuthStore`) *debería* llamar. Es la guía para construir el frontend, no un reporte de lo ya hecho.
>
> **Estado real del frontend (mayo 2026): prototipo visual, mayormente NO cableado.** Las pantallas existen como maqueta con datos mock y varios botones decorativos. Ver §12.0 para el estado por pantalla. `OperationResult` = `{ ok, error? }`: cuando `ok === false` se muestra `error` vía `useToastStore`.

### 12.0 Estado de implementación (auditado en código, 29-may-2026)

App arranca sin errores (Vite, HTTP 200). Auditoría hecha trazando cada `onClick`/handler en el código (no por clic visual — no había navegador disponible). Leyenda: ✅ cableado a lógica real · ⚠️ funciona pero con mock/limitación · ❌ falso/roto.

| Pantalla | Estado | Detalle verificado |
|----------|:---:|------|
| RoleSelectorPage | ✅ | `switchRole(role)` + navega. Funcional como **login de dev**. ❌ login/registro reales (con contraseña) no existen |
| ClientHome | ✅ | 4 botones navegan bien. ⚠️ "240 pts" hardcodeado. (QR eliminado por §4.3) |
| DeliveryMenu | ✅ | `MenuGrid→addToCart` y `CartDrawer→addPedidoDelivery` reales; pantalla de éxito inline. ⚠️ "Contactar Repartidor" = `alert()`; ETA "35-45 min" fijo |
| CartDrawer | ✅ | `addPedidoDelivery` + toast de error. ⚠️ método de pago limitado a tarjeta/yape (spec dice efectivo/yape/plin) |
| ReservationFlow | ✅ | Asistente 4 pasos → `addReserva` con validación → SuccessScreen |
| MyReservationsPage | ✅ | Cancelar → `cancelarReservaCliente` (regla 2h) + toast |
| MyOrdersPage | ⚠️ | Muestra `OrderTracker`. **Filtra por `clienteNombre === user.name`** (mock, no por `clienteId`). Solo lectura |
| WaiterDashboard | ✅ | Comanda → `crearComandaSalon`; servido → `updatePedidoEstado`; cuenta → `solicitarCuenta`. Usa feedback local, no `useToastStore` |
| KitchenKDS | ✅ | Kanban drag&drop → `updatePedidoEstado` (nuevo/preparando/listo). ⚠️ modal de receta = mock explícito. ❌ falta botón "plato agotado/incidencia" (§4.4) |
| POSView | ✅ | Cola `getPedidosPendientesCobro` + `procesarPago` + cálculo de vuelto. ⚠️ "Imprimir Comprobante" solo cierra el modal |
| DeliveryView | ⚠️ | ❌ usa `CURRENT_DELIVERY_ID = 'usr_delivery_01'` hardcodeado, **ignora la sesión**. "Caja del turno" = suma mock. OrderCard funciona pero "Abrir Maps" = toast |
| AdminDashboard | ⚠️ | KPIs reales ✅; confirmar/rechazar reserva ✅. ❌ "ver pedidos" → `/admin/pedidos` (ruta inexistente, rebota a `/admin`). ❌ "Kardex/Inventario" y "Logs de Auditoría" = `alert()` |
| FloorPlanPage | ✅ | `updateMesaEstado` + navegación por fecha. ⚠️ solo botones libre/ocupada (no los 7 estados); falta "asignar reserva" (§C) |
| MenuManagerPage | ✅ | toggle disponibilidad, editar precio y agregar plato → store. ⚠️ falta "eliminar plato" (§D) |

**Transversal:** todos los datos son **mock en memoria** (no hay backend, no hay persistencia entre dispositivos). La autenticación es solo de desarrollo. Los IDs de mesero/cocina/cajero/cliente usan `user?.id ?? 'usr_..._01'` (toman la sesión si existe); **DeliveryView es la excepción** (ID fijo).

> El catálogo de abajo (§12.1+) es el **destino**; esta tabla §12.0 es el **estado real**.

### 12.1 RoleSelectorPage (público)

| Control | Acción | Resultado |
|---------|--------|-----------|
| Tarjeta de rol (×6) | `useAuthStore.switchRole(role)` | Login de desarrollo sin contraseña → redirige al dashboard del rol |
| (roadmap) "Iniciar sesión" | `login(user)` | Login real por teléfono + contraseña |
| (roadmap) "Registrarme" | `registrarCliente({name, phone, email?})` | Crea cliente + auto-login |

### 12.2 Cliente

**ClientHome / DeliveryMenu**

| Control | Acción | Notas |
|---------|--------|-------|
| Chip de categoría | filtro local | Sopas / Segundos / Entradas / Postres / Bebidas |
| Tarjeta de plato → "Agregar" | `addToCart(plato, notas?)` | Solo platos `disponible === true` |
| Stepper +/- en carrito | `updateCartItemQty(platoId, qty)` | `qty <= 0` elimina el ítem |
| "Eliminar" ítem | `removeFromCart(platoId)` | |
| Selector método de pago | estado local del form | `efectivo / yape / plin` |
| "Confirmar pedido" | `addPedidoDelivery(pedido, actorId)` | Valida: 1 pedido activo máx. + disponibilidad. Limpia carrito y redirige a tracker |

**MyOrdersPage / OrderTracker**

| Control | Acción | Notas |
|---------|--------|-------|
| Línea de estado en vivo | lectura `pedido.estado` | nuevo → preparando → listo → en_camino → entregado |
| "Cancelar pedido" | `cancelarPedidoDelivery(pedidoId, actorId, role)` | Solo habilitado si estado === `nuevo` |

**ReservationFlow (asistente por pasos)**

| Paso / Control | Acción | Notas |
|----------------|--------|-------|
| Paso 1: fecha + hora | estado local | rango hoy + 30 días |
| Paso 2: nº comensales | estado local | |
| Paso 3: plano SVG (`FloorPlanSVG`) | `getDisponibilidadMesas(state, fecha, hora)` | filtra mesas por capacidad y pinta libre/ocupada/reservada |
| Paso 4: datos de contacto | pre-llenado del perfil | |
| "Confirmar reserva" | `addReserva(reserva, actorId)` | Valida: máx 2 activas + fecha futura. Estado inicial `pendiente` |

**MyReservationsPage**

| Control | Acción | Notas |
|---------|--------|-------|
| "Cancelar reserva" | `cancelarReservaCliente(reservaId, clienteId)` | Valida ventana de 2h; libera mesa si estaba asignada |

### 12.3 Mesero — WaiterDashboard

| Control | Acción | Notas |
|---------|--------|-------|
| Mesa en el plano | selección local | ver pedidos activos de la mesa (`getPedidosByMesa`) |
| "Tomar pedido" → menú | `addToCart` / form local | solo platos disponibles; notas por ítem |
| "Enviar comanda" | `crearComandaSalon(mesaId, items, meseroId, clienteNombre?)` | Mesa → `pidiendo`; valida no haya comanda activa + disponibilidad |
| "Marcar servido" (por ítem/pedido) | `updatePedidoEstado(pedidoId, 'servido', actorId, 'mesero')` | Mesa → `comiendo` |
| "Pedir cuenta" | `solicitarCuenta(pedidoId, meseroId)` | Mesa → `pagando`. El mesero **nunca cobra** |

### 12.4 Cocina — KitchenKDS

| Control | Acción | Notas |
|---------|--------|-------|
| Ticket (FIFO) | lectura `pedidos` en `nuevo`/`preparando` | muestra mesa o "DELIVERY", ítems, notas, tiempo transcurrido |
| "Tomar pedido" | `updatePedidoEstado(pedidoId, 'preparando', actorId, 'cocina')` | |
| "Listo" | `updatePedidoEstado(pedidoId, 'listo', actorId, 'cocina')` | notifica a mesero (salón) / admin (delivery) |
| (roadmap) "Plato agotado" | `togglePlatoDisponible(platoId, actorId, 'cocina')` + incidencia | |

### 12.5 Cajero — POSView

| Control | Acción | Notas |
|---------|--------|-------|
| Cuenta en cola | `getPedidosPendientesCobro()` | (ver punto de decisión en 4.5) |
| Selector método de pago | estado local | efectivo / tarjeta / yape / plin |
| Input "monto recibido" | cálculo local de vuelto | solo si método === efectivo |
| "Cobrar / Confirmar pago" | `procesarPago(pedidoId, metodoPago, cajeroId)` | Pedido → `pagado`, mesa → `libre` |

### 12.6 Repartidor — DeliveryView

| Control | Acción | Notas |
|---------|--------|-------|
| Tarjeta de pedido | `getPedidosByDelivery(deliveryId)` | cliente, dirección, ítems, total a cobrar |
| "Salir a entregar" | `updatePedidoEstado(pedidoId, 'en_camino', actorId, 'delivery')` | |
| "Abrir en Google Maps" | link externo con la dirección | |
| SwipeToConfirm "Entregado" (`SwipeToConfirm`) | `updatePedidoEstado(pedidoId, 'entregado', actorId, 'delivery')` | |
| (roadmap) "Reportar incidencia" | log de actividad | |

### 12.7 Admin

**AdminDashboard** — solo lectura de KPIs (derivados de `pedidos`, `mesas`, `reservas`, `activityLogs`).

**FloorPlanPage**

| Control | Acción |
|---------|--------|
| Mesa → cambiar estado | `updateMesaEstado(mesaId, estado, extra?)` |

**MenuManagerPage**

| Control | Acción |
|---------|--------|
| Toggle disponibilidad (`Switch`) | `togglePlatoDisponible(platoId, actorId, 'admin')` |
| Editar precio | `updatePlatoPrecio(platoId, precio)` |
| "Agregar plato" | `addPlato(plato)` |

**Roadmap (acciones del store ya disponibles, faltan pantallas):**

| Pantalla futura | Acciones disponibles |
|-----------------|----------------------|
| Reservas | `updateReservaEstado`, `marcarNoShow` |
| Pedidos | `asignarDelivery`, `updatePedidoEstado`, `cancelarPedidoDelivery(forzar=true)` |
| Personal | `addEmpleado`, `toggleEmpleadoActivo`, `cambiarRolEmpleado` |
| Clientes / Reportes | selectores sobre `activityLogs` (segmentación, ofertas) |

---

## 13. Glosario de Términos del Dominio

| Término | Definición |
|---------|------------|
| **Pedido de salón** | Pedido tomado por un mesero para una mesa física del restaurante |
| **Pedido delivery** | Pedido hecho por el cliente desde la app para entrega a domicilio |
| **No-show** | Cliente que realizó una reserva y no se presentó sin cancelar |
| **Mesa libre** | Mesa sin comensales ni reserva activa en el período actual |
| **Mesa ocupada** | Mesa con comensales presentes físicamente |
| **Mesa reservada** | Mesa bloqueada por una reserva confirmada para una fecha/hora específica |
| **ETA** | Estimated Time of Arrival — tiempo estimado de entrega o preparación |
| **KPI** | Key Performance Indicator — métrica clave de desempeño del negocio |
| **Cola de cocina** | Lista de pedidos ordenados para preparación (vista de pantalla de cocina) |

---

*Última actualización: 29 de mayo de 2026 — Yoel Canaza, UNAP Ingeniería de Sistemas.*
*Revisado contra el código (`src/types`, `src/store`, `src/routes`): se alinearon literales de rol (`caja`), máquinas de estado de mesa/reserva, tabla de eventos y se añadieron el mapa de navegación (§11) y el catálogo de botones (§12).*
