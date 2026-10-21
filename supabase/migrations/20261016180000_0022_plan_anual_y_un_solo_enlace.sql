-- ============================================================================
-- 0022 · EL PLAN ANUAL, Y UN SOLO ENLACE PARA TODO EL MUNDO
--
-- Dos cambios que van juntos porque son la misma decisión: qué enlace ve cada
-- quien al pulsar "pagar".
--
-- ── 1. YA HAY PLAN ANUAL ───────────────────────────────────────────────────
-- La 0018 dejó el anual sin fila a propósito, porque el plan no existía en
-- OnePay y una URL inventada habría roto el momento de más intención de compra.
-- Ya existe: "Creadora Anual", US$250.
--
-- ⚠️ EN EL PANEL SE LEE "Frecuencia: Mensual · Ciclos: 12" Y ASUSTA, porque
-- parece "$250 cada mes, doce veces" = $3.000. NO lo es: según el dueño de
-- OnePay (confirmado por Cristian el 2026-10-16 hablando con él), esos dos
-- campos se leen juntos como "cada 12 meses". Se deja escrito aquí porque la
-- próxima persona que lo mire va a sospechar exactamente lo mismo.
--
-- ⚠️ ESE PLAN TIENE 7 DÍAS DE PRUEBA y el mensual no. Quien contrate el anual
-- no paga hoy: paga a los 7 días. La app todavía NO lo dice (ver ESTADO.md).
--
-- ── 2. COLOMBIA E INTERNACIONAL APUNTAN AL MISMO SITIO ─────────────────────
-- Decisión de Cristian: por ahora, un solo enlace para todos los países.
--
-- Y además hoy es lo único correcto: el enlace "colombiano" que había aquí
-- (`01a1455f…`) NO está en la cuenta de OnePay donde creamos el webhook. Un
-- pago hecho por ahí jamás nos avisaría, así que la alumna pagaría y se
-- quedaría sin acceso hasta que alguien lo viera a mano.
--
-- La estructura por región NO se elimina: el día que se abra una pasarela
-- colombiana de verdad, esto vuelve a ser dos filas distintas sin migrar nada.
-- ============================================================================

insert into plan_checkout (plan, ciclo, region, url) values
  ('completo', 'mensual', 'colombia',
   'https://pagos.onepay.la/plan/01a1458d-87e8-7157-8952-945fd5e68bd1'),
  ('completo', 'mensual', 'internacional',
   'https://pagos.onepay.la/plan/01a1458d-87e8-7157-8952-945fd5e68bd1'),
  ('completo', 'anual', 'colombia',
   'https://pagos.onepay.la/plan/01a14752-d97d-709e-a83c-f8459e4783cb'),
  ('completo', 'anual', 'internacional',
   'https://pagos.onepay.la/plan/01a14752-d97d-709e-a83c-f8459e4783cb')
on conflict (plan, ciclo, region) do update
  set url = excluded.url, actualizado_en = now();
