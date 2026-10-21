-- ============================================================================
-- 0013 — El contenido deja de ser UN CURSO y pasa a ser CATORCE BOLSOS
--
-- ⚠️ ESTO NO ES UN RETOQUE DEL TEMARIO, ES OTRO MODELO.
--
-- Hasta hoy la app era un curso con `secciones` → `lecciones`, donde una
-- lección podía ser un video, un PDF, un enlace o un texto. El diseño nuevo
-- (design-ref/manos-creadoras-claude-code) son 14 PRODUCTOS: cada bolso tiene
-- sus pasos en video, su lista de materiales y sus enlaces de compra.
--
-- No se puede llegar ahí migrando el temario viejo: no hay forma de repartir
-- "Tutorial 3" entre catorce bolsos porque esa información nunca existió. Se
-- sustituye, y el contenido real entra por el seed (`npm run seed:bolsos`).
--
-- LO QUE SE PIERDE, dicho claro:
--   · `secciones` y `modulos` desaparecen. El temario de 5 secciones no tiene
--     equivalente en el modelo nuevo.
--   · Las lecciones de tipo `pdf`, `enlace` y `texto` desaparecen: el diseño
--     nuevo no las contempla y ese contenido no existe (eran marcadores).
--   · `user_progress` se rehace como `progreso`. El avance guardado hasta hoy
--     apuntaba a lecciones que dejan de existir, así que no se puede traer —
--     y son 4 cuentas de prueba, ninguna alumna real.
--
-- LO QUE SE GANA: los `video_id` del seed son REALES, de la biblioteca de
-- Bunny. El reproductor dejará de dar 404, que era el bloqueo del curso gratis.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Fuera lo viejo
--
-- El orden importa: primero lo que apunta a otras tablas. `cascade` en las
-- tablas arrastra sus políticas e índices, que es lo que queremos — las
-- políticas de 0009 y 0010 hablaban de `es_libre`, una columna que muere aquí.
-- ----------------------------------------------------------------------------

drop table if exists user_progress cascade;
drop table if exists lecciones     cascade;
drop table if exists secciones     cascade;
drop table if exists modulos       cascade;

-- ----------------------------------------------------------------------------
-- 2. Los bolsos
-- ----------------------------------------------------------------------------

create table bolsos (
  id                   uuid primary key default gen_random_uuid(),
  -- El identificador que viaja en la URL: /app/bolsos/gota-de-rocio
  slug                 text not null unique,
  nombre               text not null,
  -- Tres bolsos se llamaban como una marca registrada (Bottega, Dior,
  -- Balenciaga). Se guardan sus nombres originales para que Elizabeth sepa de
  -- cuál habla, pero NUNCA se muestran: usar la marca de otro en un producto
  -- que se vende es justo lo que no se puede hacer.
  nombre_original      text,
  orden                int  not null,
  -- Identificadores de Bunny. `video_materiales_id` es el video que va SIEMPRE
  -- primero y que no cuenta como paso.
  bunny_bolso_id       text not null,
  video_materiales_id  text not null,
  -- Las medidas del bolso terminado. Es `jsonb` y no columnas porque cada
  -- bolso mide lo suyo: unos traen largo/alto/ancho, el Boho trae diámetro y
  -- la Silueta Nácar trae hasta "largo del estrechamiento". Siete no tienen
  -- medidas todavía, y por eso admite null: la ficha oculta el bloque entero.
  medidas_cm           jsonb,
  portada_url          text,
  gratis               boolean not null default false,
  publicado_en         date,
  notas                text[] not null default '{}'
);

create index bolsos_orden_idx on bolsos (orden);

-- ----------------------------------------------------------------------------
-- 3. Las lecciones de cada bolso
-- ----------------------------------------------------------------------------

create table lecciones (
  id          uuid primary key default gen_random_uuid(),
  bolso_id    uuid not null references bolsos (id) on delete cascade,
  -- ⚠️ ESTE ORDEN NO SE TOCA. Es el que definió Elizabeth y a veces sorprende
  -- —en Esmeralda el cierre va ANTES que la base— pero es el orden en que ella
  -- enseña, y reordenarlo "porque tiene más lógica" sería corregirle el método
  -- a quien lo inventó.
  orden       int  not null,
  titulo      text not null,
  video_id    text not null,
  -- Cuando un paso no cupo en un video, se partió en dos: "1 de 2", "2 de 2".
  -- La pantalla los junta en UN paso con dos partes (ver `parte` en el código).
  parte       text,
  duracion_seg int,
  unique (bolso_id, orden)
);

create index lecciones_bolso_idx on lecciones (bolso_id, orden);

-- ----------------------------------------------------------------------------
-- 4. Materiales y el directorio de proveedores
--
-- Un material ("Cuentas de 10 mm: 500 g") es texto de la ficha del bolso. Un
-- ítem del directorio ("Cuentas de 10 mm") es el producto que se compra. No
-- son lo mismo: el mismo producto aparece como material en nueve bolsos con
-- cantidades distintas. De ahí la tabla puente.
-- ----------------------------------------------------------------------------

create table materiales (
  id       uuid primary key default gen_random_uuid(),
  bolso_id uuid not null references bolsos (id) on delete cascade,
  orden    int  not null,
  texto    text not null,
  unique (bolso_id, orden)
);

create table directorio_categorias (
  id     text primary key,          -- 'cuentas', 'hilos', 'herrajes'…
  nombre text not null,
  orden  int  not null
);

create table directorio_items (
  id                 text primary key,   -- 'cuentas-10', 'nylon-07'…
  categoria_id       text not null references directorio_categorias (id) on delete cascade,
  nombre             text not null,
  -- ⚠️ NULL A PROPÓSITO. Los enlaces de AliExpress todavía no existen. Mientras
  -- esté vacío, la pantalla NO enseña un botón de comprar que no lleva a
  -- ningún sitio: enseña "Enlace pronto", deshabilitado.
  url                text,
  precio_referencia  text,
  imagen_url         text
);

create index directorio_items_categoria_idx on directorio_items (categoria_id);

create table material_directorio (
  material_id uuid not null references materiales (id)       on delete cascade,
  item_id     text not null references directorio_items (id) on delete cascade,
  primary key (material_id, item_id)
);

create index material_directorio_item_idx on material_directorio (item_id);

-- ----------------------------------------------------------------------------
-- 5. Lo que es de cada alumna: su avance y su lista de la compra
-- ----------------------------------------------------------------------------

create table progreso (
  user_id  uuid not null references profiles (id) on delete cascade,
  bolso_id uuid not null references bolsos (id)   on delete cascade,
  -- Se guarda el VIDEO, no la lección, porque el video de materiales no es una
  -- lección y también se marca como visto. Por eso es texto y no una clave
  -- ajena: apunta tanto a `lecciones.video_id` como a
  -- `bolsos.video_materiales_id`.
  video_id text not null,
  visto_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index progreso_user_bolso_idx on progreso (user_id, bolso_id);

create table checklist_materiales (
  user_id     uuid not null references profiles (id)    on delete cascade,
  material_id uuid not null references materiales (id)  on delete cascade,
  tengo       boolean not null default true,
  primary key (user_id, material_id)
);

create index checklist_materiales_user_idx on checklist_materiales (user_id);

-- ============================================================================
-- 6. Quién puede leer qué
--
-- El catálogo es PÚBLICO. Es la decisión que ya se tomó en la migración 0009 y
-- sigue valiendo: el producto es su propio argumento de venta, y esconder los
-- nombres y las fotos no protege nada — lo que hay que proteger es el VIDEO.
--
-- ⚠️ Por eso `lecciones` también se lee en abierto: la pantalla necesita poder
-- decir "5 pasos · 6 videos" y listar los títulos a quien todavía no ha pagado.
-- Lo que NO se entrega sin plan es el `video_id` utilizable, y eso no se
-- resuelve aquí sino al firmar la URL de Bunny en el servidor (ver
-- `lib/video.ts`): sin firma, el identificador no reproduce nada.
-- ============================================================================

alter table bolsos                enable row level security;
alter table lecciones             enable row level security;
alter table materiales            enable row level security;
alter table directorio_categorias enable row level security;
alter table directorio_items      enable row level security;
alter table material_directorio   enable row level security;
alter table progreso              enable row level security;
alter table checklist_materiales  enable row level security;

create policy "bolsos: los lee cualquiera" on bolsos
  for select to anon, authenticated using (true);

create policy "lecciones: las lee cualquiera" on lecciones
  for select to anon, authenticated using (true);

create policy "materiales: los lee cualquiera" on materiales
  for select to anon, authenticated using (true);

create policy "directorio_categorias: las lee cualquiera" on directorio_categorias
  for select to anon, authenticated using (true);

create policy "directorio_items: los lee cualquiera" on directorio_items
  for select to anon, authenticated using (true);

create policy "material_directorio: lo lee cualquiera" on material_directorio
  for select to anon, authenticated using (true);

-- El avance y la lista de la compra son de cada una y de nadie más.
-- `(select auth.uid())` y no `auth.uid()` a secas: así Postgres lo evalúa una
-- vez por consulta en lugar de una vez por fila.

create policy "progreso: cada alumna ve el suyo" on progreso
  for select to authenticated using (user_id = (select auth.uid()));

create policy "progreso: cada alumna marca el suyo" on progreso
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "progreso: cada alumna lo desmarca" on progreso
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "checklist: cada alumna ve el suyo" on checklist_materiales
  for select to authenticated using (user_id = (select auth.uid()));

create policy "checklist: cada alumna lo escribe" on checklist_materiales
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "checklist: cada alumna lo cambia" on checklist_materiales
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "checklist: cada alumna lo borra" on checklist_materiales
  for delete to authenticated using (user_id = (select auth.uid()));
