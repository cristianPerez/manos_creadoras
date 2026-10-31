-- ============================================================================
-- 0037 · PRECIO NUEVO: US$19,70 AL MES · US$167 AL AÑO
--
-- Cristian subió el precio el 2026-10-31. Los planes de OnePay NO se editan de
-- precio: se crean nuevos. Así que en la empresa "Manos Creadoras" se crearon
-- dos planes limpios, en USD y con 0% de impuesto (el valor que se cobra es
-- exactamente el que anuncia la página):
--
--   Curso completo de bolsos de perlas · Mensual — US$19.70 · Mensual · Ilimitado
--     01a192d6-6925-7101-bef2-40c9e0ffb994   (id interno `completo-mensual`)
--   Curso completo de bolsos de perlas · Anual   — US$167.00 · Anual  · Ilimitado
--     01a192d6-d124-715e-905a-2d268c8cd944   (id interno `completo-anual`)
--
-- Esta vez el ANUAL usa la frecuencia "Anual" del panel, no el apaño de
-- "Mensual · 12 ciclos" de la 0028 — el panel ya la ofrece y se lee sin
-- interpretar nada.
--
-- ⚠️ AHORA ES EL MISMO ENLACE PARA LAS DOS REGIONES. La 0018 tenía uno para
-- Colombia y otro internacional porque eran dos planes distintos; estos dos son
-- en USD y sirven igual para ambas. Si algún día hace falta cobrar en COP a
-- Colombia, se crea su plan y se cambia SOLO su fila: la app ya elige por
-- región sin tocar código.
--
-- ⚠️ EL ANUAL NO TENÍA FILA HASTA HOY (la 0028 hacía `update` sobre algo que no
-- existía, así que no hizo nada). Por eso aquí es `insert … on conflict`: crea
-- las cuatro filas o las actualiza, según estén.
--
-- 🔴 SIGUE PENDIENTE EL WEBHOOK de la empresa "Manos Creadoras" (ver 0028). Con
-- estos enlaces se puede pagar, pero mientras no exista ese webhook la app no
-- se entera del pago y la membresía no se abre sola.
-- ============================================================================

insert into plan_checkout (plan, ciclo, region, url) values
  ('completo', 'mensual', 'colombia',
   'https://pagos.onepay.la/plan/01a192d6-6925-7101-bef2-40c9e0ffb994'),
  ('completo', 'mensual', 'internacional',
   'https://pagos.onepay.la/plan/01a192d6-6925-7101-bef2-40c9e0ffb994'),
  ('completo', 'anual', 'colombia',
   'https://pagos.onepay.la/plan/01a192d6-d124-715e-905a-2d268c8cd944'),
  ('completo', 'anual', 'internacional',
   'https://pagos.onepay.la/plan/01a192d6-d124-715e-905a-2d268c8cd944')
on conflict (plan, ciclo, region) do update
  set url = excluded.url, actualizado_en = now();
