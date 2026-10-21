-- ============================================================================
-- 0021 · LA MARCA DEL CORREO DE BIENVENIDA
--
-- ⚠️ SIN ESTO, UNA ALUMNA RECIBE EL MISMO CORREO TODOS LOS MESES.
--
-- El webhook ya no repite el mismo evento (eso lo resuelve la huella de
-- `webhook_eventos`), pero la RENOVACIÓN de febrero es un evento legítimamente
-- distinto al pago de enero: huella distinta, se procesa, y volvería a disparar
-- la bienvenida. "Ya estás dentro" al mes trece es ridículo, y peor aún: hace
-- dudar de si le cobraron otra vez.
--
-- La condición "¿es su primer pago?" NO se puede deducir del estado de la
-- membresía: alguien que canceló y vuelve también tiene fila. Lo único que
-- responde la pregunta es si el correo ya salió, así que se guarda.
--
-- Es una FECHA y no un booleano a propósito: saber CUÁNDO se le dio la
-- bienvenida es lo que permite contestar "yo nunca recibí nada" mirando el dato
-- en vez de adivinando.
-- ============================================================================

alter table membresias
  add column if not exists bienvenida_enviada_el timestamptz;

comment on column membresias.bienvenida_enviada_el is
  'Cuándo salió el correo de bienvenida. NULL = todavía no. Evita repetirlo en cada renovación.';

-- ⚠️ LAS MEMBRESÍAS QUE YA EXISTÍAN SE MARCAN COMO YA AVISADAS.
--
-- Son las que se activaron a mano antes de que existiera este correo: esas
-- alumnas ya tienen su acceso y ya saben entrar. Si se dejaran en NULL, la
-- primera renovación que llegara por el webhook les mandaría una bienvenida a
-- gente que lleva meses dentro.
update membresias
   set bienvenida_enviada_el = coalesce(creada_el, now())
 where bienvenida_enviada_el is null
   and plan = 'completo';
