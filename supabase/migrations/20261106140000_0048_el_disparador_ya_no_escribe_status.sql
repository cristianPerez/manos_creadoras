-- ============================================================================
-- 0048 — EL DISPARADOR DEL REGISTRO YA NO ESCRIBE `status` (2026-11-06)
--
-- ⚠️ VA SIEMPRE JUNTO A LA 0047, EN LA MISMA SUBIDA. La 0047 borró
-- `profiles.status`, pero `crear_perfil_al_registrarse()` —el disparador que le
-- crea el perfil y la membresía gratis a cada cuenta nueva— seguía insertando
-- esa columna. Resultado inmediato, medido en QA justo después de aplicar la
-- 0047: crear una cuenta devolvía
--
--   500 unexpected_failure · "Database error creating new user"
--
-- O sea, exactamente el fallo de la migración 0023, por el mismo motivo:
-- cambiar la forma de `profiles`/`membresias` y dejar atrás la función que
-- escribe en ellas. La 0023 lo dejó avisado por escrito y aun así volvió a
-- pasar. Se escribe aquí otra vez, más corto: TODA migración que toque las
-- columnas de `profiles` o de `membresias` tiene que mirar esta función ANTES
-- de darse por terminada, y probar un registro de verdad después.
--
-- Lo encontró una prueba real (`npm run alumna:crear`), no una revisión del
-- código: es la clase de fallo que compila, pasa el lint y rompe la puerta de
-- entrada del negocio sin que nada lo diga.
-- ============================================================================

create or replace function crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo quién es. `status` se fue en la 0047: quien decide el acceso es
  -- `membresias` desde la 0014, y esta columna no la leía ya ninguna pantalla.
  insert into profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  -- 'gratis' es el suelo desde la 0016: tiene cuenta y todavía no ha pagado.
  -- Da el bolso gratis, las cápsulas y las preguntas de regalo al Ojo Experto.
  insert into membresias (user_id, plan, estado)
  values (new.id, 'gratis', 'activa')
  on conflict (user_id) do nothing;

  return new;
end;
$$;
