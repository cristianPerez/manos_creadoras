-- ============================================================================
-- 0018 · DÓNDE PAGA CADA QUIEN, Y DESDE DÓNDE NOS VISITA
-- ============================================================================

-- ── 1. Los enlaces de cobro ────────────────────────────────────────────────
--
-- ⚠️ TABLA APARTE, NO UNA COLUMNA EN `plan_cupos`. La tentación era añadir
-- `url_mensual_co`, `url_anual_co`, `url_mensual_intl`… allí mismo. Con eso,
-- abrir un tercer país (México con su propia pasarela, por ejemplo) obligaría a
-- una MIGRACIÓN. Así es INSERTAR UNA FILA.
--
-- Además `plan_cupos` lo lee `consumir_cupo`, que es código delicado y probado;
-- no se toca para guardar una URL.
create table if not exists plan_checkout (
  plan    text not null references plan_cupos (plan) on delete cascade,
  ciclo   text not null check (ciclo in ('mensual', 'anual')),

  -- Dos cubos, no una lista de países: lo único que cambia hoy es si el cobro
  -- sale por la pasarela colombiana o por la internacional. El país concreto de
  -- cada visita se guarda en `sesiones_pais`, que es donde sí hace falta el
  -- detalle.
  region  text not null check (region in ('colombia', 'internacional')),

  url     text not null check (url like 'https://%'),

  actualizado_en timestamptz not null default now(),
  primary key (plan, ciclo, region)
);

alter table plan_checkout enable row level security;

-- Lectura pública: son enlaces de pago que la landing enseña a cualquiera. No
-- hay nada que proteger — están pensados para repartirse.
drop policy if exists "enlaces de cobro visibles" on plan_checkout;
create policy "enlaces de cobro visibles" on plan_checkout for select using (true);

-- ⚠️ SOLO EL MENSUAL POR AHORA. El anual todavía no tiene plan creado en
-- OnePay, así que NO se inventa una fila: sin fila, la app cae a contacto y
-- dice que el enlace llega por correo. Una URL inventada llevaría a una página
-- de pago que no existe, justo en el momento de más intención de compra.
insert into plan_checkout (plan, ciclo, region, url) values
  ('completo', 'mensual', 'colombia',
   'https://pagos.onepay.la/plan/01a1455f-8679-708d-9459-860b639bcfeb'),
  ('completo', 'mensual', 'internacional',
   'https://pagos.onepay.la/plan/01a1458d-87e8-7157-8952-945fd5e68bd1')
on conflict (plan, ciclo, region) do update
  set url = excluded.url, actualizado_en = now();

comment on table plan_checkout is
  'Enlaces de OnePay por plan, ciclo y región. Sin fila = la app manda a contacto.';

-- ── 2. Desde qué país nos consumen ─────────────────────────────────────────
--
-- ⚠️ EL USER-AGENT NO DICE EL PAÍS. Lleva navegador, sistema y dispositivo —
-- ahí no hay geografía. El país lo da `x-vercel-ip-country`, que Vercel calcula
-- de la IP y añade a cada petición. Se guarda igualmente el user-agent, pero
-- como lo que es: en qué navegan, no desde dónde.
create table if not exists sesiones_pais (
  -- Un id aleatorio que vive en una cookie. No identifica a nadie por sí solo:
  -- sirve para no escribir una fila en cada carga de página.
  sesion_id  text primary key,

  user_id    uuid references profiles (id) on delete set null,

  -- ⚠️ NUNCA LA IP EN CLARO, igual que en `ojo_visitantes`. Para saber el país
  -- basta el país; guardar direcciones de gente que quizá ni tiene cuenta es
  -- recoger un dato personal sin motivo.
  huella     text not null,

  -- ISO-3166 alpha-2: 'CO', 'MX', 'PE'…
  pais       text not null,

  -- De dónde salió el dato. ⚠️ NO ES DECORATIVO: si un día la mayoría de las
  -- filas dicen 'defecto', la detección se rompió — y se sabrá mirando esto, no
  -- descubriéndolo por las ventas que no entran.
  fuente     text not null check (fuente in ('vercel', 'idioma', 'defecto')),

  user_agent text,

  creado_en  timestamptz not null default now(),
  visto_en   timestamptz not null default now()
);

alter table sesiones_pais enable row level security;
-- Sin políticas a propósito: solo la escribe el servidor (service_role). Nadie
-- más tiene por qué leer desde dónde se conectan las demás.

create index if not exists sesiones_pais_pais_idx on sesiones_pais (pais);
create index if not exists sesiones_pais_creado_idx on sesiones_pais (creado_en);

comment on table sesiones_pais is
  'País de cada sesión, deducido de la IP por Vercel. La huella es un hash: nunca la IP.';
