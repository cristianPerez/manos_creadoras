-- ============================================================================
-- 0023 · NADIE PODÍA CREARSE UNA CUENTA
--
-- ⚠️ ESTO ESTABA ROTO EN PRODUCCIÓN DESDE EL 2026-10-13 Y NO SE VEÍA.
--
-- La migración 0016 (un solo plan) cambió los planes válidos de
-- ('aprendiz','creadora','maestra') a ('gratis','completo'): movió las
-- membresías existentes, rehízo `plan_cupos` y reescribió `plan_efectivo()`.
--
-- Se dejó UNA cosa atrás: `crear_perfil_al_registrarse()`, el disparador que le
-- da su membresía a cada cuenta nueva, seguía insertando 'aprendiz'. Ese valor
-- ya no pasa el `check` de la tabla, así que el registro entero fallaba con
--
--   new row for relation "membresias" violates check constraint
--   "membresias_plan_check"
--
-- Es decir: la app no podía captar ni un cliente nuevo. No se notó porque
-- TODAS las cuentas existentes se crearon antes del cambio, así que nada en el
-- uso diario lo tocaba. Apareció al intentar registrar una cuenta de prueba
-- para revisar la pantalla de planes.
--
-- Se arregla reescribiendo la función con el plan correcto. El resto —crear el
-- perfil, el `on conflict do nothing`— se deja exactamente igual.
-- ============================================================================

create or replace function crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, status)
  values (new.id, new.email, null)
  on conflict (id) do nothing;

  -- 'gratis' es el suelo desde la 0016: tiene cuenta y todavía no ha pagado.
  -- Da el bolso gratis, las cápsulas y 2 preguntas al Ojo Experto.
  insert into membresias (user_id, plan, estado)
  values (new.id, 'gratis', 'activa')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Por si quedó alguna cuenta a medias: perfil creado y membresía no, porque el
-- insert de la membresía reventó después del primero.
insert into membresias (user_id, plan, estado)
select p.id, 'gratis', 'activa'
  from profiles p
  left join membresias m on m.user_id = p.id
 where m.user_id is null
on conflict (user_id) do nothing;
