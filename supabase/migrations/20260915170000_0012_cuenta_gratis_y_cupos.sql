-- ============================================================================
-- Cuenta gratis con 3 consultas de prueba (patrón `plan_quotas` de El Charcu)
--
-- EL HUECO QUE CIERRA. Las pantallas del visitante invitan a "entrar con tu
-- correo", pero `shouldCreateUser: false` impedía crear la cuenta: quien nunca
-- compró escribía su correo, la pantalla le decía "revisa tu correo" —por
-- anti-enumeración— y no le llegaba NADA, nunca. Se quedaba esperando.
--
-- Decisión de Cristian (2026-09-15): opción B. Se puede crear cuenta gratis y
-- probar el Ojo Experto unas pocas veces. Se gana el correo (que es lo que
-- permite venderle después) y prueba lo único que no puede copiar de YouTube.
--
-- 3 consultas y no 1: con una sola no se ve una conversación. Es la lección que
-- costó cara en El Charcu — subieron su muro de 1 a 2 porque "una respuesta no
-- demuestra una conversación". Con 3 pregunta, lee y repregunta.
-- Cuesta ~USD 0,0054 por persona (3 × 0,0018 medidos).
--
-- ⚠️ LA CUENTA GRATIS NO ABRE EL CURSO. Solo da consultas. Las lecciones las
-- sigue decidiendo `es_libre` + `tiene_acceso()` (0009), que no se tocan aquí.
-- Son dos cosas distintas y separarlas es lo que impide que un registro gratuito
-- se lleve el programa entero.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Un perfil sin suscripción es un perfil con `status` NULO
--
-- `status` describe la suscripción en Hotmart. Quien nunca compró no tiene
-- ninguna, y el default 'active' le diría a la app —y a la pantalla "Mi
-- cuenta"— que su membresía está al día. Sería mentir en la cara del usuario.
--
-- No se añade un valor 'sin_compra' al enum a propósito: `alter type add value`
-- no se puede USAR en la misma transacción en que se crea, así que una migración
-- que lo hiciera todo de una vez fallaría. Nulo dice lo mismo sin ese riesgo.
-- ----------------------------------------------------------------------------

alter table profiles alter column status drop not null;
alter table profiles alter column status drop default;

-- ----------------------------------------------------------------------------
-- 2. El perfil se crea solo, venga la cuenta de donde venga
--
-- Hasta hoy lo creaba el webhook a mano. Con el registro gratuito hay una
-- segunda puerta, y tener dos sitios que crean perfiles es tener uno que algún
-- día se olvida. El disparador cubre las dos —y cualquier tercera que aparezca,
-- como crear una cuenta desde el panel de Supabase, que hoy deja usuarios sin
-- perfil y provocaba el bucle de redirecciones de la Sesión 7.
--
-- `on conflict do nothing` porque el webhook sigue escribiendo el suyo con más
-- datos (plan, transacción, fecha de pago) justo después.
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
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function crear_perfil_al_registrarse();

-- ----------------------------------------------------------------------------
-- 3. Los cupos, en la base y no repartidos por el código
--
-- Es el `plan_quotas` de El Charcu. Allí el comentario dice "estos números
-- tienen que coincidir con plans.ts; si cambias uno, cambia el otro" — o sea,
-- conviven dos fuentes y confían en que nadie se olvide. Aquí no: los números
-- viven SOLO aquí y tanto la API como la pantalla los leen de esta tabla.
-- `lib/config.ts` pierde sus constantes.
--
-- Cambiar el regalo de 3 a 5 pasa a ser un `update` de una fila, sin desplegar.
-- ----------------------------------------------------------------------------

create table cupos (
  publico       text primary key check (publico in ('regalo', 'miembro')),
  preguntas_mes integer not null check (preguntas_mes >= 0),
  fotos_mes     integer not null check (fotos_mes >= 0)
);

insert into cupos (publico, preguntas_mes, fotos_mes) values
  -- Cuenta gratis: lo justo para tener una conversación de verdad.
  ('regalo', 3, 1),
  -- Alumna: los números del uso justo que ya estaban en `lib/config.ts`.
  ('miembro', 40, 8);

alter table cupos enable row level security;

-- Los cupos NO son secretos: la pantalla tiene que poder decir "3 de 3". Que
-- alguien sin cuenta los lea no revela nada de nadie.
create policy "cupos: los lee cualquiera" on cupos
  for select to anon, authenticated using (true);

-- ----------------------------------------------------------------------------
-- 4. De qué público es cada quien
--
-- ⚠️ SE REDEFINE la de la 0011, que miraba si existía una concesión de motivo
-- 'compra'. Con el registro gratuito la pregunta correcta es más simple y ya
-- tiene respuesta: **¿tiene acceso al programa?**. Da igual si lo consiguió
-- pagando o porque la dueña se lo regaló — en los dos casos es alguien a quien
-- prometimos el producto completo, y se le trata igual.
--
-- Una regla en vez de dos evita que dentro de un mes 'compra' y 'manual'
-- respondan cosas distintas sin que nadie se acuerde de por qué.
-- ----------------------------------------------------------------------------

create or replace function publico_de(uid uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case when tiene_acceso_de(uid) then 'miembro' else 'regalo' end;
$$;

revoke all on function publico_de(uuid) from public, anon, authenticated;
grant execute on function publico_de(uuid) to service_role;

-- ----------------------------------------------------------------------------
-- 5. El cupo que le toca a una persona
--
-- Una sola llamada devuelve el público y sus dos límites, para que ni la API ni
-- la pantalla tengan que saber cómo se calcula.
-- ----------------------------------------------------------------------------

create or replace function cupo_de(uid uuid)
returns table (publico text, preguntas_mes integer, fotos_mes integer)
language sql
stable
security definer
set search_path = public
as $$
  select c.publico, c.preguntas_mes, c.fotos_mes
  from cupos c
  where c.publico = publico_de(uid);
$$;

revoke all on function cupo_de(uuid) from public, anon, authenticated;
grant execute on function cupo_de(uuid) to service_role;

-- ----------------------------------------------------------------------------
-- 6. Las cuentas que ya existen conservan lo suyo
--
-- Todas las de hoy entraron por una compra, así que su `status` describe algo
-- real y se queda como está. Esta migración solo cambia lo que viene después.
-- ----------------------------------------------------------------------------
