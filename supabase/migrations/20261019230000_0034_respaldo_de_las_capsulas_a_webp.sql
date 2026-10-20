-- ============================================================================
-- 0034 · EL RESPALDO DE LAS CÁPSULAS, A WEBP
--
-- ⚠️ ESTO ARREGLA ALGO QUE ROMPÍ EN LA 0033, y conviene dejarlo escrito.
--
-- Las cinco cápsulas no tienen foto propia: toman prestada la portada de un
-- bolso (`seed-capsulas.mjs` la arma como `/images/bolso-<slug>.jpg`). Al
-- convertir todas las portadas a WebP y borrar los `.jpg`, esas cinco rutas
-- quedaron apuntando a archivos que ya no existen y los círculos del home se
-- quedaron NEGROS. Lo detectó Cristian al verlo.
--
-- Dos cosas, no una:
--
-- 1. EL CÍRCULO YA NO ENSEÑA ESTO. Desde el 2026-10-19 enseña un fotograma
--    DEL PROPIO VIDEO de la cápsula, que es lo que la alumna espera ver:
--    hasta la 0030 las cápsulas no tenían video y por eso se recurrió a la
--    foto de un bolso cualquiera —"El hilo correcto" enseñaba Brillo Lunar—.
--    El `seed-capsulas.mjs` ya lo llamaba "provisional" en su comentario.
--
-- 2. PERO EL RESPALDO TIENE QUE SEGUIR SIRVIENDO. La miniatura la sirve el
--    CDN de imágenes de Bunny, que tiene SU PROPIA lista de dominios
--    permitidos —distinta de la del reproductor— y bloquea localhost con un
--    403. Si el respaldo apunta a un `.jpg` borrado, el fallo deja de ser
--    "se ve una foto prestada" y pasa a ser "se ve un agujero negro".
--
-- Por eso esta migración no borra `portada_url`: la corrige.
-- ============================================================================

update capsulas set portada_url = '/images/bolso-cristal-brillante.webp' where orden = 1;
update capsulas set portada_url = '/images/bolso-brillo-lunar.webp'      where orden = 2;
update capsulas set portada_url = '/images/bolso-perla-tejida.webp'      where orden = 3;
update capsulas set portada_url = '/images/bolso-gota-de-rocio.webp'     where orden = 4;
update capsulas set portada_url = '/images/bolso-marfil-elegante.webp'   where orden = 5;
