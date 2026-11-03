-- ============================================================================
-- 0043 · NUEVOS PRECIOS: US$14,70 AL MES Y US$97 AL AÑO (antes 19,70 / 117)
--
-- Cristian lo decidió el 2026-11-03. En OnePay un plan NO se edita de precio:
-- se crearon dos planes nuevos en MODO REAL (producción), los dos en USD, 0% de
-- impuesto, sin período de prueba y cobros ilimitados:
--
--   Mensual US$14.70   01a1a209-8a1b-72be-95a5-7d51cc9b4dea   (id interno `completo-mensual-1470`)
--   Anual   US$97.00   01a1a20a-42c5-73d4-8085-9af8eb9b1146   (id interno `completo-anual-97`)
--
-- Se llaman "Membresía Manos Creadoras · Mensual/Anual", ya sin "bolsos de
-- perlas" (la oferta son proyectos desde el 2026-11-02).
--
-- ⚠️ EN QA NO CAMBIA NADA, Y A PROPÓSITO (pedido de Cristian: no crear planes
-- nuevos en modo pruebas). Por eso el update NO pisa la fila sin más: solo
-- sustituye las que todavía apuntan a los planes REALES viejos. QA apunta a
-- planes de modo prueba (`01a193ae-cdcc…` y `01a19ca4-e422…`), así que ahí el
-- WHERE no encuentra nada y sus enlaces quedan como estaban. Consecuencia
-- aceptada: en QA la página anuncia 14,70 / 97 y el checkout de prueba cobra
-- 19,70 / 117 (solo tarjetas de prueba, sin dinero real).
--
-- Los planes viejos de producción (US$19,70 `01a192d6-6925…` y US$117
-- `01a19ca5-bda1…`) NO se archivan aquí ni en el panel: quien ya pagó conserva
-- su precio, y archivar en OnePay es irreversible. Lo decide Cristian.
--
-- El precio que se ENSEÑA vive en `lib/planes.ts` (`PRECIOS`); este archivo
-- solo cambia a dónde lleva el botón. Los dos se cambian a la vez.
-- ============================================================================

update plan_checkout
   set url = 'https://pagos.onepay.la/plan/01a1a209-8a1b-72be-95a5-7d51cc9b4dea',
       actualizado_en = now()
 where plan = 'completo'
   and ciclo = 'mensual'
   and url = 'https://pagos.onepay.la/plan/01a192d6-6925-7101-bef2-40c9e0ffb994';

update plan_checkout
   set url = 'https://pagos.onepay.la/plan/01a1a20a-42c5-73d4-8085-9af8eb9b1146',
       actualizado_en = now()
 where plan = 'completo'
   and ciclo = 'anual'
   and url = 'https://pagos.onepay.la/plan/01a19ca5-bda1-7234-b06b-f7d99f194424';
