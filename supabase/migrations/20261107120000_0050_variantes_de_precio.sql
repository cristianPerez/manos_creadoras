-- ============================================================================
-- 0050 · TRES PRECIOS A LA VEZ: EL EXPERIMENTO A/B/C (2026-11-07, pedido de Cristian)
--
-- La flag `precio` de Flagsmith reparte a las visitantes en tres variantes:
--
--             Mensual    Anual
--   COP  A    59.900     359.900   (el de siempre)
--        B    49.900     299.900
--        C    39.900     239.900
--   MXN  A    269        1.599
--        B    225        1.349
--        C    179        1.069
--   USD  A    14,60      87,60
--        B    12,20      73,20
--        C    9,70       58,20
--
-- Cada precio es un plan distinto en OnePay (18 en total, 6 por variante), así
-- que cada variante necesita SUS filas: una por plan, ciclo, región y variante.
--
-- ⚠️ UNA COLUMNA `variante`, NO OTRA TABLA NI EL PRECIO DENTRO DE LA FLAG. El
-- precio que se enseña y el enlace que cobra siguen en LA MISMA FILA (la
-- regla de la 0044): la flag solo dice qué letra le tocó a cada quien, nunca
-- cuánto cuesta. Así nadie puede escribir en el panel de Flagsmith un precio
-- que OnePay no cobra.
--
-- Las filas que ya existen pasan a ser la variante "a" (el default). Las de
-- "b" y "c" las crea `npm run plan:onepay -- <ciclo> <precio> --variante=b`
-- DESPUÉS de crear y verificar su plan en OnePay. Mientras una variante no
-- tenga sus filas en una región, la app enseña ahí la "a" (`lib/checkout.ts`).
-- ============================================================================

alter table plan_checkout
  add column if not exists variante text not null default 'a'
    check (variante in ('a', 'b', 'c'));

comment on column plan_checkout.variante is
  'Variante del experimento de precio (flag `precio` de Flagsmith). "a" = el precio de siempre.';

-- La clave pasa a incluir la variante: la misma región y ciclo tienen ahora
-- hasta tres filas, una por precio.
alter table plan_checkout drop constraint if exists plan_checkout_pkey;
alter table plan_checkout add primary key (plan, ciclo, region, variante);

-- El historial también dice de qué variante era la fila que cambió.
alter table plan_checkout_historial add column if not exists variante text;

create or replace function registrar_cambio_de_cobro() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.url is distinct from old.url
     or new.precio_usd is distinct from old.precio_usd
     or new.precio is distinct from old.precio
     or new.moneda is distinct from old.moneda then
    insert into plan_checkout_historial
      (plan, ciclo, region, variante, url_anterior, url_nueva, precio_anterior, precio_nuevo,
       onepay_plan_id_anterior, cambiado_por,
       moneda_anterior, moneda_nueva, precio_local_anterior, precio_local_nuevo)
    values
      (new.plan, new.ciclo, new.region, new.variante, old.url, new.url, old.precio_usd, new.precio_usd,
       old.onepay_plan_id, current_user,
       old.moneda, new.moneda, old.precio, new.precio);
  end if;
  return new;
end;
$$;
