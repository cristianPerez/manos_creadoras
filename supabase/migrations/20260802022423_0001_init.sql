-- Manos Creadoras — esquema inicial
-- Modelo 1 (hard paywall) con SUSCRIPCIÓN mensual ($19.99) o anual ($199).
-- No hay usuarios gratis: el webhook de Hotmart crea la cuenta al primer pago.

-- ============================================================
-- PERFILES
-- ============================================================
create type membership_status as enum (
  'active',      -- al día, acceso completo
  'past_due',    -- falló el cobro — acceso completo durante la gracia (dunning), no cortar aún
  'cancelled',   -- canceló — acceso hasta fin del período pagado (ver access_until)
  'expired',     -- se agotaron los reintentos o venció el período — acceso CORTADO
  'refunded',    -- reembolsado — acceso CORTADO (terminal)
  'chargeback'   -- disputa — acceso CORTADO (terminal)
);

create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null unique,
  nombre            text,
  status            membership_status not null default 'active',
  plan              text check (plan in ('mensual','anual')),
  hotmart_tx        text,                       -- código de transacción de Hotmart
  hotmart_sub       text,                       -- código de suscripción (persiste entre cobros)
  first_paid_at     timestamptz,
  -- Hasta cuándo puede entrar. Al cancelar se fija al final del período ya pagado:
  -- el acceso NO se corta al instante (sería cobrarle un mes y quitárselo).
  access_until      timestamptz,
  -- Memoria del Ojo Experto sobre SU tejido (ej. "tiende a soltar la tensión en la base").
  -- Solo tejido — nada personal ni sensible.
  notas_tejido      text,
  created_at        timestamptz not null default now()
);

create index profiles_email_idx on profiles (email);

alter table profiles enable row level security;

-- Cada alumna ve y edita SOLO su perfil. (select auth.uid()) es la forma de alto rendimiento.
create policy "perfil propio: leer" on profiles
  for select using ((select auth.uid()) = id);
create policy "perfil propio: actualizar" on profiles
  for update using ((select auth.uid()) = id);

-- ============================================================
-- CURSOS Y MÓDULOS (catálogo — lectura para toda alumna con acceso)
-- ============================================================
create table modulos (
  id                text primary key,           -- 'm1', 'm2', …
  numero            int not null,
  titulo            text not null,
  duracion_min      int not null,
  hotmart_video_id  text,                       -- id del video en Hotmart Player
  orden             int not null
);

alter table modulos enable row level security;

-- Fuente ÚNICA de la verdad sobre "¿esta alumna puede entrar?".
-- Vive en SQL para que la regla no se pueda saltar desde el cliente.
-- - active   → sí
-- - past_due → sí (gracia de dunning: falló el cobro, no la echamos de inmediato)
-- - cancelled→ sí, pero solo hasta el final del período que ya pagó
-- - expired / refunded / chargeback → no
create or replace function tiene_acceso(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p
    where p.id = uid
      and (
        p.status in ('active', 'past_due')
        or (p.status = 'cancelled' and p.access_until is not null and p.access_until > now())
      )
  );
$$;

create policy "catálogo: leer si tiene acceso" on modulos
  for select using (tiene_acceso((select auth.uid())));

-- ============================================================
-- PROGRESO
-- ============================================================
create table user_progress (
  user_id       uuid not null references profiles(id) on delete cascade,
  modulo_id     text not null references modulos(id) on delete cascade,
  completado_at timestamptz not null default now(),
  primary key (user_id, modulo_id)
);

create index user_progress_user_idx on user_progress (user_id);

alter table user_progress enable row level security;

create policy "progreso propio: leer" on user_progress
  for select using ((select auth.uid()) = user_id);
create policy "progreso propio: insertar" on user_progress
  for insert with check ((select auth.uid()) = user_id);
create policy "progreso propio: borrar" on user_progress
  for delete using ((select auth.uid()) = user_id);

-- ============================================================
-- EL OJO EXPERTO — historial de consultas
-- ============================================================
create table ai_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  tipo        text not null check (tipo in ('texto','foto')),
  pregunta    text not null,
  respuesta   text,
  imagen_path text,                             -- ruta en Supabase Storage, si fue foto
  created_at  timestamptz not null default now()
);

create index ai_conversations_user_idx on ai_conversations (user_id, created_at desc);

alter table ai_conversations enable row level security;

create policy "consultas propias: leer" on ai_conversations
  for select using ((select auth.uid()) = user_id);
create policy "consultas propias: insertar" on ai_conversations
  for insert with check ((select auth.uid()) = user_id);

-- ============================================================
-- USO JUSTO MENSUAL (40 preguntas + 8 fotos, decidido en Sesión 1)
-- ============================================================
create table ai_usage (
  user_id    uuid not null references profiles(id) on delete cascade,
  periodo    text not null,                     -- 'YYYY-MM'
  preguntas  int not null default 0,
  fotos      int not null default 0,
  primary key (user_id, periodo)
);

alter table ai_usage enable row level security;

create policy "uso propio: leer" on ai_usage
  for select using ((select auth.uid()) = user_id);

-- ============================================================
-- WEBHOOK DE HOTMART — idempotencia y auditoría
-- ============================================================
create table processed_events (
  event_id     text primary key,                -- id único del evento de Hotmart
  event_type   text not null,
  payload_hash text,
  processed_at timestamptz not null default now()
);

create table webhook_log (
  id          bigserial primary key,
  event_id    text,
  type        text,
  result      text not null check (result in ('applied','duplicate','illegal','unauthorized','error')),
  received_at timestamptz not null default now()
);

create index webhook_log_received_idx on webhook_log (received_at desc);
create index webhook_log_result_idx   on webhook_log (result, received_at desc);

-- Estas dos tablas las escribe SOLO el servidor con la secret key (que salta RLS).
-- RLS activo + cero políticas = nadie las lee desde el cliente. Es intencional.
alter table processed_events enable row level security;
alter table webhook_log enable row level security;

-- ============================================================
-- CIRCUIT-BREAKER DE GASTO DE IA (evita la factura sorpresa)
-- ============================================================
create table ai_spend (
  dia        date primary key,
  usd        numeric(10,4) not null default 0
);

alter table ai_spend enable row level security;
