-- ============================================================================
-- Los 3 videos que se regalan: una propiedad del CATÁLOGO, no de cada alumna
--
-- POR QUÉ UNA COLUMNA Y NO UNA CONCESIÓN (la 0008). Se evaluaron las dos:
--
--   · Como concesión, regalar 3 videos obliga a crear filas para CADA cuenta
--     nueva, y el día que la dueña quiera regalar otro video habría que
--     reescribir las filas de todo el mundo — y decidir qué pasa con quien ya
--     tenía las viejas.
--   · Como columna, "qué se regala" es un dato del curso, que es lo que de
--     verdad es. Cambiar el regalo es un `update` de una fila.
--
-- Las dos cosas conviven sin pisarse: `accesos` responde "¿quién entra?" y
-- `es_libre` responde "¿qué se ve sin entrar?".
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. La marca
--
-- `default false` es deliberado: el contenido nuevo nace CERRADO. Al revés —que
-- una lección recién insertada fuera pública hasta que alguien se acordara de
-- taparla— es la clase de error que solo se descubre cuando ya se regaló el
-- curso entero.
-- ----------------------------------------------------------------------------

alter table lecciones
  add column es_libre boolean not null default false;

-- ----------------------------------------------------------------------------
-- 2. Las tres de entrada
--
-- Son las tres primeras de la SECCIÓN 2, no de la 1. La sección 1 es bienvenida,
-- comunidad y avisos: no enseña a tejer nada, así que de demostración no sirve —
-- quien la vea no sabrá si el curso es bueno. La técnica empieza en la 2.
--
-- Juntas son 1h21m de clase real (09:22 + 29:10 + 42:34). Es una demostración
-- de verdad, no un adelanto.
-- ----------------------------------------------------------------------------

update lecciones set es_libre = true
 where id in ('s2-l01', 's2-l02', 's2-l03');

-- ----------------------------------------------------------------------------
-- 3. La puerta se entreabre, no se quita
--
-- Sigue siendo la base la que decide (D12): desde el navegador no hay forma de
-- pedir una lección cerrada. Lo único que cambia es que ahora hay dos maneras
-- de que una lección se entregue.
-- ----------------------------------------------------------------------------

drop policy if exists "lecciones: leer si tiene acceso" on lecciones;
create policy "lecciones: libres o con acceso" on lecciones
  for select using (es_libre or tiene_acceso());

-- ⚠️ ESTA ES LA PARTE QUE SE OLVIDA Y ROMPE TODO. Las lecciones cuelgan de una
-- sección, y la pantalla necesita la sección para saber en qué parte del curso
-- está cada video y cómo titularlo. Si `secciones` siguiera cerrada, las tres
-- lecciones libres llegarían huérfanas: visibles pero sin dónde colocarlas, y
-- la pantalla se dibujaría vacía sin ningún error que lo explicara.
--
-- Se abre SOLO la sección que contiene alguna lección libre. Las demás siguen
-- cerradas, así que el índice del curso no se filtra: quien no ha pagado no
-- puede ni enumerar cuántas secciones hay.
drop policy if exists "secciones: leer si tiene acceso" on secciones;
create policy "secciones: con acceso, o si tiene alguna lección libre" on secciones
  for select using (
    tiene_acceso()
    or exists (
      select 1 from lecciones l
      where l.seccion_id = secciones.id
        and l.es_libre
    )
  );

-- El `exists` de arriba se ejecuta por cada sección candidata. Sin índice haría
-- un recorrido completo de `lecciones` cada vez; son pocas filas hoy, pero esta
-- consulta corre en cada carga de pantalla de cada visitante.
create index lecciones_libres_idx on lecciones (seccion_id) where es_libre;
