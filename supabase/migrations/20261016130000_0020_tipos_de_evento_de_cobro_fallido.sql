-- ============================================================================
-- 0020 · LOS TIPOS DE EVENTO QUE FALTABAN
--
-- ⚠️ ERROR CAZADO POR UNA PRUEBA, no por una alumna. La 0019 solo aceptaba
-- 'suscripcion.pagada', 'suscripcion.cancelada' y 'desconocido'. Al añadir en
-- TypeScript los eventos de cobro fallido —que el PANEL de OnePay ofrece aunque
-- su documentación no los mencione— el `check` de la tabla los rechazaba: la
-- ruta devolvía 500 y OnePay habría reintentado seis veces antes de desactivar
-- el endpoint.
--
-- La lección: un tipo en TypeScript y un `check` en Postgres son DOS listas que
-- hay que mover juntas. Lo que las mantiene honestas es la prueba que manda un
-- evento de cada clase.
-- ============================================================================

alter table webhook_eventos drop constraint if exists webhook_eventos_tipo_check;

alter table webhook_eventos
  add constraint webhook_eventos_tipo_check check (tipo in (
    'suscripcion.pagada',
    'suscripcion.cancelada',
    -- Le rebotó la tarjeta en la renovación. Es el que de verdad faltaba: sin
    -- él, quien deja de pagar conserva el acceso hasta que alguien lo note.
    'suscripcion.impagada',
    'suscripcion.vencida',
    'desconocido'
  ));
