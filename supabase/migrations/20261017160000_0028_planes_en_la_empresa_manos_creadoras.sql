-- ============================================================================
-- 0028 · LOS PLANES SE MUDAN A LA EMPRESA "MANOS CREADORAS"
--
-- ⚠️ LA EMPRESA DE ONEPAY DONDE VIVÍA TODO SE RENOMBRÓ A "EL CHARCU".
--
-- Lo que parecía un fallo del panel era real: Cristian renombró esa empresa
-- (la del NIT GOINGTUBE S.A.S.) para dedicarla a otro negocio. El síntoma que
-- lo destapó fue el checkout público, que enseñaba "El charcu" a quien iba a
-- pagar un curso de bolsos — justo donde una marca desconocida produce
-- abandonos y contracargos de "no reconozco este cobro".
--
-- Así que los planes se crearon de nuevo en la empresa que SÍ se llama Manos
-- Creadoras, con su paleta (#2A1F19) en el checkout. Verificado: ahora el
-- portal de pago dice "Manos Creadoras" y cobra lo que anuncia.
--
--   Creadora Mensual · Lanzamiento — US$9.99 · Mensual · Ilimitado
--   Creadora Anual  · Lanzamiento — US$80.00 · Mensual · 12 ciclos
--
-- (Sobre "Mensual · 12 ciclos": es el plan ANUAL. Lo confirmó el dueño de
-- OnePay el 2026-10-16 — frecuencia y número se leen juntos: cada 12 meses.)
--
-- ════════════════════════════════════════════════════════════════════════════
-- 🔴 EL WEBHOOK SE QUEDÓ EN LA EMPRESA VIEJA Y HAY QUE REHACERLO
-- ════════════════════════════════════════════════════════════════════════════
-- El webhook `2e09a72f` vive en la empresa que ahora es "El charcu", y los
-- webhooks NO se comparten entre empresas. Es decir: con estos enlaces, una
-- alumna puede pagar y **la app no se entera** — su membresía no se activa y
-- no recibe el correo de bienvenida.
--
-- Hace falta, en la empresa Manos Creadoras: crear el webhook apuntando a
-- `/api/webhooks/onepay`, copiar su Secreto y su Header, y reemplazar
-- ONEPAY_WEBHOOK_SECRET / ONEPAY_WEBHOOK_TOKEN en `.env.local` y en Vercel.
-- Hasta entonces los cobros entran en OnePay pero no abren ningún acceso.
-- ════════════════════════════════════════════════════════════════════════════

update plan_checkout
   set url = 'https://pagos.onepay.la/plan/01a14b95-f607-73cc-8292-832056662fbd',
       actualizado_en = now()
 where plan = 'completo' and ciclo = 'mensual';

update plan_checkout
   set url = 'https://pagos.onepay.la/plan/01a14b96-796a-71fc-81f8-75a1750ad54e',
       actualizado_en = now()
 where plan = 'completo' and ciclo = 'anual';
