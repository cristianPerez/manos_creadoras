-- ============================================================================
-- 0044 · EL PRECIO VIVE JUNTO A SU ENLACE DE PAGO (2026-11-03, pedido de Cristian)
--
-- ⚠️ POR QUÉ. Hasta hoy el precio que se ENSEÑA estaba en el código
-- (`lib/planes.ts` → PRECIOS) y el que se COBRA en esta tabla (la URL del plan
-- de OnePay). Cambiar el precio eran cinco pasos en tres sitios, y si uno se
-- olvidaba la página anunciaba un precio y cobraba otro. Ahora los dos viven
-- en LA MISMA FILA: se cambian con un solo UPDATE, en el mismo instante, sin
-- desplegar. El código conserva PRECIOS solo como respaldo si esto falla.
--
-- Cómo se cambia un precio desde ahora: `npm run precio:cambiar` (verifica
-- contra la página de OnePay antes de escribir). Ver ESTADO.md.
--
-- ⚠️ EL RELLENO VA POR URL, NO POR ENTORNO. Cada fila recibe el precio que de
-- verdad cobra el plan al que apunta (comprobado en su página de OnePay el
-- 2026-11-03). Así en producción salen 14,70 / 97 y en QA, que apunta a planes
-- de MODO PRUEBA de 19,70 / 117, salen 19,70 / 117: QA enseña lo que cobra.
-- Una fila con una URL que no está en la lista se queda en NULL y la app usa
-- el respaldo del código.
-- ============================================================================

alter table plan_checkout
  add column if not exists precio_usd numeric(10, 2) check (precio_usd > 0);

comment on column plan_checkout.precio_usd is
  'Lo que cobra el plan de OnePay de `url`, en USD. Se enseña en toda la app. Cambiar con `npm run precio:cambiar`, que lo verifica contra OnePay.';

update plan_checkout set precio_usd = case url
    -- Producción, modo real
    when 'https://pagos.onepay.la/plan/01a1a209-8a1b-72be-95a5-7d51cc9b4dea' then 14.70
    when 'https://pagos.onepay.la/plan/01a1a20a-42c5-73d4-8085-9af8eb9b1146' then 97.00
    -- QA, modo prueba
    when 'https://pagos.onepay.la/plan/01a193ae-cdcc-721c-ae0a-7da7f8b2563d' then 19.70
    when 'https://pagos.onepay.la/plan/01a19ca4-e422-70ed-87e7-5fe8f247a1ac' then 117.00
    else precio_usd
  end;

-- ── El historial: quién cambió qué, y cuándo ──────────────────────────────
-- Lo escribe un TRIGGER y no el script: así queda constancia también de un
-- cambio hecho a mano desde el editor SQL del panel, que es justo el que nadie
-- documenta.
create table if not exists plan_checkout_historial (
  id               bigint generated always as identity primary key,
  plan             text not null,
  ciclo            text not null,
  region           text not null,
  url_anterior     text,
  url_nueva        text,
  precio_anterior  numeric(10, 2),
  precio_nuevo     numeric(10, 2),
  cambiado_por     text not null default current_user,
  cambiado_en      timestamptz not null default now()
);

alter table plan_checkout_historial enable row level security;
-- Sin políticas a propósito: solo lo lee y escribe el servidor (service_role).

create or replace function registrar_cambio_de_cobro() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.url is distinct from old.url or new.precio_usd is distinct from old.precio_usd then
    insert into plan_checkout_historial
      (plan, ciclo, region, url_anterior, url_nueva, precio_anterior, precio_nuevo)
    values
      (new.plan, new.ciclo, new.region, old.url, new.url, old.precio_usd, new.precio_usd);
  end if;
  return new;
end;
$$;

drop trigger if exists plan_checkout_historial_trg on plan_checkout;
create trigger plan_checkout_historial_trg
  after update on plan_checkout
  for each row execute function registrar_cambio_de_cobro();
