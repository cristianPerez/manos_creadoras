-- ============================================================================
-- 0045 · EL HISTORIAL DE PRECIOS DICE QUIÉN HIZO EL CAMBIO
--
-- En la 0044 la función del trigger era `security definer`, así que
-- `current_user` era siempre su dueño (`postgres`) y la columna `cambiado_por`
-- no distinguía nada. Sin `security definer` corre con el rol de quien hace el
-- UPDATE: `service_role` cuando es `npm run precio:cambiar` (o la app) y
-- `postgres` cuando alguien lo cambió a mano desde el editor SQL del panel.
-- Los dos roles ya pueden escribir en `plan_checkout_historial`.
-- ============================================================================

create or replace function registrar_cambio_de_cobro() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.url is distinct from old.url or new.precio_usd is distinct from old.precio_usd then
    insert into plan_checkout_historial
      (plan, ciclo, region, url_anterior, url_nueva, precio_anterior, precio_nuevo, cambiado_por)
    values
      (new.plan, new.ciclo, new.region, old.url, new.url, old.precio_usd, new.precio_usd, current_user);
  end if;
  return new;
end;
$$;
