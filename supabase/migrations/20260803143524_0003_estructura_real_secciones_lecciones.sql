-- La estructura real del curso (vista en el área de miembros) tiene DOS niveles:
-- 4 secciones → ~58 lecciones. Y no todo es video: hay PDFs, avisos y enlaces.
-- La tabla plana `modulos` no lo representaba.
-- Aplicada en la base el 2026-08-03 (version 20260803143524).

drop policy if exists "progreso propio: leer" on user_progress;
drop policy if exists "progreso propio: insertar" on user_progress;
drop policy if exists "progreso propio: borrar" on user_progress;
drop table if exists user_progress;
drop policy if exists "catalogo: leer si tiene acceso" on modulos;
drop table if exists modulos;

-- ── SECCIONES (los 4 grupos) ─────────────────────────────────
create table secciones (
  id        text primary key,          -- 's1'…'s4'
  numero    int  not null,
  titulo    text not null,             -- español
  titulo_en text,                      -- inglés (ya vienen bilingües en Hotmart)
  orden     int  not null
);

alter table secciones enable row level security;
create policy "secciones: leer si tiene acceso" on secciones
  for select using (tiene_acceso());

-- ── LECCIONES (videos, PDFs, avisos, enlaces) ────────────────
create table lecciones (
  id           text primary key,       -- 's2-l01'
  seccion_id   text not null references secciones(id) on delete cascade,
  numero       int  not null,
  titulo       text not null,
  titulo_en    text,
  -- No todo es video: la sección 1 son avisos/enlaces y la 4 trae PDFs.
  tipo         text not null default 'video'
                 check (tipo in ('video','pdf','enlace','texto')),
  duracion_seg int,                    -- null cuando no es video
  -- Identificador del contenido en Hotmart. Se llena cuando conectemos Hotmart;
  -- mientras esté vacío la app muestra el marcador de "video pendiente".
  hotmart_id   text,
  orden        int  not null
);

create index lecciones_seccion_idx on lecciones (seccion_id, orden);

alter table lecciones enable row level security;
create policy "lecciones: leer si tiene acceso" on lecciones
  for select using (tiene_acceso());

-- ── PROGRESO (ahora por lección) ─────────────────────────────
create table user_progress (
  user_id       uuid not null references profiles(id) on delete cascade,
  leccion_id    text not null references lecciones(id) on delete cascade,
  completado_at timestamptz not null default now(),
  primary key (user_id, leccion_id)
);

create index user_progress_user_idx on user_progress (user_id);

alter table user_progress enable row level security;

create policy "progreso propio: leer" on user_progress
  for select using ((select auth.uid()) = user_id);
create policy "progreso propio: insertar" on user_progress
  for insert with check ((select auth.uid()) = user_id);
create policy "progreso propio: borrar" on user_progress
  for delete using ((select auth.uid()) = user_id);
