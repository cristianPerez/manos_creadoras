-- ============================================================================
-- Dos bolsillos de IA, y el gasto se apunta sin poder perderse
--
-- DOS FALLOS DISTINTOS, los dos en el mismo sitio.
--
-- ── FALLO 1: un solo tope para todo el mundo ────────────────────────────────
-- `ai_spend` tiene UNA fila por día y el freno mira esa cifra antes de saber
-- quién pregunta. Así que el día que se agote el presupuesto, se agota para
-- TODAS — incluida la alumna que está pagando la suscripción. Alguien con un
-- acceso de regalo puede dejar mudo al Ojo Experto de quien puso el dinero.
--
-- Hasta la 0008 esto era teórico porque el acceso solo lo daba una compra. Con
-- las concesiones de regalo pasó a ser probable, y por eso se separa ahora.
--
-- La cuenta pasa a llevarse por (día, público):
--   `miembro` — tiene una concesión viva de motivo 'compra'. Pagó.
--   `regalo`  — entra por 'regalo' o 'manual'. Es la cortesía.
--
-- ⚠️ LO QUE ESTO NO ARREGLA, dicho claro: los dos bolsillos son GLOBALES por
-- público, no por persona. Una sola alumna puede agotar el de `miembro` para
-- las demás. Con la cantidad de alumnas de hoy no importa; cuando haya varias
-- decenas activas hay que decidir si el tope pasa a ser por cuenta.
--
-- ── FALLO 2: el gasto se apuntaba leyendo y reescribiendo ───────────────────
-- El código hacía `select usd` … y después `upsert({ usd: leído + costo })`.
-- Entre esas dos líneas cabe otra petición: las dos leen 4,00, las dos escriben
-- 4,01, y una de las dos consultas se gastó sin quedar apuntada. Con tráfico
-- normal se pierde gasto en silencio y el freno salta más tarde de lo que debe
-- — que es justo cuando más falta hace.
--
-- Aquí se apunta con UNA sentencia atómica (`insert … on conflict do update`
-- sumando sobre el valor de la fila), que dos peticiones simultáneas no pueden
-- pisarse.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Quién es cada quien
--
-- Se deduce de las concesiones (0008), no de `profiles.status`: el acceso ya no
-- vive ahí y tener dos sitios que responden "¿esta paga?" es tener dos
-- respuestas distintas dentro de un mes.
--
-- Sin concesión viva de compra → `regalo`. Fallar hacia el bolsillo pequeño es
-- lo correcto: si nos equivocamos, gasta del cubo de la cortesía y no del que
-- protege a quien pagó.
-- ----------------------------------------------------------------------------

create or replace function publico_de(uid uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when exists (
      select 1 from accesos a
      where a.user_id = uid
        and a.motivo = 'compra'
        and a.revocado_en is null
        and (a.vence_en is null or a.vence_en > now())
    ) then 'miembro'
    else 'regalo'
  end;
$$;

revoke all on function publico_de(uuid) from public, anon, authenticated;
grant execute on function publico_de(uuid) to service_role;

-- ----------------------------------------------------------------------------
-- 2. El libro de gasto, ahora con dos columnas de cuentas
--
-- Lo que ya hay se queda como `miembro`: hasta hoy el acceso solo lo daba una
-- compra, así que todo el gasto registrado es de gente que pagó. El valor por
-- defecto no inventa nada, describe lo que pasó.
--
-- Se guardan además los TOKENS reales. Antes solo se guardaba un costo estimado
-- con dos constantes fijas (0,00025 por pregunta y 0,0005 por foto), y una
-- estimación no se puede auditar: el día que la factura de Google no cuadre, no
-- hay forma de saber si el error está en el precio o en el número de consultas.
-- Los tokens son el dato que Google devuelve y es el mismo que él factura.
-- ----------------------------------------------------------------------------

alter table ai_spend
  add column if not exists publico text not null default 'miembro'
  check (publico in ('regalo', 'miembro'));

alter table ai_spend add column if not exists consultas       integer not null default 0;
alter table ai_spend add column if not exists tokens_entrada  bigint  not null default 0;
alter table ai_spend add column if not exists tokens_salida   bigint  not null default 0;
alter table ai_spend add column if not exists actualizado_en  timestamptz not null default now();

alter table ai_spend drop constraint ai_spend_pkey;
alter table ai_spend add primary key (dia, publico);

-- ----------------------------------------------------------------------------
-- 3. Apuntar el gasto — UNA sentencia, imposible de pisar
--
-- Devuelve el total del día para ese público, que es lo que el servidor querría
-- saber después de gastar sin tener que volver a preguntar.
-- ----------------------------------------------------------------------------

create or replace function apuntar_gasto_ia(
  p_publico        text,
  p_tokens_entrada bigint,
  p_tokens_salida  bigint,
  p_usd            numeric
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total   numeric;
  v_publico text := case when p_publico = 'miembro' then 'miembro' else 'regalo' end;
begin
  insert into ai_spend as s (dia, publico, consultas, tokens_entrada, tokens_salida, usd)
  values (current_date, v_publico, 1, greatest(coalesce(p_tokens_entrada, 0), 0),
          greatest(coalesce(p_tokens_salida, 0), 0), greatest(coalesce(p_usd, 0), 0))
  on conflict (dia, publico) do update set
    consultas      = s.consultas + 1,
    tokens_entrada = s.tokens_entrada + excluded.tokens_entrada,
    tokens_salida  = s.tokens_salida + excluded.tokens_salida,
    usd            = s.usd + excluded.usd,
    actualizado_en = now()
  returning s.usd into v_total;

  return v_total;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. Cuánto lleva gastado hoy ESE público
--
-- ⚠️ Un público NO ve el gasto del otro, y ahí está todo el sentido del cambio:
-- que la cortesía se coma su bolsillo no puede tocar a quien pagó.
-- ----------------------------------------------------------------------------

create or replace function gasto_ia_de_hoy(p_publico text)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select usd from ai_spend
      where dia = current_date
        and publico = case when p_publico = 'miembro' then 'miembro' else 'regalo' end),
    0
  );
$$;

-- Estas funciones mueven dinero: solo el servidor las llama.
revoke all on function apuntar_gasto_ia(text, bigint, bigint, numeric)
  from public, anon, authenticated;
grant execute on function apuntar_gasto_ia(text, bigint, bigint, numeric) to service_role;

revoke all on function gasto_ia_de_hoy(text) from public, anon, authenticated;
grant execute on function gasto_ia_de_hoy(text) to service_role;
