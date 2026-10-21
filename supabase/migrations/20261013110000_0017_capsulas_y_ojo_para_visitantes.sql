-- ============================================================================
-- 0017 · LAS CÁPSULAS DEL HOME, Y EL OJO EXPERTO PARA QUIEN NO TIENE CUENTA
-- ============================================================================

-- ── 1. Cápsulas ────────────────────────────────────────────────────────────
--
-- Cinco videos cortos que se ven en el home sin crear cuenta. Son el anzuelo:
-- enseñan una técnica suelta en menos de un minuto.
create table if not exists capsulas (
  id             uuid primary key default gen_random_uuid(),
  orden          int  not null unique,
  titulo         text not null,
  -- La etiqueta corta es la que va bajo el círculo en móvil ("Cuentas", "El
  -- hilo"). NO es el título recortado: ahí no caben más de ~8 caracteres y
  -- recortar "Elige tus cuentas" daría "Elige tu…", que no dice nada.
  etiqueta_corta text not null,
  subtitulo      text not null,

  -- ⚠️ NULO A PROPÓSITO. Los videos de las cápsulas NO EXISTEN todavía: el
  -- seed de los 14 bolsos no trae ninguno y nadie ha grabado estos cinco. El
  -- visor enseña la portada y lo dice, en vez de abrir un reproductor roto.
  -- (Hay 21 videos sueltos sin colección en la biblioteca de Bunny; puede que
  -- alguno sea de estos, pero no está confirmado.)
  video_id       text,
  portada_url    text,
  creado_en      timestamptz not null default now()
);

alter table capsulas enable row level security;

-- Lectura PÚBLICA, también para `anon`: se ven desde el home sin sesión. Es el
-- único sitio del proyecto donde eso es correcto — y lo es porque el contenido
-- de esta tabla es justamente lo que se regala.
drop policy if exists "capsulas visibles para cualquiera" on capsulas;
create policy "capsulas visibles para cualquiera" on capsulas
  for select using (true);

-- ── 2. El Ojo Experto para visitantes ──────────────────────────────────────
--
-- ⚠️ ESTO ABRE EL GASTO DE IA A TRÁFICO ANÓNIMO, y por eso lleva dos frenos.
-- Cualquiera que pase por la landing puede preguntar, y una landing con ads
-- recibe miles de visitas. Sin control, un día malo se come el presupuesto del
-- mes y deja sin servicio a quien paga.
--
-- Freno 1: dos preguntas por visitante, contadas AQUÍ (servidor), no en el
--          navegador. Borrar la cookie no regala preguntas nuevas si la IP ya
--          gastó las suyas.
-- Freno 2: su propio bolsillo de presupuesto diario (abajo), separado del de
--          quien paga.
create table if not exists ojo_visitantes (
  -- Hash de IP + cookie firmada. NO se guarda la IP en claro: no hace falta
  -- para contar, y guardar direcciones de gente que ni siquiera tiene cuenta
  -- es recoger un dato personal sin motivo.
  huella     text primary key,
  preguntas  int  not null default 0,
  creado_en  timestamptz not null default now(),
  ultima_en  timestamptz not null default now()
);

alter table ojo_visitantes enable row level security;
-- Sin políticas: solo la ruta del servidor (service_role) la toca. Nadie más
-- tiene por qué leer ni escribir aquí.

create index if not exists ojo_visitantes_ultima_idx on ojo_visitantes (ultima_en);

/**
 * Mira y descuenta la pregunta de un visitante, en una sola operación.
 *
 * Mismo motivo que `consumir_cupo`: en dos pasos, dos pestañas abiertas pasan
 * las dos la comprobación y gastan una sola.
 */
create or replace function consumir_visitante(p_huella text, p_limite int)
returns table (permitido boolean, usadas int, limite int)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_usadas int;
begin
  insert into ojo_visitantes (huella, preguntas)
  values (p_huella, 0)
  on conflict (huella) do nothing;

  select v.preguntas into v_usadas
  from ojo_visitantes v where v.huella = p_huella for update;

  if v_usadas >= p_limite then
    return query select false, v_usadas, p_limite;
    return;
  end if;

  update ojo_visitantes
     set preguntas = preguntas + 1, ultima_en = now()
   where huella = p_huella
  returning preguntas into v_usadas;

  return query select true, v_usadas, p_limite;
end;
$$;

revoke all on function consumir_visitante(text, int) from public, anon, authenticated;
grant execute on function consumir_visitante(text, int) to service_role;

-- ── 3. El tercer bolsillo de presupuesto ───────────────────────────────────
--
-- Los visitantes gastan de lo suyo. Si se agota, el Ojo deja de responder EN EL
-- HOME y quien paga sigue teniéndolo entero. Era exactamente el fallo que la
-- migración 0011 arregló entre regalo y miembro; se repite el patrón.
alter table ai_spend drop constraint if exists ai_spend_publico_check;
alter table ai_spend
  add constraint ai_spend_publico_check
  check (publico in ('regalo', 'miembro', 'visitante'));

comment on table ojo_visitantes is
  'Cuántas preguntas gastó cada visitante sin cuenta. La huella es un hash: nunca la IP en claro.';
