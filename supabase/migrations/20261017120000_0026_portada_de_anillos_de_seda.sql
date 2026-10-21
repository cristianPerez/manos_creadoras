-- ============================================================================
-- 0026 · LA PORTADA DE ANILLOS DE SEDA
--
-- Este bolso estaba SIN portada a propósito desde el 2026-10-12, y conviene
-- dejar escrito por qué vuelve y con qué condición.
--
-- ⚠️ LA FOTO LLEVA LA MARCA DIOR A LA VISTA: la caja con el logo al fondo y los
-- dijes D-I-O-R colgando del asa. A este bolso se le cambió el nombre —de
-- "Bolso Dior" a "Anillos de Seda"— precisamente porque el original usaba una
-- marca ajena, así que esta portada devuelve esa marca justo donde se quitó, y
-- en la página que cobra.
--
-- Se advirtió a Cristian el 2026-10-17 con la foto delante y decidió usarla
-- igual, asumiendo el riesgo. Queda anotado aquí, no para discutirlo otra vez,
-- sino para que el día que llegue una foto limpia del mismo bolso se sepa que
-- SUSTITUIRLA es un cambio deseado y no una regresión.
--
-- `nombre_original` ('Bolso Dior') sigue guardado y NO se muestra en ninguna
-- pantalla: existe para que Elizabeth reconozca de qué bolso hablamos.
-- ============================================================================

update bolsos
   set portada_url = '/images/bolso-anillos-de-seda.jpg'
 where slug = 'anillos-de-seda';
