-- ============================================================================
-- 0038 · COLOMBIA PAGA POR WHATSAPP; EL RESTO DEL MUNDO, POR ONEPAY
--
-- Decisión de Cristian el 2026-11-01. Quien entra desde Colombia ya no va al
-- checkout: va a una conversación de WhatsApp donde se coordina el pago a mano.
-- Fuera de Colombia no cambia nada — siguen los planes de OnePay.
--
-- ⚠️ ESTO NO NECESITÓ CÓDIGO NUEVO PARA EL ENLACE, y conviene saber por qué:
-- la tabla ya separaba `colombia` de `internacional` desde la 0018, y los
-- botones leen la fila que toca según el país que da Vercel. Solo cambia a
-- dónde apunta la fila de Colombia. (El TEXTO de los botones sí cambió: un
-- botón que promete "Pago seguro con OnePay" y abre WhatsApp es una mentira.)
--
-- Por qué el enlace vive aquí y no en el código: Elizabeth o Cristian pueden
-- cambiar el número o el mensaje sin desplegar nada.
--
-- ⚠️ EL MENSAJE NO LLEVA EL PRECIO, a propósito. Si lo llevara, el día que
-- cambie la tarifa —ya pasó el 2026-10-31— cada conversación entraría con una
-- cifra vieja escrita por la propia alumna, y eso se discute después.
--
-- ⚠️ ESTA MIGRACIÓN SÍ VA A LAS DOS BASES y está bien: el número de WhatsApp
-- es el mismo en QA y en producción. Es la excepción a lo que avisa el ESTADO
-- sobre los enlaces de QA, que son los de OnePay en modo prueba y siguen
-- intactos en su fila `internacional`.
-- ============================================================================

update plan_checkout
   set url = 'https://wa.me/573154940311?text='
             || 'Hola%2C%20quiero%20inscribirme%20al%20plan%20mensual%20del%20curso%20de%20bolsos.%20%C2%BFC%C3%B3mo%20hago%20el%20pago%3F',
       actualizado_en = now()
 where plan = 'completo' and ciclo = 'mensual' and region = 'colombia';

update plan_checkout
   set url = 'https://wa.me/573154940311?text='
             || 'Hola%2C%20quiero%20inscribirme%20al%20plan%20anual%20del%20curso%20de%20bolsos.%20%C2%BFC%C3%B3mo%20hago%20el%20pago%3F',
       actualizado_en = now()
 where plan = 'completo' and ciclo = 'anual' and region = 'colombia';
