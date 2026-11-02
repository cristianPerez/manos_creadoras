-- ============================================================================
-- 0040 · EL PLAN ANUAL BAJA A US$117 (antes US$167)
--
-- Cristian lo decidió el 2026-11-02. Como siempre en OnePay, un plan NO se
-- edita de precio: se crea uno nuevo y se deja de usar el anterior. Así que hay
-- un plan nuevo en cada modo del panel, los dos en USD, 0% de impuesto,
-- frecuencia "Anual" y cobros ilimitados:
--
--   MODO REAL (producción)  US$117.00
--     01a19ca5-bda1-7234-b06b-f7d99f194424   (id interno `completo-anual-117`)
--   MODO PRUEBAS (QA)       US$117.00
--     01a19ca4-e422-70ed-87e7-5fe8f247a1ac   (id interno `completo-anual-117`)
--
-- El plan viejo de US$167 (`01a192d6-d124…` en real) se archiva en el panel una
-- vez que esta migración ya corrió en producción, NO antes: archivarlo mientras
-- la base todavía sirve su enlace dejaría el botón del plan anual muerto
-- durante el rato que medie entre una cosa y la otra. Tenía 0 suscriptores, así
-- que archivarlo no afecta a ninguna alumna.
--
-- ⚠️ ESTA MIGRACIÓN LLEVA EL ENLACE REAL, el de producción, igual que la 0037 y
-- por el mismo motivo: los enlaces son configuración de cada entorno y el
-- esquema no puede saber en qué entorno corre. En QA se sobrescribe después con
-- el plan de modo prueba mediante un update de datos (ver el README de esta
-- carpeta y el aviso de ESTADO.md). Si alguna vez se ve el enlace REAL en QA,
-- es que ese update falta: QA estaría mandando a cobrar de verdad.
--
-- El mensual NO se toca: sigue en US$19,70 con su plan de siempre.
-- ============================================================================

update plan_checkout
   set url = 'https://pagos.onepay.la/plan/01a19ca5-bda1-7234-b06b-f7d99f194424',
       actualizado_en = now()
 where plan = 'completo'
   and ciclo = 'anual';
