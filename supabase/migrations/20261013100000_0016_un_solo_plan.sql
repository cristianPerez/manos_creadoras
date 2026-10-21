-- ============================================================================
-- 0016 · UN SOLO PLAN
--
-- Decisión de Cristian (2026-10-13): se deja de vender en tres niveles. Hay UN
-- plan, con dos formas de pagarlo — cada mes o una vez al año.
--
-- ⚠️ POR QUÉ ESTO ES UNA MIGRACIÓN Y NO UN CAMBIO DE PRECIOS EN EL CÓDIGO.
-- Los tres planes no vivían solo en `lib/planes.ts`: están en el `check` de
-- `membresias.plan`, en las filas de `plan_cupos` y en todo lo que pregunta
-- "¿de qué plan es?". Cambiar el precio en el código y dejar la base con tres
-- nombres habría dejado una base que acepta planes que ya no se venden — y el
-- día que alguien escriba 'maestra' a mano, nadie lo detendría.
--
-- QUÉ PASA CON QUIEN YA TIENE PLAN: las membresías de 'creadora' y 'maestra'
-- pasan a 'completo' conservando su `vence_el`. Nadie pierde acceso ni días
-- pagados. Es lo que corresponde: compraron "el curso", y el curso ahora es uno.
-- ============================================================================

-- ── 1. Los cupos del Ojo Experto ───────────────────────────────────────────
--
-- Dos filas donde había tres:
--   'gratis'   — tiene cuenta, no ha pagado. Hereda los números de 'aprendiz'.
--   'completo' — pagó. Hereda los de 'maestra', los más altos: el plan único se
--                vende como "todo incluido", así que no puede dar menos que el
--                más caro de antes.
alter table plan_cupos drop constraint if exists plan_cupos_plan_check;

insert into plan_cupos (plan, preguntas_mes, fotos_mes)
values ('gratis', 3, 1), ('completo', 600, 60)
on conflict (plan) do update
  set preguntas_mes = excluded.preguntas_mes,
      fotos_mes     = excluded.fotos_mes;

delete from plan_cupos where plan in ('aprendiz', 'creadora', 'maestra');

alter table plan_cupos
  add constraint plan_cupos_plan_check check (plan in ('gratis', 'completo'));

-- ── 2. Las membresías que ya existen ───────────────────────────────────────
alter table membresias drop constraint if exists membresias_plan_check;

update membresias set plan = 'completo' where plan in ('creadora', 'maestra');
update membresias set plan = 'gratis'   where plan = 'aprendiz';

alter table membresias alter column plan set default 'gratis';
alter table membresias
  add constraint membresias_plan_check check (plan in ('gratis', 'completo'));

-- ── 3. `plan_efectivo` devuelve los nombres nuevos ─────────────────────────
--
-- Conserva su nombre y su firma a propósito: es la frontera entre "cómo se
-- guarda el plan" y "quién ve qué", y cambiarle el nombre obligaría a tocar las
-- seis llamadas repartidas por el código. Solo cambia por dentro.
create or replace function plan_efectivo(uid uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_plan   text;
  v_estado text;
  v_vence  timestamptz;
begin
  select plan, estado, vence_el into v_plan, v_estado, v_vence
  from membresias where user_id = uid;

  -- Sin fila, o con la fecha pasada, se cae al suelo: cuenta sin plan.
  if v_plan is null then return 'gratis'; end if;
  if v_plan = 'gratis' then return 'gratis'; end if;

  -- ⚠️ CANCELADA NO ES LO MISMO QUE VENCIDA. Quien cancela conserva el acceso
  -- hasta el final del período que ya pagó; solo cuando esa fecha pasa baja a
  -- 'gratis'. Cortarle el día que cancela sería cobrarle un mes y no darlo.
  if v_vence is not null and v_vence < now() then return 'gratis'; end if;
  if v_estado not in ('activa', 'cancelada') then return 'gratis'; end if;

  return 'completo';
end;
$$;

revoke all on function plan_efectivo(uuid) from public, anon;
grant execute on function plan_efectivo(uuid) to authenticated, service_role;

comment on function plan_efectivo(uuid) is
  'El plan que vale HOY: gratis o completo. Desde 0016 hay un solo plan de pago.';
