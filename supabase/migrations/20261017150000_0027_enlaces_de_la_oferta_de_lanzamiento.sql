-- ============================================================================
-- 0027 · LOS ENLACES DE LA OFERTA DE LANZAMIENTO
--
-- Cierra el desajuste que llevaba abierto desde el 2026-10-17: la app anunciaba
-- US$9,99 / US$80 y la pasarela seguía cobrando US$25 / US$250. Quien hubiera
-- pulsado "pagar" habría pagado 2,5 veces lo prometido.
--
-- Planes creados en OnePay (modo prueba, cuenta con el webhook):
--   Creadora Mensual · Lanzamiento — US$9.99 · Mensual · Ilimitado
--   Creadora Anual  · Lanzamiento — US$80.00 · Mensual · 12 ciclos
--
-- ⚠️ "Mensual · 12 ciclos" ES EL PLAN ANUAL, por contraintuitivo que se lea en
-- el panel. Lo confirmó el dueño de OnePay a Cristian el 2026-10-16: frecuencia
-- y número se leen juntos, así que son 12 meses = cada año. NO son doce cobros
-- de US$80. Queda escrito porque quien lo mire va a sospechar lo mismo.
--
-- ⚠️ NINGUNO LLEVA PERÍODO DE PRUEBA, a diferencia del anual viejo, que tenía 7
-- días sin que nadie lo hubiera decidido y chocaba con la garantía de 7 días
-- que ya promete la app. Aquí se cobra al contratar, que es lo que dice el copy.
--
-- Los planes anteriores (US$25 / US$250) NO se borran: siguen siendo el precio
-- normal, el que se cobra cuando la ventana de 24h de alguien ya venció. Lo que
-- falta —y queda pendiente— es que `plan_checkout` distinga oferta de normal;
-- hoy solo guarda un enlace por ciclo y región.
-- ============================================================================

update plan_checkout
   set url = 'https://pagos.onepay.la/plan/01a14b90-305d-7242-b9f4-10a336673e50',
       actualizado_en = now()
 where plan = 'completo' and ciclo = 'mensual';

update plan_checkout
   set url = 'https://pagos.onepay.la/plan/01a14b90-adb4-71fb-8d2c-19affbc4ad14',
       actualizado_en = now()
 where plan = 'completo' and ciclo = 'anual';
