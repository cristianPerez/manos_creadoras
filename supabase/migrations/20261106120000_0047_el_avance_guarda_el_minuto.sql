-- ============================================================================
-- 0047 — EL AVANCE GUARDA EL MINUTO, Y SE LIMPIA LO MUERTO (2026-11-06)
--
-- Sale de una auditoría de las 26 tablas de producción pedida por Cristian.
-- Lo que se encontró, y lo que arregla cada bloque:
--
-- 1. `progreso` solo sabía "este video lo vio / no lo vio". Si dejaba un video
--    de 20 minutos a la mitad y volvía mañana, empezaba de cero. Ahora guarda
--    el SEGUNDO por donde iba, así que "retomar" es retomar de verdad.
--
-- 2. `progreso` tenía permiso para INSERTAR y BORRAR, pero NO para ACTUALIZAR
--    — y el código escribe con `upsert`. La primera marca entraba; volver a
--    tocar la misma fila la rechazaba Postgres. Nadie se enteraba nunca,
--    porque el marcado es automático y el código no mira el error. Con el
--    minuto, esa actualización pasa de ser un caso raro a ser LA operación
--    normal (una cada 15 s), así que sin este permiso nada de lo de arriba
--    funcionaría.
--
-- 3. `processed_events` y `webhook_log` llevaban vacías desde que nacieron y
--    no las nombra ninguna línea del código: las reemplazó `webhook_eventos`
--    en la migración 0019. Y seis columnas de `profiles` son de cuando el
--    cobro era Hotmart; desde la 0014 quien decide el acceso es `membresias`.
--
-- ⚠️ LO QUE NO SE BORRA, A PROPÓSITO: `membresias.pasarela`, `pasarela_id` y
-- `pais`. Están vacías en producción, pero NO están muertas — las escribe la
-- función `dar_membresia()`, que es la que usa el script de altas a mano.
-- Borrarlas obligaría a reescribir esa función, que toca el camino del dinero;
-- no entra en una limpieza. Igual `lecciones.duracion_seg`: está siempre vacía
-- porque el seed no la trae, pero el código la lee y el día que Elizabeth dé
-- las duraciones hay dónde ponerlas.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. El minuto por donde iba
--
-- ⚠️ `visto_at` PASA A SER OPCIONAL, y es el centro del cambio. Antes "existe
-- la fila" significaba "lo vio", porque la columna era `not null default now()`.
-- Ahora hay dos estados distintos y hacen falta los dos:
--   · fila con `visto_at` nulo  → lo empezó, va por el segundo N
--   · fila con `visto_at` puesto → lo terminó (80% o botón "Marcar como visto")
-- Es la misma separación que hace El Charcu con `last_second` / `completed_at`.
--
-- Quien cuente "videos vistos" tiene que filtrar `visto_at is not null` desde
-- hoy: contar filas a secas daría por terminado un video que apenas empezó.
-- (Lo hace `videosVistos()` en `lib/bolsos.ts`.)
--
-- Las filas que ya existen conservan su `visto_at`, así que nadie pierde nada.
-- ----------------------------------------------------------------------------
alter table progreso
  add column segundo integer not null default 0 check (segundo >= 0),
  add column actualizado_el timestamptz not null default now(),
  alter column visto_at drop not null,
  alter column visto_at drop default;

comment on column progreso.segundo is
  'Por dónde iba en el video, en segundos. Para retomar donde lo dejó.';
comment on column progreso.visto_at is
  'Cuándo lo dio por terminado. NULO mientras solo lo empezó.';
comment on column progreso.actualizado_el is
  'Último movimiento en este video. Es por donde se decide qué proyecto retomar.';

-- Para "el último proyecto en el que se movió algo", que es lo que ofrece la
-- tarjeta de retomar en /app. Sin este índice son todas sus filas en memoria.
create index progreso_user_actualizado_idx on progreso (user_id, actualizado_el desc);

-- ----------------------------------------------------------------------------
-- 2. El permiso que faltaba
--
-- `with check` además de `using`: `using` decide qué filas puede tocar y
-- `with check` cómo pueden quedar. Sin la segunda, podría mover una fila suya
-- al `user_id` de otra persona.
-- ----------------------------------------------------------------------------
create policy "progreso: cada alumna actualiza el suyo" on progreso
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- 3. Lo muerto
-- ----------------------------------------------------------------------------
drop table if exists processed_events;
drop table if exists webhook_log;

alter table profiles
  drop column if exists status,
  drop column if exists plan,
  drop column if exists hotmart_tx,
  drop column if exists hotmart_sub,
  drop column if exists first_paid_at,
  drop column if exists access_until;

-- El tipo solo existía para `profiles.status`.
drop type if exists membership_status;

-- Nunca la escribió nadie salvo el seed, que mandaba null: la fecha de
-- publicación de un bolso no se usa en ninguna pantalla.
alter table bolsos drop column if exists publicado_en;

comment on column profiles.nombre is
  'Como quiere que la llamemos. Lo escribe ella en Mi cuenta (2026-11-06); antes no había dónde.';
comment on column profiles.notas_tejido is
  'Lo que el Ojo Experto debe recordar de SU tejido. Lo escribe ella en Mi cuenta.';
