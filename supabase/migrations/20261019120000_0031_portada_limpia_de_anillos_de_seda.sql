-- ============================================================================
-- 0031 · LA PORTADA LIMPIA DE ANILLOS DE SEDA
--
-- Sustituye la foto que la migración 0026 puso advirtiendo de su problema:
-- llevaba LA MARCA DIOR A LA VISTA (el logo en la caja del fondo y los dijes
-- D-I-O-R colgando del asa), justo en el bolso al que se le cambió el nombre
-- —de "Bolso Dior" a "Anillos de Seda"— precisamente por usar una marca ajena.
-- Se usó igual porque no había otra, con el riesgo asumido y anotado.
--
-- La 0026 lo dejó escrito: «el día que llegue una foto limpia del mismo bolso,
-- SUSTITUIRLA es un cambio deseado y no una regresión». Ese día es hoy.
-- Cristian entregó la foto nueva el 2026-10-19.
--
-- Anillos de Seda es el PRIMER bolso del carrusel del home (`ORDEN_CARRUSEL`
-- en `app/page.tsx`), así que esta es la primera imagen que ve quien llega por
-- un anuncio. Era la peor de todas para llevar la marca de otro.
--
-- ⚠️ ESTA VEZ EL SEED TAMBIÉN SE ACTUALIZA (`supabase/seed/bolsos.json`).
-- La 0026 solo tocó la base, así que el seed seguía diciendo que este bolso
-- no tenía portada: quien corriera `npm run seed:bolsos` la BORRABA sin
-- enterarse. Era un pendiente anotado en ESTADO.md y se cierra aquí.
--
-- ⚠️ `nombre_original` ('Bolso Dior') sigue guardado y NO se muestra en
-- ninguna pantalla: existe para que Elizabeth reconozca de qué bolso hablamos.
-- ============================================================================

update bolsos
   set portada_url = '/images/bolso-anillos-de-seda.webp'
 where slug = 'anillos-de-seda';
