-- ============================================================================
-- 0014 — `membresias` sustituye a `accesos`, con la forma de El Charcu
--
-- Decisión de Cristian (2026-10-12): una sola tabla, y con la forma que ya
-- funciona en El Charcu — la gracia es `vence_el`, que responde de un vistazo
-- "¿hasta cuándo tiene acceso esta alumna?".
--
-- POR QUÉ `accesos` SE QUEDABA CORTA. Guardaba concesiones: una fila por cada
-- vez que alguien recibía acceso, con su motivo. Respondía muy bien a "¿por qué
-- entra esta?", pero no sabía NADA del negocio: ni qué plan tiene, ni si paga
-- al mes o al año, ni cuándo renueva. Con un solo plan daba igual; con tres
-- —Aprendiz, Creadora y Maestra— la pantalla de Mi cuenta no se puede pintar.
--
-- ⚠️ LAS FUNCIONES CONSERVAN SU NOMBRE. `tiene_acceso()` y `tiene_acceso_de()`
-- se reescriben por dentro pero se siguen llamando igual, porque hay SEIS
-- sitios en el código que preguntan por ellas (lib/curso.ts, lib/ojo-experto.ts,
-- api/push/suscribir, el middleware…). Son la frontera entre "cómo se guarda el
-- acceso" y "quién puede ver esto", y esa frontera es justo lo que permite
-- cambiar la tabla de debajo sin tocar las pantallas.
--
-- ⚠️ ONEPAY, NO HOTMART. La columna no se llama `hotmart_subscription_id` sino
-- `pasarela_id`, con `pasarela` al lado. Atar el nombre de una columna a un
-- proveedor es lo que obliga a migrar la base el día que se cambia — y aquí ya
-- se cambió una vez.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. La tabla
-- ----------------------------------------------------------------------------

create table membresias (
  id          uuid primary key default gen_random_uuid(),
  -- UNA fila por cuenta. No es un historial: es el estado de hoy.
  user_id     uuid not null unique references profiles (id) on delete cascade,

  -- 'aprendiz' es el suelo: toda cuenta lo tiene por existir, y da el bolso
  -- gratis más 3 preguntas al Ojo Experto.
  plan        text not null default 'aprendiz'
                check (plan in ('aprendiz', 'creadora', 'maestra')),

  ciclo       text check (ciclo in ('mensual', 'anual')),

  -- 'activa'   → al día
  -- 'vencida'  → falló el cobro y la pasarela está reintentando
  -- 'cancelada'→ no renueva; conserva acceso hasta `vence_el`
  estado      text not null default 'activa'
                check (estado in ('activa', 'vencida', 'cancelada')),

  -- ⚠️ LA COLUMNA QUE IMPORTA. null = no vence (es lo normal mientras pague).
  -- Cuando alguien cancela, aquí queda el final del período que YA pagó: sigue
  -- entrando hasta ese día, que es lo justo y lo que evita el reembolso.
  vence_el    timestamptz,

  -- Por dónde entró el dinero: 'onepay' | 'manual' | 'cortesia'.
  -- 'manual' es cobro por fuera (transferencia, Nequi) activado a mano; sirve
  -- para vender HOY, sin esperar a que la pasarela esté integrada.
  pasarela    text,
  -- El identificador de la suscripción en la pasarela. Sin nombre de marca:
  -- el día que cambie el proveedor, cambia el valor y no el esquema.
  pasarela_id text,
  pais        text,

  creada_el       timestamptz not null default now(),
  actualizada_el  timestamptz not null default now()
);

create index membresias_estado_idx on membresias (estado, vence_el);

-- Que `actualizada_el` no dependa de que alguien se acuerde de ponerla.
create or replace function tocar_actualizada_el()
returns trigger
language plpgsql
as $$
begin
  new.actualizada_el := now();
  return new;
end;
$$;

create trigger membresias_tocar_fecha
  before update on membresias
  for each row execute function tocar_actualizada_el();

-- ----------------------------------------------------------------------------
-- 2. Traerse lo que había en `accesos` antes de tirarla
--
-- Son pocas filas (8 concesiones entre cuentas de prueba), pero el día que esto
-- corra en producción puede haber alumnas de verdad. Una migración que borra
-- accesos sin mirar es una que un día deja a alguien fuera.
-- ----------------------------------------------------------------------------

insert into membresias (user_id, plan, estado, vence_el, pasarela)
select
  a.user_id,
  -- `accesos` no sabía de planes: quien tenía acceso tenía "el programa", que
  -- es lo que hoy se llama Creadora.
  'creadora',
  case when a.revocado_en is not null then 'cancelada' else 'activa' end,
  a.vence_en,
  case a.motivo when 'compra' then 'onepay' else 'manual' end
from accesos a
-- Si alguien tuviera varias concesiones, vale la última.
where a.otorgado_en = (
  select max(a2.otorgado_en) from accesos a2 where a2.user_id = a.user_id
)
on conflict (user_id) do nothing;

-- Y a toda cuenta que exista sin membresía se le da el suelo: Aprendiz.
insert into membresias (user_id, plan, estado)
select p.id, 'aprendiz', 'activa' from profiles p
on conflict (user_id) do nothing;

-- ----------------------------------------------------------------------------
-- 3. Toda cuenta nueva nace con su membresía
--
-- La migración 0012 ya creaba el perfil al registrarse. Se amplía para que
-- también cree la membresía: así NUNCA hay una cuenta sin fila, y las funciones
-- de abajo no tienen que distinguir entre "no tiene plan" y "no tiene fila".
-- ----------------------------------------------------------------------------

create or replace function crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, status)
  values (new.id, new.email, null)
  on conflict (id) do nothing;

  insert into membresias (user_id, plan, estado)
  values (new.id, 'aprendiz', 'activa')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. Las preguntas que hace la app
-- ----------------------------------------------------------------------------

-- "¿Esta alumna tiene acceso de pago?" — el mismo nombre de siempre.
create or replace function tiene_acceso_de(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from membresias m
    where m.user_id = uid
      and m.plan in ('creadora', 'maestra')
      -- 'cancelada' SIGUE contando mientras no llegue `vence_el`: ya pagó ese
      -- mes. Lo que corta el acceso es la fecha, no el gesto de cancelar.
      and m.estado in ('activa', 'cancelada')
      and (m.vence_el is null or m.vence_el > now())
  );
$$;

create or replace function tiene_acceso()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select tiene_acceso_de((select auth.uid()));
$$;

-- "¿Qué plan le toca?" — devuelve siempre algo, nunca null, para que quien
-- pregunte no tenga que defenderse de un caso vacío.
create or replace function plan_efectivo(uid uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_plan text;
begin
  if uid is null then
    return 'aprendiz';
  end if;

  select m.plan into v_plan
  from membresias m
  where m.user_id = uid
    and m.estado in ('activa', 'cancelada')
    and (m.vence_el is null or m.vence_el > now());

  -- Sin fila, vencida o plan desconocido: Aprendiz. Es el suelo, no un error.
  return coalesce(v_plan, 'aprendiz');
end;
$$;

revoke all on function tiene_acceso_de(uuid) from public, anon;
revoke all on function plan_efectivo(uuid)   from public, anon;
grant execute on function tiene_acceso_de(uuid) to authenticated, service_role;
grant execute on function tiene_acceso()        to authenticated, service_role;
grant execute on function plan_efectivo(uuid)   to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 5. Dar y quitar membresía, en la base
--
-- Van aquí y no en el código por lo mismo que antes: las llaman tres sitios
-- distintos (el webhook de la pasarela, el script de la dueña y la activación a
-- mano), y tres copias en TypeScript son tres sitios donde olvidarse de algo.
-- ----------------------------------------------------------------------------

create or replace function dar_membresia(
  p_user_id     uuid,
  p_plan        text,
  p_ciclo       text default null,
  p_vence_el    timestamptz default null,
  p_pasarela    text default 'manual',
  p_pasarela_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into membresias (user_id, plan, ciclo, estado, vence_el, pasarela, pasarela_id)
  values (p_user_id, p_plan, p_ciclo, 'activa', p_vence_el, p_pasarela, p_pasarela_id)
  on conflict (user_id) do update
    set plan        = excluded.plan,
        ciclo       = excluded.ciclo,
        estado      = 'activa',
        vence_el    = excluded.vence_el,
        pasarela    = excluded.pasarela,
        pasarela_id = excluded.pasarela_id;
end;
$$;

-- Cancelar NO es quitar el acceso: es dejar de renovar. Por eso solo cambia el
-- estado y fija hasta cuándo sigue entrando. Quitarlo en el acto sería cobrarle
-- un mes y no dárselo.
create or replace function cancelar_membresia(
  p_user_id  uuid,
  p_vence_el timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update membresias
     set estado   = 'cancelada',
         vence_el = coalesce(p_vence_el, vence_el, now())
   where user_id = p_user_id;
end;
$$;

revoke all on function dar_membresia(uuid, text, text, timestamptz, text, text) from public, anon, authenticated;
revoke all on function cancelar_membresia(uuid, timestamptz)                    from public, anon, authenticated;
grant execute on function dar_membresia(uuid, text, text, timestamptz, text, text) to service_role;
grant execute on function cancelar_membresia(uuid, timestamptz)                    to service_role;

-- ----------------------------------------------------------------------------
-- 6. Quién lee las membresías
--
-- Cada alumna la suya. NADIE la escribe desde el navegador: se escribe con las
-- funciones de arriba, que solo puede llamar el servidor. Si esto fuera
-- escribible, cualquiera se regalaría el plan Maestra desde la consola.
-- ----------------------------------------------------------------------------

alter table membresias enable row level security;

create policy "membresias: cada alumna ve la suya" on membresias
  for select to authenticated using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- 7. Fuera `accesos`
-- ----------------------------------------------------------------------------

drop function if exists otorgar_acceso(uuid, text, timestamptz, text);
drop function if exists revocar_acceso(uuid);
drop table    if exists accesos cascade;
