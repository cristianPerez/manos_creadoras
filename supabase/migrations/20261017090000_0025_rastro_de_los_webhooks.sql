-- ============================================================================
-- 0025 · EL RASTRO DE CADA WEBHOOK
--
-- Dos columnas que responden las dos preguntas que uno se hace cuando un pago
-- va mal, y que hoy no se podían contestar.
--
-- ── `traza` ────────────────────────────────────────────────────────────────
-- El MISMO código corto aparece en la fila y en todas las líneas de log de ese
-- evento. Sin él, con dos pagos a la vez, los logs se entrelazan y no hay forma
-- de saber qué línea pertenece a cuál: se lee "la firma no coincide" y
-- "membresía activada" seguidas, sin saber si son del mismo pago o de dos
-- distintos.
--
-- Con él: se copia la traza de la fila, se busca en los logs de Vercel, y sale
-- la historia completa de ESE pago.
--
-- ── `duracion_ms` ──────────────────────────────────────────────────────────
-- ⚠️ ONEPAY CORTA A LOS 10 SEGUNDOS. Su documentación lo dice: si no
-- respondemos a tiempo lo da por fallido y lo reintenta — y un endpoint que
-- falla de forma sostenida lo DESACTIVAN.
--
-- Hoy no sabemos cuánto tardamos. Con esta columna se ve, y sobre todo se ve
-- ANTES de que sea un problema: el día que el envío del correo o una consulta
-- empiece a tardar, el número sube y se nota.
-- ============================================================================

alter table webhook_eventos
  add column if not exists traza       text,
  add column if not exists duracion_ms integer;

comment on column webhook_eventos.traza is
  'Código corto que une esta fila con sus líneas de log. Para seguir UN evento.';
comment on column webhook_eventos.duracion_ms is
  'Lo que tardamos en procesarlo. OnePay corta a los 10.000 ms.';

-- Para encontrar la fila por su traza al investigar un caso concreto.
create index if not exists webhook_eventos_traza_idx
  on webhook_eventos (traza);

-- Lo que de verdad se consulta a diario: "¿qué ha fallado últimamente?".
-- Parcial, porque lo normal es 'procesado' y esos no hace falta indexarlos.
create index if not exists webhook_eventos_pendientes_idx
  on webhook_eventos (recibido_en desc)
  where estado in ('huerfano', 'error');
