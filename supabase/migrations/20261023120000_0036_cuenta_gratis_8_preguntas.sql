-- ============================================================================
-- 0036 · LA CUENTA GRATIS PASA DE 3 A 8 PREGUNTAS AL MES
--
-- Decisión de Cristian (2026-10-23), tras la auditoría de /app. El visitante
-- sin cuenta sigue con 2 preguntas en total (`PREGUNTAS_DE_VISITANTE`, en el
-- código); crear la cuenta gratis ahora da 8 al mes. Las fotos no cambian (1).
--
-- Solo cambia el número: `estado_cupo` y `consumir_cupo` ya leen el tope de
-- `plan_cupos`, así que la app y el contador lo siguen sin tocar código.
-- ============================================================================

update plan_cupos set preguntas_mes = 8 where plan = 'gratis';
