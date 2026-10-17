-- ============================================================================
-- 0024 · LAS ALUMNAS QUE PAGAN NO TENÍAN ACCESO
--
-- ⚠️ EL PEOR BUG POSIBLE DE ESTA APP, Y DEL MISMO ORIGEN QUE LA 0023.
--
-- `tiene_acceso_de()` —la función que decide si alguien puede ver los videos—
-- seguía preguntando por los planes que la 0016 borró:
--
--     and m.plan in ('creadora', 'maestra')
--
-- Desde el 2026-10-13 el plan de pago se llama 'completo'. Ningún plan se llama
-- ya 'creadora' ni 'maestra', así que esa condición NUNCA se cumplía: la
-- función devolvía `false` para TODO el mundo, incluida una alumna con la
-- membresía activa y pagada hasta diciembre.
--
-- Traducido: alguien pagaba US$250, entraba, y seguía viendo el candado en
-- todos los bolsos.
--
-- No se detectó porque la 0016 sí actualizó `plan_efectivo()` —que es la que
-- usan los cupos del Ojo Experto— y esa parte funcionaba. El acceso al catálogo
-- usa esta otra, y se quedó atrás.
--
-- Encontrado el 2026-10-16 revisando la pantalla "Mi plan": a una alumna de
-- prueba con membresía activa le aparecía la pantalla de venta.
--
-- LECCIÓN, por si vuelve a cambiarse el nombre de un plan: hay que repasar
-- TODAS las funciones que nombran planes, no solo la que uno tiene delante.
-- ============================================================================

create or replace function tiene_acceso_de(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from membresias m
    where m.user_id = uid
      -- 'completo' es el único plan de pago desde la 0016.
      and m.plan = 'completo'
      -- 'cancelada' SIGUE contando mientras no llegue `vence_el`: ya pagó ese
      -- mes. Lo que corta el acceso es la fecha, no el gesto de cancelar.
      and m.estado in ('activa', 'cancelada')
      and (m.vence_el is null or m.vence_el > now())
  );
$$;
