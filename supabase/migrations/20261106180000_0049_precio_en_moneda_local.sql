-- ============================================================================
-- 0049 · CADA PAÍS PAGA EN SU MONEDA (2026-11-06, pedido de Cristian)
--
-- Hasta hoy todo el mundo veía y pagaba en dólares: el mismo plan de OnePay
-- para Colombia y para el resto. En el pago, OnePay enseña "$14.60" sin decir
-- "USD", y una colombiana no sabe si son pesos. Desde ahora:
--
--   · Colombia  → plan de OnePay en COP, precio en pesos colombianos.
--   · México    → plan de OnePay en MXN, precio en pesos mexicanos.
--   · El resto  → como siempre, USD.
--
-- ⚠️ DOS COLUMNAS GENÉRICAS (`moneda`, `precio`) Y UNA FILA POR PAÍS, NO
-- `precio_cop` / `url_cop` / `precio_mxn` / `url_mxn`. La tabla se diseñó así
-- desde la 0018: abrir Perú mañana es INSERTAR una fila, no otra migración ni
-- tocar cada consulta. Cristian lo aprobó así el 2026-11-06.
--
-- `precio_usd` SE QUEDA: en las filas en USD es el precio; en las de COP/MXN
-- es su equivalente en dólares (lo que cuesta el mismo plan fuera), para que
-- los informes puedan sumar ventas de países distintos en una sola moneda.
--
-- ⚠️ MÉXICO NACE COPIANDO "INTERNACIONAL" (USD). Así, mientras no exista su
-- plan en MXN, México se comporta exactamente como hoy. Lo mismo Colombia:
-- sigue en USD hasta que `npm run plan:onepay -- <ciclo> <precio> --moneda COP`
-- cree su plan en pesos y apunte su fila.
-- ============================================================================

-- 1. La región México.
alter table plan_checkout drop constraint if exists plan_checkout_region_check;
alter table plan_checkout
  add constraint plan_checkout_region_check
  check (region in ('colombia', 'mexico', 'internacional'));

-- 2. La moneda y el precio en esa moneda.
alter table plan_checkout
  add column if not exists moneda text not null default 'USD'
    check (moneda in ('USD', 'COP', 'MXN'));
alter table plan_checkout
  add column if not exists precio numeric(12, 2) check (precio > 0);

comment on column plan_checkout.moneda is
  'En qué moneda cobra el plan de OnePay de `url`: USD, COP o MXN.';
comment on column plan_checkout.precio is
  'Lo que cobra el plan de `url`, en `moneda`. Es lo que enseña la web. Se cambia con `npm run plan:onepay`.';
comment on column plan_checkout.precio_usd is
  'En filas USD, el precio. En filas COP/MXN, su equivalente en dólares (el precio del plan internacional), solo para informes.';

-- Las filas que ya hay están en USD: su precio es el de siempre.
update plan_checkout set precio = precio_usd where precio is null and moneda = 'USD';

-- 3. México arranca igual que internacional.
insert into plan_checkout (plan, ciclo, region, url, precio_usd, onepay_plan_id, moneda, precio)
select plan, ciclo, 'mexico', url, precio_usd, onepay_plan_id, moneda, precio
  from plan_checkout
 where region = 'internacional'
on conflict (plan, ciclo, region) do nothing;

-- 4. El historial también recuerda moneda y precio local.
alter table plan_checkout_historial add column if not exists moneda_anterior text;
alter table plan_checkout_historial add column if not exists moneda_nueva text;
alter table plan_checkout_historial add column if not exists precio_local_anterior numeric(12, 2);
alter table plan_checkout_historial add column if not exists precio_local_nuevo numeric(12, 2);

create or replace function registrar_cambio_de_cobro() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.url is distinct from old.url
     or new.precio_usd is distinct from old.precio_usd
     or new.precio is distinct from old.precio
     or new.moneda is distinct from old.moneda then
    insert into plan_checkout_historial
      (plan, ciclo, region, url_anterior, url_nueva, precio_anterior, precio_nuevo,
       onepay_plan_id_anterior, cambiado_por,
       moneda_anterior, moneda_nueva, precio_local_anterior, precio_local_nuevo)
    values
      (new.plan, new.ciclo, new.region, old.url, new.url, old.precio_usd, new.precio_usd,
       old.onepay_plan_id, current_user,
       old.moneda, new.moneda, old.precio, new.precio);
  end if;
  return new;
end;
$$;
