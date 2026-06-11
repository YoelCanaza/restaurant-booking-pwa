-- ═══════════════════════════════════════════════════════════════
-- RINCÓN ANDINO — Esquema inicial (Fase 1: tablas + RLS + seed)
-- ═══════════════════════════════════════════════════════════════
-- Cómo aplicar: Supabase Dashboard → SQL Editor → pegar todo → Run.
-- Es idempotente: se puede re-ejecutar (dropea y recrea).
--
-- Modelado desde src/types/index.ts. IDs en text (mismos del mock)
-- para migrar el frontend sin romper referencias; columnas en
-- snake_case (el adaptador del frontend mapea a camelCase).
--
-- ⚠️ RLS FASE DEMO: las políticas actuales permiten leer/escribir
-- con la anon key (la app aún no tiene Supabase Auth). Es aceptable
-- para la demo del curso; en la Fase Auth se reemplazan por políticas
-- por rol usando auth.uid() / claims. NO usar así en producción real.
-- ═══════════════════════════════════════════════════════════════

-- ── Limpieza (orden inverso por FKs) ──────────────────────────
drop table if exists activity_logs cascade;
drop table if exists pedido_items cascade;
drop table if exists pedidos cascade;
drop table if exists reservas cascade;
drop table if exists mesas cascade;
drop table if exists platos cascade;
drop table if exists usuarios cascade;

-- ═══════════════════════════════════════════════════════════════
-- TABLAS
-- ═══════════════════════════════════════════════════════════════

-- UserRole = 'cliente' | 'admin' | 'mesero' | 'cocina' | 'caja' | 'delivery'
create table usuarios (
  id                  text primary key,
  name                text not null,
  role                text not null check (role in ('cliente','admin','mesero','cocina','caja','delivery')),
  phone               text not null unique,
  email               text,
  avatar_initials     text,
  activo              boolean not null default true,
  creado_por_admin_id text references usuarios(id),
  -- Solo personal (demo): contraseña temporal. La Fase Auth migra esto a Supabase Auth.
  password            text,
  debe_cambiar_password boolean default false,
  created_at          timestamptz not null default now()
);

create table platos (
  id                 text primary key,
  nombre             text not null,
  descripcion        text not null,
  precio             numeric(10,2) not null check (precio >= 0),
  categoria          text not null check (categoria in ('sopas','segundos','postres','bebidas','entradas')),
  image_url          text not null,
  disponible         boolean not null default true,
  tiempo_preparacion int not null default 15,
  popularidad        int,
  created_at         timestamptz not null default now()
);

create table mesas (
  id         text primary key,
  numero     int not null unique,
  capacidad  int not null,
  estado     text not null default 'libre'
             check (estado in ('libre','ocupada','reservada','pidiendo','esperando','comiendo','pagando')),
  piso       int not null default 1,
  reserva_id text,  -- FK al final (referencia circular)
  pedido_id  text   -- FK al final (referencia circular)
);

create table reservas (
  id                 text primary key,
  user_id            text not null references usuarios(id),
  fecha              date not null,
  hora               text not null,
  personas           int not null check (personas > 0),
  nombre             text not null,
  telefono           text not null,
  estado             text not null default 'pendiente'
                     check (estado in ('pendiente','confirmada','cancelada','no_show')),
  mesa_id            text references mesas(id),
  cancelado_at       timestamptz,
  motivo_cancelacion text,
  created_at         timestamptz not null default now()
);

create table pedidos (
  id               text primary key,
  tipo             text not null check (tipo in ('salon','delivery')),
  -- Salón
  mesa_id          text references mesas(id),
  mesero_id        text references usuarios(id),
  -- Delivery
  cliente_id       text references usuarios(id),
  direccion        text,
  delivery_id      text references usuarios(id),
  metodo_pago      text check (metodo_pago in ('efectivo','tarjeta','yape','plin')),
  -- Comunes
  cliente_nombre   text not null,
  cliente_telefono text not null default '',
  total            numeric(10,2) not null default 0,
  estado           text not null default 'nuevo'
                   check (estado in ('nuevo','preparando','listo','en_camino','entregado','servido','pagado','cancelado')),
  notas            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table pedido_items (
  id        bigint generated always as identity primary key,
  pedido_id text not null references pedidos(id) on delete cascade,
  plato_id  text not null references platos(id),
  nombre    text not null,           -- snapshot del nombre al momento del pedido
  precio    numeric(10,2) not null,  -- snapshot del precio al momento del pedido
  cantidad  int not null check (cantidad > 0),
  notas     text
);

create table activity_logs (
  id         text primary key,
  tipo       text not null,
  actor_id   text not null,
  actor_role text not null,
  entidad_id text,
  datos      jsonb,
  timestamp  timestamptz not null default now()
);

-- FKs circulares de mesas (después de crear reservas/pedidos)
alter table mesas
  add constraint mesas_reserva_fk foreign key (reserva_id) references reservas(id) on delete set null,
  add constraint mesas_pedido_fk  foreign key (pedido_id)  references pedidos(id)  on delete set null;

-- ── Índices para las consultas frecuentes ─────────────────────
create index idx_pedidos_estado    on pedidos(estado);
create index idx_pedidos_tipo      on pedidos(tipo);
create index idx_pedidos_mesa      on pedidos(mesa_id);
create index idx_pedidos_cliente   on pedidos(cliente_id);
create index idx_pedidos_delivery  on pedidos(delivery_id);
create index idx_reservas_fecha    on reservas(fecha);
create index idx_reservas_user     on reservas(user_id);
create index idx_logs_timestamp    on activity_logs(timestamp desc);

-- updated_at automático en pedidos
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pedidos_updated_at before update on pedidos
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- RLS — FASE DEMO (se endurece en la Fase Auth)
-- ═══════════════════════════════════════════════════════════════
alter table usuarios      enable row level security;
alter table platos        enable row level security;
alter table mesas         enable row level security;
alter table reservas      enable row level security;
alter table pedidos       enable row level security;
alter table pedido_items  enable row level security;
alter table activity_logs enable row level security;

-- Demo: la app opera con la anon key (sin Auth todavía). Lectura y
-- escritura abiertas, SIN delete (los flujos del dominio nunca borran
-- filas; "eliminar plato" se modela como update de disponibilidad o
-- delete explícito que añadiremos con Auth).
create policy demo_select on usuarios      for select using (true);
create policy demo_insert on usuarios      for insert with check (true);
create policy demo_update on usuarios      for update using (true);

create policy demo_select on platos        for select using (true);
create policy demo_insert on platos        for insert with check (true);
create policy demo_update on platos        for update using (true);
create policy demo_delete on platos        for delete using (true); -- admin elimina platos (validado en app)

create policy demo_select on mesas         for select using (true);
create policy demo_update on mesas         for update using (true);

create policy demo_select on reservas      for select using (true);
create policy demo_insert on reservas      for insert with check (true);
create policy demo_update on reservas      for update using (true);

create policy demo_select on pedidos       for select using (true);
create policy demo_insert on pedidos       for insert with check (true);
create policy demo_update on pedidos       for update using (true);

create policy demo_select on pedido_items  for select using (true);
create policy demo_insert on pedido_items  for insert with check (true);

create policy demo_select on activity_logs for select using (true);
create policy demo_insert on activity_logs for insert with check (true);

-- ── Realtime: publicar cambios de las tablas vivas ────────────
alter publication supabase_realtime add table pedidos, pedido_items, mesas, reservas, platos;

-- ═══════════════════════════════════════════════════════════════
-- SEED — datos del mock (src/store/useAppStore.ts + useAuthStore.ts)
-- ═══════════════════════════════════════════════════════════════

-- Usuarios (personal con contraseña temporal demo1234, como el mock)
insert into usuarios (id, name, role, phone, avatar_initials, activo, creado_por_admin_id, password) values
  ('usr_admin_01',    'Carlos Mamani', 'admin',    '952345678', 'CM', true, null,           'demo1234'),
  ('usr_cliente_01',  'María Quispe',  'cliente',  '951234567', 'MQ', true, null,           null),
  ('usr_cliente_02',  'Pedro Condori', 'cliente',  '954321098', 'PC', true, null,           null),
  ('usr_delivery_01', 'Juan Apaza',    'delivery', '953456789', 'JA', true, 'usr_admin_01', 'demo1234'),
  ('usr_mesero_01',   'Pedro Flores',  'mesero',   '954567890', 'PF', true, 'usr_admin_01', 'demo1234'),
  ('usr_cocina_01',   'Chef Gastón',   'cocina',   '955678901', 'CG', true, 'usr_admin_01', 'demo1234'),
  ('usr_caja_01',     'Lucía Condori', 'caja',     '956789012', 'LC', true, 'usr_admin_01', 'demo1234');

-- 12 platos de gastronomía puneña
insert into platos (id, nombre, descripcion, precio, categoria, image_url, disponible, tiempo_preparacion, popularidad) values
  ('plato_01', 'Caldo de Cabeza de Cordero', 'Caldo tradicional puneño preparado con cabeza de cordero, hierbabuena y papas nativas. Reconfortante y nutritivo.', 12.00, 'sopas', 'https://commons.wikimedia.org/wiki/Special:FilePath/Caldo_de_cabeza_18092010.JPG?width=600', true, 25, null),
  ('plato_02', 'Sopa de Quinua', 'Sopa espesa de quinua andina con verduras frescas, queso y hierbas aromáticas. El sabor del altiplano en cada cucharada.', 10.00, 'sopas', 'https://commons.wikimedia.org/wiki/Special:FilePath/Sopa_de_Quinua,_plato_típico_boliviano.jpg?width=600', true, 20, null),
  ('plato_03', 'Chupe de Camarones', 'Chupe cremoso de camarones de río con leche, queso, papas amarillas y ají colorado. Plato festivo de Puno.', 22.00, 'sopas', 'https://commons.wikimedia.org/wiki/Special:FilePath/Chupe_de_camarones_20100512.JPG?width=600', true, 30, 95),
  ('plato_04', 'Trucha a la Plancha', 'Trucha fresca del lago Titicaca, cocinada a la plancha con limón, ajo y hierbas. Servida con arroz y ensalada.', 28.00, 'segundos', 'https://commons.wikimedia.org/wiki/Special:FilePath/TruchaFrita.jpg?width=600', true, 20, 100),
  ('plato_05', 'Chicharrón de Alpaca', 'Trozos de carne de alpaca fritos hasta lograr una corteza dorada y crujiente. Acompañado de mote, zarza criolla y uchucuta.', 32.00, 'segundos', 'https://commons.wikimedia.org/wiki/Special:FilePath/Chicharrones_de_cerdo.jpg?width=600', true, 35, 90),
  ('plato_06', 'Cancacho al Horno', 'Pierna de cordero marinada en especias andinas y horneada lentamente. Jugosa por dentro, dorada por fuera. Incluye papas al horno.', 38.00, 'segundos', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=70&auto=format&fit=crop', true, 45, 85),
  ('plato_07', 'Cuy Frito al Estilo Puneño', 'Cuy entero frito en su punto exacto, adobado con ají panca, comino y ajo. Servido con papas nativas y salsa de maní.', 42.00, 'segundos', 'https://commons.wikimedia.org/wiki/Special:FilePath/Cuy_chactao.jpg?width=600', false, 50, null),
  ('plato_08', 'Watia de Papa', 'Papa nativa cocinada en horno de tierra con queso fresco derretido y hierbas aromáticas del altiplano. Técnica ancestral inca.', 18.00, 'segundos', 'https://commons.wikimedia.org/wiki/Special:FilePath/Huatia.jpg?width=600', true, 40, null),
  ('plato_09', 'Ocopa Arequipeña', 'Papas amarillas bañadas en salsa de ají mirasol, maní tostado, queso fresco y huacatay. Entrada clásica de los Andes.', 14.00, 'entradas', 'https://commons.wikimedia.org/wiki/Special:FilePath/Ocopa_(Peru).JPG?width=600', true, 10, null),
  ('plato_10', 'Mazamorra de Cañihua', 'Postre cremoso elaborado con cañihua andina, leche fresca, canela y clavo de olor. Dulce tradicional del altiplano.', 9.00, 'postres', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=70&auto=format&fit=crop', true, 15, null),
  ('plato_11', 'Arroz con Leche Andino', 'Arroz cocido en leche de vaca fresca con canela, clavo, azúcar y una pizca de sal. Servido tibio o frío según preferencia.', 8.00, 'postres', 'https://commons.wikimedia.org/wiki/Special:FilePath/Arroz_con_leche.jpg?width=600', true, 10, null),
  ('plato_12', 'Chicha Morada de Ollantay', 'Bebida tradicional de maíz morado cocido con piña, membrillo, canela y clavo. Refrescante y antioxidante. Jarra de 1 litro.', 12.00, 'bebidas', 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=70&auto=format&fit=crop', true, 5, null);

-- 13 mesas (planta baja + rooftop)
insert into mesas (id, numero, capacidad, estado, piso) values
  ('mesa_01',  1, 2, 'libre',     1),
  ('mesa_02',  2, 2, 'comiendo',  1),
  ('mesa_03',  3, 4, 'reservada', 1),
  ('mesa_04',  4, 4, 'libre',     1),
  ('mesa_05',  5, 6, 'libre',     1),
  ('mesa_06',  6, 6, 'esperando', 1),
  ('mesa_07',  7, 8, 'libre',     1),
  ('mesa_08',  8, 8, 'reservada', 1),
  ('mesa_09',  9, 2, 'libre',     2),
  ('mesa_10', 10, 4, 'libre',     2),
  ('mesa_11', 11, 4, 'ocupada',   2),
  ('mesa_12', 12, 6, 'libre',     2),
  ('mesa_13', 13, 8, 'reservada', 2);

-- 3 reservas (fechas relativas a hoy, como el mock)
insert into reservas (id, user_id, fecha, hora, personas, nombre, telefono, estado, mesa_id, created_at) values
  ('res_01', 'usr_cliente_01', current_date,     '13:00', 4, 'María Quispe',  '951234567', 'confirmada', 'mesa_03', now() - interval '1 hour'),
  ('res_02', 'usr_cliente_01', current_date + 2, '20:00', 8, 'María Quispe',  '951234567', 'pendiente',  'mesa_08', now() - interval '2 hours'),
  ('res_03', 'usr_cliente_02', current_date - 1, '19:00', 2, 'Pedro Condori', '954321098', 'cancelada',  null,      now() - interval '1 day');

-- 4 pedidos (2 delivery + 2 salón) y sus ítems
insert into pedidos (id, tipo, mesa_id, mesero_id, cliente_id, direccion, delivery_id, metodo_pago,
                     cliente_nombre, cliente_telefono, total, estado, created_at, updated_at) values
  ('ped_01',       'delivery', null,      null,            'usr_cliente_01', 'Jr. Lima 345, Puno',   'usr_delivery_01', 'yape',
   'Ana Flores',     '955667788', 68.00,  'preparando', now() - interval '30 minutes', now() - interval '15 minutes'),
  ('ped_02',       'delivery', null,      null,            null,             'Av. El Sol 789, Puno', null,              'efectivo',
   'Roberto Huanca', '956778899', 50.00,  'nuevo',      now() - interval '10 minutes', now() - interval '10 minutes'),
  ('ped_salon_02', 'salon',    'mesa_02', 'usr_mesero_01', null,             null,                   null,              null,
   'Mesa 2',         '',          86.00,  'servido',    now() - interval '45 minutes', now() - interval '5 minutes'),
  ('ped_salon_01', 'salon',    'mesa_06', 'usr_mesero_01', null,             null,                   null,              null,
   'Mesa 6',         '',          102.00, 'preparando', now() - interval '15 minutes', now() - interval '10 minutes');

insert into pedido_items (pedido_id, plato_id, nombre, precio, cantidad, notas) values
  ('ped_01',       'plato_04', 'Trucha a la Plancha',          28.00, 2, null),
  ('ped_01',       'plato_12', 'Chicha Morada de Ollantay',    12.00, 1, null),
  ('ped_02',       'plato_05', 'Chicharrón de Alpaca',         32.00, 1, null),
  ('ped_02',       'plato_10', 'Mazamorra de Cañihua',          9.00, 2, null),
  ('ped_salon_02', 'plato_01', 'Caldo de Cabeza de Cordero',   12.00, 2, null),
  ('ped_salon_02', 'plato_06', 'Cancacho al Horno',            38.00, 1, null),
  ('ped_salon_02', 'plato_12', 'Chicha Morada de Ollantay',    12.00, 2, null),
  ('ped_salon_01', 'plato_04', 'Trucha a la Plancha',          28.00, 2, 'Sin limón'),
  ('ped_salon_01', 'plato_03', 'Chupe de Camarones',           22.00, 1, null),
  ('ped_salon_01', 'plato_12', 'Chicha Morada de Ollantay',    12.00, 2, null);

-- Vincular mesas con su reserva/pedido activo (como el mock)
update mesas set reserva_id = 'res_01'       where id = 'mesa_03';
update mesas set reserva_id = 'res_02'       where id = 'mesa_08';
update mesas set pedido_id  = 'ped_salon_01' where id = 'mesa_06';
update mesas set pedido_id  = 'ped_salon_02' where id = 'mesa_02';

-- ═══════════════════════════════════════════════════════════════
-- Verificación rápida (el SQL Editor muestra el resultado)
-- ═══════════════════════════════════════════════════════════════
select 'usuarios' as tabla, count(*) from usuarios
union all select 'platos',        count(*) from platos
union all select 'mesas',         count(*) from mesas
union all select 'reservas',      count(*) from reservas
union all select 'pedidos',       count(*) from pedidos
union all select 'pedido_items',  count(*) from pedido_items;
