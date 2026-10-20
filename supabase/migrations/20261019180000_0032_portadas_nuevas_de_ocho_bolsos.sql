-- ============================================================================
-- 0032 · LAS PORTADAS NUEVAS DE OCHO BOLSOS
--
-- Cristian entregó ocho fotos de producto el 2026-10-19, todas con el mismo
-- tratamiento: fondo marrón, luz lateral y peana de travertino. Sustituyen a
-- las que había —capturas sueltas, de calidades distintas— y por primera vez
-- el carrusel del home se ve como una sola sesión de fotos y no como un
-- collage.
--
-- ⚠️ EL MAPEO FOTO→BOLSO LO CONFIRMÓ CRISTIAN. Se dedujo de los subtítulos del
-- catálogo (`SUBTITULOS` en `app/page.tsx`), que son lo único que distingue un
-- bolso de otro por escrito, y se le pasó para aprobar antes de tocar nada:
--
--   gota-de-rocio      ← correa de perlas al hombro ("Bandolera de perlas")
--   brillo-lunar       ← cierre de beso metálico    ("Boquilla metálica")
--   tornado-de-aurora  ← cristales tornasolados     ("Cristal tornasol")
--   coquett-clasico    ← cuentas tipo shamballa     ("Shamballa de 14 mm")
--   encantado-dorado   ← cuentas doradas
--   cristal-brillante  ← cristal facetado           ("Cristal facetado")
--   anillos-de-seda    ← anillos dorados en el asa  ("Asa de perlas y anillos")
--   perla-tejida       ← perlas de tamaños mezclados
--
-- ⚠️ ANILLOS DE SEDA CAMBIA DE FOTO POR SEGUNDA VEZ EN UN DÍA. La 0031 le puso
-- la primera foto limpia que llegó, para quitarle la marca Dior cuanto antes.
-- Esta le pone la que de verdad es suya: la de los anillos dorados colgando
-- del asa, que es lo que le da el nombre. No es una regresión ni un titubeo;
-- la 0031 era urgente y esta es la correcta.
--
-- ⚠️ TODAS PESAN ENTRE 32 Y 77 KB, frente a los 220-340 KB de los originales.
-- Se redimensionaron a 800×800 y se recomprimieron a WebP con `sharp`
-- (calidad 72). A 800px la foto sigue sobrada: el carrusel del home la pinta a
-- 351px en móvil y el listado del catálogo, más pequeña aún. Si algún día se
-- sube el tamaño en pantalla, hay que REGENERARLAS desde los originales, no
-- estirar estas.
--
-- ⚠️ EL SEED TAMBIÉN SE ACTUALIZA, como en la 0031: si solo se tocara la base,
-- `npm run seed:bolsos` borraría estas portadas sin que nadie se entere.
--
-- SIGUEN SIN FOTO, y no es un olvido: silueta-nacar, cherry, celeste-calido,
-- esmeralda, boho y zafiro-perlado. Hacen falta seis fotos más.
-- ============================================================================

update bolsos set portada_url = '/images/bolso-gota-de-rocio.webp'     where slug = 'gota-de-rocio';
update bolsos set portada_url = '/images/bolso-brillo-lunar.webp'      where slug = 'brillo-lunar';
update bolsos set portada_url = '/images/bolso-tornado-de-aurora.webp' where slug = 'tornado-de-aurora';
update bolsos set portada_url = '/images/bolso-coquett-clasico.webp'   where slug = 'coquett-clasico';
update bolsos set portada_url = '/images/bolso-encantado-dorado.webp'  where slug = 'encantado-dorado';
update bolsos set portada_url = '/images/bolso-cristal-brillante.webp' where slug = 'cristal-brillante';
update bolsos set portada_url = '/images/bolso-anillos-de-seda.webp'   where slug = 'anillos-de-seda';
update bolsos set portada_url = '/images/bolso-perla-tejida.webp'      where slug = 'perla-tejida';
