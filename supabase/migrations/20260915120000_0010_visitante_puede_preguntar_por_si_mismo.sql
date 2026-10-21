-- ============================================================================
-- Los 3 videos libres no se veían: la política preguntaba algo que el visitante
-- no tenía permiso de preguntar (2026-09-15)
--
-- EL FALLO. La 0009 abrió `lecciones` con `using (es_libre or tiene_acceso())`,
-- dando por hecho que para una fila libre bastaba con la primera mitad. No es
-- así: Postgres no garantiza el orden de evaluación de un `or`, y `tiene_acceso`
-- estaba REVOCADA para `anon` desde la 0002. Resultado: un visitante sin cuenta
-- no recibía los videos libres — recibía un error 42501 y CERO filas, igual que
-- si no existieran.
--
-- ⚠️ Y lo peor: fallaba en silencio desde el punto de vista del código. La
-- consulta no devuelve "no hay nada", devuelve un error que, si quien lo llama
-- no lo mira, se convierte en una lista vacía. La primera prueba que corrí lo
-- dio por bueno justamente por eso.
--
-- EL ARREGLO. Se le devuelve a `anon` el permiso de llamar a `tiene_acceso()`
-- —la versión SIN parámetro—, que es lo que la política necesita.
--
-- POR QUÉ ESTO NO REABRE EL AGUJERO QUE CERRÓ LA 0002. Son dos funciones muy
-- distintas y conviene no confundirlas:
--
--   · `tiene_acceso_de(uid)` — responde sobre CUALQUIERA. Esa era la fuga: con
--     ella se podían probar UUIDs y averiguar qué alumnas tienen membresía.
--     SIGUE revocada para todo el mundo menos el servidor. No se toca aquí.
--
--   · `tiene_acceso()` — responde solo sobre QUIEN LLAMA, usando `auth.uid()`
--     por dentro. Para un visitante sin sesión, `auth.uid()` es null, así que
--     la respuesta es siempre `false`. No hay ningún UUID que probar ni ningún
--     dato de nadie que se filtre: lo único que puede averiguar un desconocido
--     es que él mismo no tiene acceso, cosa que ya sabía.
-- ============================================================================

grant execute on function tiene_acceso() to anon;

-- La versión con parámetro se vuelve a revocar por si acaso. No debería hacer
-- falta —nadie la tocó— pero es la que filtraba, y dejar su permiso a merced de
-- que ninguna migración futura se equivoque es demasiada confianza para lo que
-- cuesta escribir la línea.
revoke all on function tiene_acceso_de(uuid) from public, anon, authenticated;
grant execute on function tiene_acceso_de(uuid) to service_role;
