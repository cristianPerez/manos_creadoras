-- ============================================================================
-- El acceso deja de depender del webhook: ahora son CONCESIONES
--
-- HASTA HOY el acceso se deducía de `profiles.status`, y esa columna solo la
-- escribe el webhook de Hotmart. Consecuencia: no había forma de dejar entrar a
-- nadie sin que pasara una compra. Ni a una alumna de regalo, ni a una que pagó
-- por fuera, ni a la dueña para enseñar el producto.
--
-- El origen del acceso pasa a esta tabla. `tiene_acceso_de` ya no mira el
-- estado de la suscripción: mira si existe una concesión VIVA. El webhook
-- seguirá escribiendo (motivo 'compra'), pero como UNA fuente más, no como la
-- única — y el día que haya otra pasarela, inserta su fila y nada se rediseña.
--
-- ⚠️ `profiles.status` NO se borra, y conviene entender por qué no sobra:
--   · La máquina de estados del webhook la necesita para no resucitar a quien
--     reembolsó cuando llega un PURCHASE_APPROVED tardío.
--   · "Mi cuenta" le muestra a la alumna cómo va su suscripción en Hotmart.
-- Lo que pierde es el poder de decidir quién entra. Eso ya no lo dice.
--
-- SE MANTIENE D12 de El Charcu: la puerta vive en la BASE, no en la pantalla.
-- Cambia de dónde saca la respuesta, no dónde está el candado.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Las concesiones
--
-- Una fila = "a esta persona se le dio acceso, por este motivo, hasta esta
-- fecha". No se borran nunca: revocar es escribir `revocado_en`. El historial
-- de por qué alguien tuvo acceso es justamente lo que hace falta el día que
-- alguien reclame, y un `delete` lo perdería.
-- ----------------------------------------------------------------------------

create table accesos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  -- 'regalo'  → los 3 videos de entrada / acceso de cortesía
  -- 'compra'  → lo escribe el webhook de Hotmart al cobrar
  -- 'manual'  → lo dio la dueña a mano (script `acceso:otorgar`)
  motivo        text not null check (motivo in ('regalo', 'compra', 'manual')),
  -- Quién lo dio. 'hotmart' cuando es automático; un correo cuando es a mano.
  -- Sirve para responder "¿y esta por qué tiene acceso?" sin adivinar.
  otorgado_por  text not null default 'sistema',
  otorgado_en   timestamptz not null default now(),
  -- null = no vence. Es lo normal en una suscripción al día: mientras siga
  -- pagando no hay fecha de corte que mantener actualizada.
  vence_en      timestamptz,
  -- null = vigente. Se escribe al reembolsar, al expirar o al revocar a mano.
  revocado_en   timestamptz
);

-- La consulta que se hace en CADA carga de pantalla es "¿tiene alguna viva?".
-- El índice parcial deja fuera las revocadas, que con el tiempo son la mayoría.
create index accesos_vivas_idx on accesos (user_id) where revocado_en is null;

alter table accesos enable row level security;

-- La alumna puede ver POR QUÉ tiene acceso (es información suya), pero no
-- escribir: una concesión que el propio interesado pudiera crear no es un
-- permiso, es un formulario de autoservicio. Solo el servidor otorga.
create policy "accesos propios: leer" on accesos
  for select using ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- 2. Qué significa "concesión viva"
--
-- Una sola definición, usada por todo lo demás. Si esta regla se escribiera
-- suelta en cada consulta, en un mes habría dos versiones que no coinciden.
-- ----------------------------------------------------------------------------

create or replace function tiene_acceso_de(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from accesos a
    where a.user_id = uid
      and a.revocado_en is null
      and (a.vence_en is null or a.vence_en > now())
  );
$$;

-- Los permisos se vuelven a declarar porque `create or replace` NO los hereda
-- si la firma cambia de dueño, y dejarlo al azar aquí sería regalar la
-- posibilidad de averiguar quién tiene membresía probando UUIDs (el incidente
-- que cerró la 0002). Con parámetro: solo el servidor.
revoke all on function tiene_acceso_de(uuid) from public, anon, authenticated;
grant execute on function tiene_acceso_de(uuid) to service_role;

-- Sin parámetro: responde solo sobre quien llama. `tiene_acceso()` no cambia de
-- cuerpo, pero se reescribe para que quede claro que ahora lee concesiones.
create or replace function tiene_acceso()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select tiene_acceso_de((select auth.uid()));
$$;

revoke all on function tiene_acceso() from public, anon;
grant execute on function tiene_acceso() to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 3. Otorgar y revocar, en la base
--
-- Van aquí y no en el código de la app por dos razones: son DOS sentencias que
-- tienen que pasar juntas (revocar la anterior y crear la nueva), y las llaman
-- tres sitios distintos — el webhook, el script de la dueña y, más adelante,
-- cualquier otra pasarela. Tres copias de esto en TypeScript serían tres
-- oportunidades de que una se olvide de revocar.
-- ----------------------------------------------------------------------------

create or replace function otorgar_acceso(
  p_user_id      uuid,
  p_motivo       text,
  p_vence_en     timestamptz default null,
  p_otorgado_por text default 'sistema'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  -- Se revoca lo vivo del MISMO motivo antes de crear la nueva. Si no, una
  -- alumna que renueva doce meses acumularía doce concesiones vivas y la
  -- cancelación tendría que acordarse de cerrarlas todas.
  --
  -- ⚠️ Solo del mismo motivo, a propósito: una concesión de 'regalo' NO se
  -- pisa cuando llega la compra, ni al revés. Son dos permisos distintos y
  -- quitar uno al conceder el otro dejaría a alguien fuera sin motivo el día
  -- que caduque el segundo.
  update accesos
     set revocado_en = now()
   where user_id = p_user_id
     and motivo = p_motivo
     and revocado_en is null;

  insert into accesos (user_id, motivo, vence_en, otorgado_por)
  values (p_user_id, p_motivo, p_vence_en, p_otorgado_por)
  returning id into v_id;

  return v_id;
end;
$$;

-- Revoca TODO lo vivo de una persona. Es lo que se llama al reembolsar o al
-- expirar: ahí sí se cae todo, venga de donde venga.
create or replace function revocar_acceso(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n integer;
begin
  update accesos
     set revocado_en = now()
   where user_id = p_user_id
     and revocado_en is null;

  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

-- Estas dos dan y quitan acceso: jamás desde el navegador.
revoke all on function otorgar_acceso(uuid, text, timestamptz, text)
  from public, anon, authenticated;
grant execute on function otorgar_acceso(uuid, text, timestamptz, text) to service_role;

revoke all on function revocar_acceso(uuid) from public, anon, authenticated;
grant execute on function revocar_acceso(uuid) to service_role;

-- ----------------------------------------------------------------------------
-- 4. Traer lo que ya había
--
-- Sin esto, en el segundo en que se aplica esta migración TODAS las alumnas que
-- hoy pagan se quedan fuera: la tabla nace vacía y la función ya no mira
-- `status`. Se traduce el estado de cada una a una concesión equivalente,
-- usando la MISMA regla que tenía la función vieja.
--
-- `first_paid_at` conserva la fecha original cuando existe: la concesión no
-- nació hoy, nació el día que esa alumna pagó.
-- ----------------------------------------------------------------------------

insert into accesos (user_id, motivo, otorgado_por, otorgado_en, vence_en)
select
  p.id,
  'compra',
  'migracion-0008',
  coalesce(p.first_paid_at, now()),
  -- Quien canceló conserva hasta el fin de su período; el resto no vence.
  case when p.status = 'cancelled' then p.access_until else null end
from profiles p
where p.status in ('active', 'past_due')
   or (p.status = 'cancelled' and p.access_until is not null and p.access_until > now());
