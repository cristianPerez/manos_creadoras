-- ============================================================================
-- 0041 · LOS ENLACES DE TEMU + EL PRIMER CLIC GRATIS DEL DIRECTORIO
--
-- Dos cosas que van juntas porque la segunda no tiene sentido sin la primera:
-- hasta hoy NINGÚN producto del directorio tenía enlace (la 0013 los dejó en
-- NULL esperando los de AliExpress, que nunca llegaron) y la pantalla enseñaba
-- un botón punteado de "Enlace pronto". Cristian pasó los de Temu el
-- 2026-11-02 y a la vez pidió que el directorio deje de ser una promesa: que se
-- vea entero, pero que el clic sea de quien paga, con el primero de regalo.
--
-- ── 1. LOS ENLACES ─────────────────────────────────────────────────────────
-- Son 13 enlaces para 33 productos, así que la mayoría se queda sin enlace
-- todavía. Aquí SOLO van los emparejamientos que no admiten duda: un enlace
-- puesto en el producto equivocado hace que una alumna compre el material que
-- no era, y eso es peor que no tener enlace.
--
-- Tres enlaces NO se usan y conviene que quede dicho para que nadie los busque:
--   · un segundo terciopelo (el genérico "por metro, cojín/mantel"), porque el
--     otro es más específico — 1 metro, 200 gsm, 170 cm de ancho;
--   · "100 piezas de cuentas acrílicas con patrones intrincados", que no
--     corresponde claramente a ninguno de los nuestros;
--   · un segundo cierre magnético (la versión UK), duplicado del que sí entra.
--
-- Y tres enlaces entran en MÁS de un producto a propósito, porque el producto
-- de Temu es un SET que cubre varias medidas: el cordón de nylon es de 0,2 a
-- 0,8 mm (cubre nuestros 0,45 · 0,6 · 0,7), el lote de 500 cuentas trae 8 y
-- 10 mm, y la colección de perlas viene en tamaños surtidos.
--
-- ── 2. EL PRIMER CLIC ──────────────────────────────────────────────────────
-- `directorio_clics` guarda qué productos abrió cada alumna. Sirve para dos
-- cosas: contar el clic de regalo y, de paso, saber qué material busca la
-- gente —que es justo lo que no se sabía del directorio—.
--
-- ⚠️ EL CONTROL VIVE EN EL SERVIDOR, NO EN LA PANTALLA, y es la parte que
-- importa: la URL de Temu NO se le manda al navegador de quien no tiene
-- derecho a usarla. Si se mandara y solo se escondiera el botón, cualquiera la
-- leería en el código fuente de la página y el muro sería decorativo. Por eso
-- la pantalla recibe `tiene_enlace` (un sí/no) y el salto pasa por
-- `/app/directorio/ir/<id>`, que llama a `abrir_enlace_directorio()` y redirige.
-- ============================================================================

-- ── 1. Los enlaces ─────────────────────────────────────────────────────────

update directorio_items set url = 'https://www.temu.com/co/1-pieza-de-1-metro-de-tela-de-terciopelo-de--200gsm-170cm-de-ancho-g-601100199974543.html' where id = 'terciopelo';

update directorio_items set url = 'https://www.temu.com/co/100-unidades-de-cuentas-de---de--acrilicas-de-10-mm-para-hacer-joyas-diy-suministros--y-manualidades-g-601099574957440.html' where id = 'cuentas-10';

update directorio_items set url = 'https://www.temu.com/co/kit-de-4-hojas-de-malla-plastica-para-bolsos-crochet-accesorios-para-tejer-bolsas-y-carteras-diy-suministros--para-crear-bolsillos--g-601101403854478.html' where id = 'malla-plastica';

update directorio_items set url = 'https://www.temu.com/magnetic-closure-for-purse-5040308317933-s.html' where id = 'cierre-magnetico';

update directorio_items set url = 'https://www.temu.com/co/juego-de-agujas-de-tejer-y-crochet-de-plastico-hechas-a--kit-de-herramientas-de-manualidades-diy-para--experimentados-y-principiantes-g-601099834564279.html' where id = 'aguja';

update directorio_items set url = 'https://www.temu.com/co/1-juego-ganchillos-con--de-silicona-agujas-de-tejer-de-metal-tijeras-anillo-circular-contador-cinta---herramientas-multifuncionales-para-hilos-en-costura-y-manualidades-en---g-601099547527779.html' where id = 'tijeras';

-- El cordón de nylon de Temu es 0,2-0,8 mm: cubre los tres grosores nuestros.
update directorio_items set url = 'https://www.temu.com/co/1-conjunto-de-hilo-de-nylon-para-bisuteria-0-2-0-8mm-cordon-transparente-no-elastico-para-hacer-joyeria-diy-pendientes-hechos-a--collares-pulseras-suministros-de-bisuteria--g-601099808253002.html' where id in ('nylon-045', 'nylon-06', 'nylon-07');

-- El lote de 500 cuentas facetadas transparentes trae 8 y 10 mm.
update directorio_items set url = 'https://www.temu.com/co/lote-de-500-cuentas-de-acrilico-surtidas-de-8mm-10mm-cuentas-facetadas-transparentes-multicolores-para-hacer-joyas-diy-collar-pulsera-accesorios-para-cadena-de-telefono-g-601099560168619.html' where id in ('cristal-8', 'cuentas-8');

-- La colección de perlas de plástico viene en tamaños surtidos.
update directorio_items set url = 'https://www.temu.com/co/coleccion-de-cuentas-de-perlas-de-plastico-falsas-para-hacer-joyeria-diy-tamanos---apagado-ideal-para-manualidades-collares-pulseras-aretes-decoraciones-paquete-al-por-mayor-g-601099598195474.html' where id in ('perlas-8', 'perlas-10');

-- ── 1b. La URL deja de ser pública ─────────────────────────────────────────
--
-- ⚠️ LA 0013 DEJÓ `directorio_items` CON "los lee cualquiera", columna `url`
-- incluida. Con eso, esconder el botón no servía de nada: cualquiera con la
-- clave pública (que va en el navegador, por diseño) podía pedirle a la API
-- `select=url` y llevarse los 13 enlaces sin cuenta ni membresía.
--
-- La fila sigue siendo pública —nombre, categoría, foto: es el escaparate—,
-- pero `url` ya no: se quita el permiso de leer la tabla entera y se devuelve
-- columna por columna, todas menos esa. La pantalla sabe si hay enlace por
-- `tiene_enlace`, que se calcula solo y no se puede desincronizar.

alter table directorio_items
  add column tiene_enlace boolean generated always as (url is not null) stored;

revoke select on directorio_items from anon, authenticated;
grant select (id, categoria_id, nombre, precio_referencia, imagen_url, tiene_enlace)
  on directorio_items to anon, authenticated;

-- ── 2. El primer clic ──────────────────────────────────────────────────────

create table directorio_clics (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  item_id    text not null references directorio_items (id) on delete cascade,
  creado_en  timestamptz not null default now()
);

/* Por `user_id` porque la pregunta que se hace siempre es "¿cuántos lleva
   ESTA alumna?", y la columna de la política va indexada como manda el SO. */
create index directorio_clics_user_idx on directorio_clics (user_id, creado_en desc);

alter table directorio_clics enable row level security;

/* Cada una ve los suyos y nada más (la pantalla los lee para saber cuál fue
   su enlace de regalo y dejárselo abierto). No hay policy de insert a
   propósito: lo escribe `abrir_enlace_directorio()`, después de comprobar el
   derecho. Si la alumna pudiera insertar sola, podría no registrar su clic
   —o registrar clics falsos— y el cupo dejaría de significar nada. */
create policy "directorio_clics: cada una ve los suyos" on directorio_clics
  for select using ((select auth.uid()) = user_id);

/**
 * ¿Puede esta alumna abrir un producto del directorio, y le queda regalo?
 *
 * Devuelve si tiene acceso de pago, cuántos productos DISTINTOS ha abierto ya
 * y cuántos le quedan de regalo. Cuenta productos distintos y no clics: volver
 * a abrir el mismo enlace dos veces es la misma consulta, y cobrárselo como dos
 * sería un castigo por cerrar la pestaña sin querer.
 *
 * ⚠️ SE APOYA EN `tiene_acceso_de()` Y NO MIRA `membresias` POR SU CUENTA. Esa
 * función ya sabe lo que aquí es fácil olvidar: que 'cancelada' SIGUE contando
 * mientras no llegue `vence_el` —ya pagó ese mes— y que el único plan de pago
 * es 'completo'. Duplicar esa lógica aquí significaría que el día que cambie,
 * el directorio se quede con la versión vieja y le cierre la puerta a alguien
 * que pagó.
 */
create or replace function estado_directorio()
returns table (con_acceso boolean, abiertos int, gratis_total int, gratis_restantes int)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_n   int  := 0;
begin
  -- Sin sesión no hay a quién contarle nada: le queda su clic de regalo.
  if v_uid is null then
    return query select false, 0, 1, 1;
    return;
  end if;

  select count(distinct c.item_id)::int into v_n
    from directorio_clics c
   where c.user_id = v_uid;

  return query select tiene_acceso_de(v_uid), v_n, 1, greatest(0, 1 - v_n);
end;
$$;

revoke all on function estado_directorio() from public;
grant execute on function estado_directorio() to anon, authenticated;

/**
 * Abre un producto del directorio: comprueba el derecho, apunta el clic y
 * devuelve la URL de Temu. Es lo ÚNICO que entrega una URL a quien no la tiene.
 *
 * Devuelve `estado`:
 *   'ok'         → `url` trae el enlace; el clic ya quedó apuntado.
 *   'sin-sesion' → nadie ha entrado: el regalo es de las cuentas, no de visitas.
 *   'sin-enlace' → el producto no existe o todavía no tiene enlace.
 *   'bloqueado'  → cuenta gratis que ya usó su regalo en OTRO producto.
 *
 * ⚠️ COMPROBAR Y APUNTAR VAN JUNTOS, BAJO UN CANDADO POR ALUMNA. Si la ruta
 * contara primero y apuntara después, dos toques rápidos en dos productos
 * distintos leerían los dos "0 abiertos" y se llevarían dos regalos. El
 * `pg_advisory_xact_lock` pone en fila los clics de la MISMA alumna y no frena
 * a nadie más.
 *
 * Volver a abrir el producto de regalo sigue funcionando: cuenta productos
 * distintos, no clics (ver `estado_directorio()`).
 */
create or replace function abrir_enlace_directorio(p_item text)
returns table (estado text, url text)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_url text;
  v_n   int;
begin
  if v_uid is null then
    return query select 'sin-sesion'::text, null::text;
    return;
  end if;

  select i.url into v_url from directorio_items i where i.id = p_item;
  if v_url is null then
    return query select 'sin-enlace'::text, null::text;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext('directorio_clics:' || v_uid::text));

  if not tiene_acceso_de(v_uid)
     and not exists (select 1 from directorio_clics c
                      where c.user_id = v_uid and c.item_id = p_item) then
    select count(distinct c.item_id)::int into v_n
      from directorio_clics c
     where c.user_id = v_uid;
    if v_n >= 1 then
      return query select 'bloqueado'::text, null::text;
      return;
    end if;
  end if;

  insert into directorio_clics (user_id, item_id) values (v_uid, p_item);
  return query select 'ok'::text, v_url;
end;
$$;

revoke all on function abrir_enlace_directorio(text) from public;
grant execute on function abrir_enlace_directorio(text) to authenticated;
