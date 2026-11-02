-- ============================================================================
-- 0042 · UN ENLACE GRATIS PARA TODAS, EL RESTO CON LA MEMBRESÍA
--
-- La 0041 daba "un clic de regalo por cuenta": cada alumna gratis elegía qué
-- producto abrir y el resto quedaba cerrado. Cristian lo corrigió el mismo
-- 2026-11-02: el regalo es UN producto fijo, abierto para TODO el mundo —con
-- cuenta o sin ella—, y los demás enlaces solo con la suscripción.
--
-- Es más simple y vende mejor: quien llega sin cuenta prueba el directorio sin
-- registrarse (valor antes del registro) y no hay que explicarle un cupo.
--
-- El producto gratis es `cuentas-10` porque se usa en 8 bolsos: es el que más
-- alumnas necesitan, así que es la mejor muestra. Cambiarlo es mover el
-- `gratis` de fila, no código.
--
-- `directorio_clics` se queda: ya no cuenta un cupo, pero sigue diciendo qué
-- material busca la gente (solo de quien tiene sesión).
-- ============================================================================

alter table directorio_items add column gratis boolean not null default false;

update directorio_items set gratis = true where id = 'cuentas-10';

/* La columna es pública como el resto del escaparate (la 0041 dejó el permiso
   de leer columna por columna, así que hay que darlo explícitamente). */
grant select (gratis) on directorio_items to anon, authenticated;

-- El cupo por cuenta ya no existe.
drop function if exists estado_directorio();

/**
 * Abre un producto del directorio: comprueba el derecho y devuelve la URL.
 * Sigue siendo lo ÚNICO que entrega una URL de compra (la columna `url` no es
 * legible desde el navegador, ver 0041).
 *
 *   'ok'         → `url` trae el enlace (y, si hay sesión, el clic quedó apuntado).
 *   'sin-enlace' → el producto no existe o todavía no tiene enlace.
 *   'bloqueado'  → no es el gratis y quien pide no tiene membresía (o no entró).
 *
 * ⚠️ SE APOYA EN `tiene_acceso_de()`: esa función ya sabe que 'cancelada'
 * sigue contando hasta `vence_el`. No se duplica aquí.
 */
create or replace function abrir_enlace_directorio(p_item text)
returns table (estado text, url text)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_uid    uuid := (select auth.uid());
  v_url    text;
  v_gratis boolean;
begin
  select i.url, i.gratis into v_url, v_gratis from directorio_items i where i.id = p_item;
  if v_url is null then
    return query select 'sin-enlace'::text, null::text;
    return;
  end if;

  if not v_gratis and (v_uid is null or not tiene_acceso_de(v_uid)) then
    return query select 'bloqueado'::text, null::text;
    return;
  end if;

  if v_uid is not null then
    insert into directorio_clics (user_id, item_id) values (v_uid, p_item);
  end if;
  return query select 'ok'::text, v_url;
end;
$$;

revoke all on function abrir_enlace_directorio(text) from public;
grant execute on function abrir_enlace_directorio(text) to anon, authenticated;
