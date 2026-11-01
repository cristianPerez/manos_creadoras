-- ============================================================================
-- 0039 · SE DESHACE LA 0038: TODOS LOS PAÍSES VUELVEN A ONEPAY
--
-- La 0038 mandaba a Colombia a pagar por WhatsApp. Duró unas horas: Cristian
-- lo revirtió el mismo 2026-11-01. Vuelve a haber un solo camino de compra
-- para todo el mundo, la pasarela.
--
-- ⚠️ EL ENLACE SE COPIA DE LA FILA `internacional` DEL MISMO ENTORNO, no se
-- escribe a mano. Es lo único correcto aquí: en producción esa fila tiene los
-- planes reales y en QA los de modo prueba, así que una migración con la URL
-- escrita dejaría a QA apuntando a cobros de verdad —o a producción apuntando
-- a un plan de pruebas, que es peor—. Copiándola, cada base se arregla con lo
-- suyo.
--
-- La estructura de dos regiones NO se toca y sigue viva: el día que Colombia
-- vuelva a tener su propio cobro, basta cambiar estas dos filas.
-- ============================================================================

update plan_checkout AS c
   set url = i.url,
       actualizado_en = now()
  from plan_checkout AS i
 where c.region = 'colombia'
   and i.region = 'internacional'
   and i.plan = c.plan
   and i.ciclo = c.ciclo;
