-- ============================================================================
-- 0019 · WEBHOOKS, DE CUALQUIER PROVEEDOR
--
-- ⚠️ NO SE LLAMA `onepay_eventos` A PROPÓSITO. Este proyecto ya vivió el cambio
-- de Hotmart a OnePay, y había un `app/api/webhooks/hotmart/` que hubo que
-- borrar entero. Si la pasarela vuelve a cambiar —o si mañana entra otra para
-- otro país— lo que no debe cambiar es el sitio donde se guardan los eventos.
--
-- El proveedor es un DATO (`proveedor`), no el nombre de la tabla.
-- ============================================================================

create table if not exists webhook_eventos (
  id uuid primary key default gen_random_uuid(),

  -- 'onepay' hoy; mañana 'stripe', 'mercadopago', lo que toque.
  proveedor   text not null,

  -- El nombre del evento TAL CUAL lo manda el proveedor ('subscription.paid').
  -- Se guarda sin traducir: cuando algo falle, hay que poder comparar con su
  -- panel palabra por palabra.
  evento      text not null,

  -- Nuestro nombre normalizado, el que entiende la app sin saber de quién vino.
  tipo        text not null check (tipo in (
    'suscripcion.pagada', 'suscripcion.cancelada', 'desconocido'
  )),

  -- El id del recurso en el proveedor (la suscripción, el pago…).
  recurso_id  text not null,

  /*
   * ⚠️ LA HUELLA ES LO QUE EVITA DOS ERRORES OPUESTOS, y acertar aquí es lo más
   * delicado de esta tabla.
   *
   * Su documentación pide idempotencia porque los reintentos son normales (6 en
   * 9 minutos, más dos reenvíos periódicos). La tentación es poner la clave
   * única en (proveedor, evento, recurso_id).
   *
   * ESO ESTARÍA MAL: `subscription.paid` llega CADA MES para la MISMA
   * suscripción. Con esa clave, la renovación del mes siguiente se tomaría por
   * un duplicado y se descartaría — la alumna pagaría y perdería el acceso.
   *
   * La huella añade el dato que cambia entre ocurrencias pero NO entre
   * reintentos: la fecha de la próxima cobranza en un pago, la de cancelación
   * en una baja. Reintento = misma huella = se ignora. Renovación = huella
   * distinta = se procesa.
   */
  huella      text not null,

  estado      text not null default 'recibido' check (estado in (
    'recibido',   -- entró y se guardó
    'procesado',  -- se aplicó a la membresía
    'huerfano',   -- válido, pero no se supo de qué alumna era
    'error'       -- reventó al aplicarlo
  )),

  -- El cuerpo entero, sin tocar. Cuando algo no cuadre, esto es la verdad.
  cuerpo      jsonb not null,
  nota        text,

  recibido_en  timestamptz not null default now(),
  procesado_en timestamptz,

  unique (proveedor, huella)
);

alter table webhook_eventos enable row level security;
-- Sin políticas: solo lo escribe el servidor (service_role). Aquí hay datos de
-- cobro de otras personas.

create index if not exists webhook_eventos_estado_idx on webhook_eventos (estado, recibido_en desc);
create index if not exists webhook_eventos_recurso_idx on webhook_eventos (proveedor, recurso_id);

comment on table webhook_eventos is
  'Eventos de CUALQUIER pasarela. El proveedor es un dato, no el nombre de la tabla.';

-- ── La membresía recuerda de dónde vino ────────────────────────────────────
--
-- Genérico por el mismo motivo: `proveedor` + los dos ids que ese proveedor
-- usa. Cambiar de pasarela no obliga a migrar columnas.
alter table membresias add column if not exists proveedor text;
alter table membresias add column if not exists suscripcion_externa_id text;
alter table membresias add column if not exists cliente_externo_id text;

create index if not exists membresias_suscripcion_externa_idx
  on membresias (proveedor, suscripcion_externa_id);

comment on column membresias.suscripcion_externa_id is
  'El id de la suscripción en la pasarela. Es por donde el webhook encuentra a quién activar.';
