-- ============================================================================
-- 0033 · PORTADAS AL MÍNIMO, CUATRO BOLSOS MÁS Y UNA TRAMPA DE NOMBRES MENOS
--
-- Tres cosas en una, porque las tres tocan la misma columna.
--
-- ── 1. CUATRO BOLSOS QUE NO TENÍAN FOTO ────────────────────────────────────
--   cherry          ← la roja   (cereza)
--   zafiro-perlado  ← la azul   (zafiro)
--   boho            ← la rosa
--   silueta-nacar   ← el clutch de perlas con marco plateado
--
-- SIGUEN SIN FOTO DOS, y por motivos distintos que conviene no confundir:
--   · esmeralda      — no llegó ninguna foto verde. Falta la foto.
--   · celeste-calido — su único candidato era un MONEDERO, y Cristian decidió
--                      el 2026-10-19 que los llaveros y monederos del lote no
--                      son de los 16 bolsos del curso. Poner ahí la foto de
--                      otro producto sería enseñarle a la alumna algo que no
--                      es lo que va a tejer.
--
-- ⚠️ DEL LOTE QUEDARON FUERA, A PROPÓSITO: cuatro llaveros/monederos (no son
-- bolsos del curso) y un bolso corazón que lleva UNA PLACA CON LA MARCA
-- "MELANIA" bien visible. Lo de la placa es el mismo problema que acabó con la
-- foto de Dior en la 0031: marca ajena en una página que cobra.
--
-- ── 2. TODAS AL MÍNIMO QUE PIDE EL LAYOUT ──────────────────────────────────
-- 720×720, WebP calidad 65. Las catorce juntas pesan 640 KB (media 46 KB);
-- los originales sumaban unos 5 MB. A 720px sobra: el carrusel del home las
-- pinta a 351px en móvil y las tarjetas del catálogo a ~165px — incluso en
-- pantallas de densidad doble se sirven por debajo del original.
-- ⚠️ Si algún día crecen en pantalla, REGENERAR desde los originales. Estirar
-- estas se va a ver, y el grano de las perlas es lo primero que se rompe.
--
-- ── 3. LA TRAMPA DE NOMBRES ────────────────────────────────────────────────
-- ⚠️ `bolso-silueta-nacar.jpg` ERA LA FOTO DE **NÁCAR SOÑADO**, no de Silueta
-- Nácar. Son dos bolsos distintos con nombres parecidos, y ese archivo mal
-- llamado YA CAUSÓ UNA CONFUSIÓN ANTES (está anotado en `nota_portadas` del
-- seed: la foto estuvo asignada al bolso equivocado).
--
-- Al darle por fin foto propia a Silueta Nácar, habrían convivido
-- `bolso-silueta-nacar.webp` (Silueta Nácar) y `bolso-silueta-nacar.jpg`
-- (Nácar Soñado): la misma trampa, reconstruida y peor. Así que la foto de
-- Nácar Soñado pasa a llamarse `bolso-nacar-sonado.webp`, que es lo que
-- siempre debió ser.
--
-- Ya no queda ningún `.jpg`: las catorce portadas son WebP y cada archivo se
-- llama como su bolso.
-- ============================================================================

-- 1. Los cuatro que no tenían foto
update bolsos set portada_url = '/images/bolso-cherry.webp'         where slug = 'cherry';
update bolsos set portada_url = '/images/bolso-zafiro-perlado.webp' where slug = 'zafiro-perlado';
update bolsos set portada_url = '/images/bolso-boho.webp'           where slug = 'boho';
update bolsos set portada_url = '/images/bolso-silueta-nacar.webp'  where slug = 'silueta-nacar';

-- 3. La trampa de nombres: Nácar Soñado deja de usar el archivo de otro
update bolsos set portada_url = '/images/bolso-nacar-sonado.webp'   where slug = 'nacar-sonado';

-- Marfil Elegante era el último `.jpg` que quedaba
update bolsos set portada_url = '/images/bolso-marfil-elegante.webp' where slug = 'marfil-elegante';
