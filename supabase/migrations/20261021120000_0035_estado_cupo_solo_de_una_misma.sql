-- ============================================================================
-- 0035 · CADA ALUMNA SOLO PUEDE CONSULTAR SU PROPIO CUPO
--
-- Hallado por `supabase db advisors` en el pre-vuelo de producción (2026-10-21).
--
-- ⚠️ `estado_cupo(p_user_id)` ES `security definer` Y ACEPTABA CUALQUIER ID.
-- Cualquiera —incluso sin cuenta, por `/rest/v1/rpc/estado_cupo`— podía pasar el
-- id de otra persona y saber su plan y cuántas preguntas y fotos llevaba este
-- mes. No es un dato grave, pero es exactamente un IDOR: la puerta pregunta
-- "¿de quién?" y se cree lo que le dicen.
--
-- Ahora responde solo si `p_user_id` es quien llama, o si llama el servidor
-- (`service_role`, que no tiene `auth.uid()`). La única llamada de la app
-- (`lib/alumna.ts → cupoActual`) pasa el id de la propia sesión, así que no
-- cambia nada para ella. A un id ajeno le devuelve CERO filas: no un error que
-- confirme que ese id existe.
--
-- De paso, lo que advisors marcaba sin riesgo de romper nada:
--   · `crear_perfil_al_registrarse()` es una función de TRIGGER; no tiene por
--     qué poder llamarse por la API. Quitarle EXECUTE no afecta al trigger:
--     Postgres solo comprueba ese permiso al CREAR el trigger, no al dispararlo.
--   · `periodo_actual()` y `tocar_actualizada_el()` fijan su `search_path`.
--
-- ⚠️ NO SE TOCAN `tiene_acceso_de(uid)` NI `plan_efectivo(uid)`, aunque
-- advisors también los marca: las políticas RLS los llaman con el rol de quien
-- consulta, y quitarles EXECUTE dejaría a todas sin acceso. Lo que filtran es
-- un sí/no o el nombre del plan de un uuid que hay que conocer de antemano.
-- ============================================================================

create or replace function estado_cupo(p_user_id uuid)
returns table (
  plan             text,
  preguntas_usadas int,
  fotos_usadas     int,
  preguntas_limite int,
  fotos_limite     int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    plan_efectivo(p_user_id),
    coalesce(u.preguntas, 0),
    coalesce(u.fotos, 0),
    c.preguntas_mes,
    c.fotos_mes
  from plan_cupos c
  left join ojo_uso_mensual u
    on u.user_id = p_user_id and u.periodo = periodo_actual()
  where c.plan = plan_efectivo(p_user_id)
    -- Solo la propia alumna, o el servidor.
    and (p_user_id = (select auth.uid()) or (select auth.role()) = 'service_role');
$$;

revoke all on function estado_cupo(uuid) from public, anon;
grant execute on function estado_cupo(uuid) to authenticated, service_role;

revoke all on function crear_perfil_al_registrarse() from public, anon, authenticated;

alter function periodo_actual() set search_path = public;
alter function tocar_actualizada_el() set search_path = public;
