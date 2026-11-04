-- ============================================================================
-- 0046 · EL ID DEL PLAN DE ONEPAY, GUARDADO EN SU FILA (2026-11-04, pedido de Cristian)
--
-- Para borrar el plan viejo al cambiar el precio (`npm run plan:onepay`) hacía
-- falta su id, y se sacaba recortando la URL. Ahora se guarda tal cual lo
-- devuelve la API al crearlo, y se borra directamente con él.
--
-- Se rellena desde la URL actual (todas son https://pagos.onepay.la/plan/<id>),
-- así que funciona igual en QA y en producción.
-- ============================================================================

alter table plan_checkout add column if not exists onepay_plan_id text;

update plan_checkout
   set onepay_plan_id = substring(url from '/plan/([0-9a-f-]{36})$')
 where onepay_plan_id is null;

comment on column plan_checkout.onepay_plan_id is
  'Id del plan en OnePay (el de `url`). Lo escribe `npm run plan:onepay`; con él se borra el plan cuando se reemplaza.';

alter table plan_checkout_historial add column if not exists onepay_plan_id_anterior text;

-- El historial también guarda el id del plan que se reemplazó.
create or replace function registrar_cambio_de_cobro() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.url is distinct from old.url or new.precio_usd is distinct from old.precio_usd then
    insert into plan_checkout_historial
      (plan, ciclo, region, url_anterior, url_nueva, precio_anterior, precio_nuevo,
       onepay_plan_id_anterior, cambiado_por)
    values
      (new.plan, new.ciclo, new.region, old.url, new.url, old.precio_usd, new.precio_usd,
       old.onepay_plan_id, current_user);
  end if;
  return new;
end;
$$;
