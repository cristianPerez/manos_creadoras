-- ============================================================================
-- 0015 — Cupos para los tres planes, y el Ojo Experto como conversación
--
-- Dos cambios que van juntos porque se tocan: los límites del Ojo Experto
-- dependen del plan, y la pantalla nueva necesita guardar mensajes sueltos.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Los cupos
--
-- ⚠️ SUBEN MUCHO, Y NO ES UN DESCUIDO. Creadora pasa de 40 preguntas a 200, y
-- las fotos de 8 a 30. Decisión de Cristian (2026-10-12) con dos razones, las
-- dos ya comprobadas en El Charcu:
--   · La API de Gemini salió bastante más barata de lo presupuestado.
--   · Casi nadie agota el cupo de fotos. El límite estrecho no ahorraba dinero
--     —casi nadie llegaba— pero sí asustaba a quien leía la oferta.
-- Son los mismos números que El Charcu lleva en producción desde agosto.
--
-- El techo de gasto de `ai_spend` NO se toca: ese es el freno de verdad. Los
-- cupos reparten entre alumnas; el presupuesto protege la cuenta del banco.
-- ----------------------------------------------------------------------------

-- La tabla vieja repartía por "público" (regalo / miembro). Ahora reparte por
-- plan, que son tres y pueden crecer.
drop table if exists cupos cascade;

create table plan_cupos (
  plan           text primary key check (plan in ('aprendiz', 'creadora', 'maestra')),
  preguntas_mes  int not null check (preguntas_mes >= 0),
  fotos_mes      int not null check (fotos_mes >= 0)
);

insert into plan_cupos (plan, preguntas_mes, fotos_mes) values
  -- Lo justo para tener UNA conversación de verdad y entender para qué sirve.
  ('aprendiz',   3,   1),
  ('creadora', 200,  30),
  ('maestra',  600,  60);

alter table plan_cupos enable row level security;

-- Los cupos no son secretos: la pantalla tiene que poder decir "12 de 200".
create policy "plan_cupos: los lee cualquiera" on plan_cupos
  for select to anon, authenticated using (true);

-- ----------------------------------------------------------------------------
-- 2. El consumo, mes a mes
-- ----------------------------------------------------------------------------

create table ojo_uso_mensual (
  user_id   uuid not null references profiles (id) on delete cascade,
  -- Mes natural en hora de Colombia: '2026-10'. En texto y no como fecha
  -- porque es una ETIQUETA de agrupación, no un día del calendario.
  periodo   text not null,
  preguntas int  not null default 0,
  fotos     int  not null default 0,
  primary key (user_id, periodo)
);

create or replace function periodo_actual()
returns text
language sql
stable
as $$
  -- Siempre en hora de Colombia: si se usara UTC, el cupo se reiniciaría a las
  -- 7 de la tarde del día anterior para la alumna, que no entendería nada.
  select to_char(now() at time zone 'America/Bogota', 'YYYY-MM');
$$;

-- ----------------------------------------------------------------------------
-- 3. Descontar del cupo
--
-- ⚠️ MIRA Y DESCUENTA EN LA MISMA OPERACIÓN, Y ESO ES EL PUNTO. Si la app
-- preguntara "¿le queda cupo?" y luego escribiera, dos pestañas abiertas a la
-- vez pasarían las dos la comprobación y gastarían dos veces. Aquí el `insert
-- … on conflict do update` deja la fila bloqueada dentro de la transacción
-- hasta que termina de contar, así que la segunda espera y ve el número ya
-- actualizado.
--
-- Devuelve TAMBIÉN los totales aunque no deje pasar, porque la pantalla
-- necesita decir "llevas 200 de 200" en el mismo momento en que dice que no.
-- ----------------------------------------------------------------------------

create or replace function consumir_cupo(
  p_user_id uuid,
  p_fotos   int default 0
)
returns table (
  permitido        boolean,
  plan             text,
  preguntas_usadas int,
  fotos_usadas     int,
  preguntas_limite int,
  fotos_limite     int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan    text := plan_efectivo(p_user_id);
  v_periodo text := periodo_actual();
  v_fotos   int  := greatest(coalesce(p_fotos, 0), 0);
  v_lim_p   int;
  v_lim_f   int;
  v_usa_p   int;
  v_usa_f   int;
begin
  select c.preguntas_mes, c.fotos_mes into v_lim_p, v_lim_f
  from plan_cupos c where c.plan = v_plan;

  insert into ojo_uso_mensual as u (user_id, periodo)
  values (p_user_id, v_periodo)
  on conflict (user_id, periodo) do update set periodo = excluded.periodo
  returning u.preguntas, u.fotos into v_usa_p, v_usa_f;

  if v_usa_p + 1 > v_lim_p or v_usa_f + v_fotos > v_lim_f then
    return query select false, v_plan, v_usa_p, v_usa_f, v_lim_p, v_lim_f;
    return;
  end if;

  update ojo_uso_mensual u
     set preguntas = u.preguntas + 1,
         fotos     = u.fotos + v_fotos
   where u.user_id = p_user_id and u.periodo = v_periodo
   returning u.preguntas, u.fotos into v_usa_p, v_usa_f;

  return query select true, v_plan, v_usa_p, v_usa_f, v_lim_p, v_lim_f;
end;
$$;

-- Solo para mirar, sin gastar: lo usa la tarjeta "Tu uso este mes".
create or replace function estado_cupo(p_user_id uuid)
returns table (
  plan             text,
  preguntas_usadas int,
  fotos_usadas     int,
  preguntas_limite int,
  fotos_limite     int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    plan_efectivo(p_user_id),
    coalesce(u.preguntas, 0),
    coalesce(u.fotos, 0),
    c.preguntas_mes,
    c.fotos_mes
  from plan_cupos c
  left join ojo_uso_mensual u
    on u.user_id = p_user_id and u.periodo = periodo_actual()
  where c.plan = plan_efectivo(p_user_id);
$$;

alter table ojo_uso_mensual enable row level security;

create policy "ojo_uso_mensual: cada alumna ve el suyo" on ojo_uso_mensual
  for select to authenticated using (user_id = (select auth.uid()));

revoke all on function consumir_cupo(uuid, int) from public, anon, authenticated;
grant execute on function consumir_cupo(uuid, int) to service_role;
grant execute on function estado_cupo(uuid) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 4. El Ojo Experto pasa de preguntas sueltas a conversaciones
--
-- ⚠️ `ai_conversations` guardaba pregunta y respuesta EN LA MISMA FILA. Servía
-- para "sube una foto y te digo qué ajustar", que era de un solo turno. La
-- pantalla nueva es un chat con historial: hace falta una fila por mensaje,
-- porque si no no se puede pintar el hilo ni guardar el pulgar arriba o abajo
-- de una respuesta concreta.
-- ----------------------------------------------------------------------------

create table ojo_conversaciones (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  titulo      text not null,
  -- El contexto con el que se abrió: desde qué bolso y qué paso preguntaba.
  -- Es lo que permite que la respuesta sepa de qué está hablando.
  bolso_id    uuid references bolsos (id)    on delete set null,
  leccion_id  uuid references lecciones (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index ojo_conversaciones_user_idx on ojo_conversaciones (user_id, created_at desc);

create table ojo_mensajes (
  id              uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references ojo_conversaciones (id) on delete cascade,
  rol             text not null check (rol in ('alumna', 'ojo')),
  texto           text not null,
  foto_url        text,
  -- 1 pulgar arriba, -1 abajo, null sin opinar. Es lo único que nos dice si
  -- las respuestas sirven, y sin ello no hay forma de mejorar el prompt.
  feedback        smallint check (feedback in (-1, 1)),
  created_at      timestamptz not null default now()
);

create index ojo_mensajes_conversacion_idx on ojo_mensajes (conversacion_id, created_at);

alter table ojo_conversaciones enable row level security;
alter table ojo_mensajes       enable row level security;

create policy "ojo_conversaciones: cada alumna ve las suyas" on ojo_conversaciones
  for select to authenticated using (user_id = (select auth.uid()));

create policy "ojo_conversaciones: cada alumna las borra" on ojo_conversaciones
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "ojo_mensajes: cada alumna ve los suyos" on ojo_mensajes
  for select to authenticated using (
    exists (
      select 1 from ojo_conversaciones c
      where c.id = ojo_mensajes.conversacion_id
        and c.user_id = (select auth.uid())
    )
  );

-- Lo ÚNICO que la alumna escribe desde el navegador es su opinión sobre una
-- respuesta. El texto lo escribe el servidor, que es quien controla el cupo:
-- si se pudiera insertar desde el navegador, se saltaría el contador.
create policy "ojo_mensajes: cada alumna puntúa los suyos" on ojo_mensajes
  for update to authenticated
  using (
    exists (
      select 1 from ojo_conversaciones c
      where c.id = ojo_mensajes.conversacion_id
        and c.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from ojo_conversaciones c
      where c.id = ojo_mensajes.conversacion_id
        and c.user_id = (select auth.uid())
    )
  );

-- La tabla vieja se va. No se migran sus filas: eran preguntas de prueba de
-- cuatro cuentas nuestras, y un historial de un solo turno no se puede
-- convertir en una conversación sin inventarse el hilo.
drop table if exists ai_conversations cascade;
drop table if exists ai_usage cascade;

-- ----------------------------------------------------------------------------
-- 5. Los mensajes de contacto
--
-- Se guardan además de enviarse por correo: si Resend falla o el correo cae en
-- spam, el mensaje de alguien que quería PAGAR no se puede perder.
-- ----------------------------------------------------------------------------

create table contactos (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  correo       text not null,
  motivo       text not null,
  plan_interes text,
  mensaje      text,
  created_at   timestamptz not null default now()
);

alter table contactos enable row level security;
-- Sin políticas de lectura: nadie lo lee desde el navegador. Lo escribe el
-- servidor y lo lee Elizabeth desde el panel de Supabase.
