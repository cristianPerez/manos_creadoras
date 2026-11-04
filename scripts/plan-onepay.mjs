/**
 * Cambia el precio de un ciclo DE PUNTA A PUNTA, por la API de OnePay:
 * crea el plan nuevo → lo verifica → apunta la tabla a él → borra el viejo.
 *
 *   npm run plan:onepay -- mensual 14,70              (QA, simulación: no toca nada)
 *   npm run plan:onepay -- mensual 14,70 --si         (QA, de verdad)
 *   npm run plan:onepay -- prod anual 97 --si         (producción, de verdad)
 *   ... --conservar-viejo                             (no borra el plan anterior)
 *
 * No hace falta publicar código ni escribir migraciones: la app lee precio y
 * enlace de `plan_checkout` en cada visita (migración 0044).
 *
 * ════════════════════════════════════════════════════════════════════════════
 * EL ORDEN IMPORTA, Y ES ESTE
 * ════════════════════════════════════════════════════════════════════════════
 * 1. CREA el plan en OnePay (con la clave del entorno: QA = modo prueba,
 *    producción = modo real) y recibe su enlace.
 * 2. VERIFICA la página pública del enlace: monto al centavo, USD, impuesto 0%,
 *    frecuencia y modo. Si algo no cuadra, PARA: la tabla no se toca y el plan
 *    recién creado se borra (no queda basura en el panel).
 * 3. ACTUALIZA `plan_checkout` (precio + enlace en un solo update, las dos
 *    regiones). Desde aquí la página ya cobra el plan nuevo.
 * 4. BORRA el plan viejo DIRECTAMENTE con su id guardado en la tabla
 *    (`onepay_plan_id`, migración 0046), sin recorrer suscripciones (decisión
 *    de Cristian, 2026-11-04). Solo se salta si otro ciclo de la tabla usa el
 *    mismo plan, o con `--conservar-viejo`. Borrar en OnePay es irreversible.
 *
 * Qué dice el plan en OnePay sale de `lib/membresia.json` (lo mismo que enseña
 * la web) y los cupos del Ojo Experto de `plan_cupos` (lo que la app permite de
 * verdad), para que la página de pago no prometa algo distinto.
 *
 * Cada cambio en la tabla queda en `plan_checkout_historial` (trigger, 0044).
 */
import { readFileSync } from "node:fs";
import {
  cargarEntorno,
  describir,
  dinero,
  idDelEnlace,
  onepay,
  verificarPlan,
} from "./lib/onepay.mjs";

const args = process.argv.slice(2);
const confirmar = args.includes("--si");
const conservarViejo = args.includes("--conservar-viejo");
const resto = args.filter((a) => !a.startsWith("--"));
const esProd = resto[0] === "prod" || resto[0] === "produccion";
if (esProd) resto.shift();
const [ciclo, precioTexto] = resto;

const USO = "Uso:  npm run plan:onepay -- [prod] <mensual|anual> <precio en USD> [--si] [--conservar-viejo]";
function parar(motivo) {
  console.error(`\n❌ ${motivo}\n`);
  process.exit(1);
}

if (!["mensual", "anual"].includes(ciclo)) parar(`Falta el ciclo (mensual o anual).\n${USO}`);
if (!/^\d+([.,]\d{1,2})?$/.test(String(precioTexto ?? ""))) {
  parar(`"${precioTexto ?? ""}" no es un precio válido. Escríbelo así: 14,70 o 97.\n${USO}`);
}
const precio = Number(String(precioTexto).replace(",", "."));
const centavos = Math.round(precio * 100);
if (!(centavos > 0)) parar("El precio tiene que ser mayor que cero.");

const donde = cargarEntorno(esProd);
const { createClient } = await import("@supabase/supabase-js");
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/* ── Lo que hay hoy ──────────────────────────────────────────────────────── */
const { data: filas, error: errorFilas } = await db
  .from("plan_checkout")
  .select("ciclo, region, url, precio_usd, onepay_plan_id")
  .eq("plan", "completo");
if (errorFilas) parar(`No se pudo leer ${donde}: ${errorFilas.message}`);
const delCiclo = filas.filter((f) => f.ciclo === ciclo);
if (!delCiclo.length) parar(`${donde} no tiene filas del plan ${ciclo} en plan_checkout.`);

const { data: cupos } = await db
  .from("plan_cupos")
  .select("preguntas_mes, fotos_mes")
  .eq("plan", "completo")
  .single();
if (!cupos) parar("No se pudieron leer los cupos del plan completo (plan_cupos).");

/* ── El plan nuevo ───────────────────────────────────────────────────────── */
const membresia = JSON.parse(readFileSync("lib/membresia.json", "utf8"));
const etiqueta = ciclo === "mensual" ? "Mensual" : "Anual";
const caracteristica = (texto, cantidad) =>
  cantidad == null
    ? { feature_name: texto, included: true, has_quantity: false }
    : { feature_name: texto, included: true, has_quantity: true, quantity: cantidad };

const plan = {
  name: `${membresia.onepay.nombre} · ${etiqueta}`,
  description: membresia.onepay.descripcion,
  internal_id: `MC-${etiqueta.toUpperCase()}-${precio.toFixed(2)}-USD`,
  currency: "USD",
  amount_in_cents: centavos,
  reference_price_in_cents: String(centavos),
  /*
   * ⚠️ EL ANUAL ES "MENSUAL CADA 12", NO "yearly". Así están todos los
   * anuales que hay en OnePay (los creados en el panel con frecuencia "Anual"
   * salen por la API como monthly × 12) y así su página dice "/ año". El
   * mensual es monthly × 1: con × 12 cobraría UNA vez al año el precio de un
   * mes. `cicles: null` = se renueva hasta que se cancele.
   */
  cicle_frequency: "monthly",
  cicle_interval_count: ciclo === "mensual" ? 1 : 12,
  cicles: null,
  features: [
    caracteristica(`Hasta ${cupos.preguntas_mes} preguntas al mes al Ojo Experto`),
    caracteristica("Fotos al mes para que el Ojo Experto revise tu trabajo", cupos.fotos_mes),
    ...membresia.incluye.filter((t) => !/Ojo Experto/.test(t)).map((t) => caracteristica(t)),
  ],
  allows: membresia.onepay.allows,
};

console.log(`\n${donde} · plan ${ciclo}`);
for (const f of delCiclo) console.log(`  hoy  ${f.region.padEnd(14)} ${dinero(f.precio_usd).padEnd(10)} ${f.url}`);
console.log(`  nuevo: "${plan.name}" · ${dinero(precio)} cada ${ciclo === "mensual" ? "mes" : "año"} · USD · ${plan.features.length} características`);

/* El id guardado manda; la URL solo como respaldo para una fila sin id. */
const idDe = (f) => f.onepay_plan_id ?? idDelEnlace(f.url);
const viejos = [...new Set(delCiclo.map(idDe).filter(Boolean))];
if (!confirmar) {
  for (const id of viejos) {
    console.log(`  plan viejo ${id} → ${conservarViejo ? "se conserva (--conservar-viejo)" : "se borrará"}`);
  }
  console.log("\nSimulación: no se creó ni se cambió nada. Para hacerlo, repite el comando con --si al final.\n");
  process.exit(0);
}

/* ── 1. Crear ─────────────────────────────────────────────────────────────── */
const idempotencia = `mc-${esProd ? "prod" : "qa"}-${ciclo}-${centavos}-${Date.now()}`;
const creado = await onepay("POST", "/plans", plan, { "x-idempotency": idempotencia });
if (!creado.ok) parar(`OnePay no creó el plan (${creado.status}): ${JSON.stringify(creado.datos).slice(0, 400)}`);
const nuevoId = creado.datos?.id ?? creado.datos?.data?.id;
const nuevoEnlace = creado.datos?.link ?? creado.datos?.data?.link ?? (nuevoId && `https://pagos.onepay.la/plan/${nuevoId}`);
if (!nuevoId || !nuevoEnlace) parar(`OnePay respondió sin id ni enlace: ${JSON.stringify(creado.datos).slice(0, 400)}`);
console.log(`\n✅ 1/4 Plan creado en OnePay: ${nuevoEnlace}`);

/* ── 2. Verificar ─────────────────────────────────────────────────────────── */
const { leido, problemas } = await verificarPlan(nuevoEnlace, { ciclo, precio, esProd });
if (problemas.length) {
  const borrado = await onepay("DELETE", `/plans/${nuevoId}`);
  parar(
    `El plan creado no cuadra y NO se usó:\n   · ${problemas.join("\n   · ")}\n` +
      `   ${borrado.ok ? "Se borró de OnePay." : `⚠️ No se pudo borrar (${borrado.status}): bórralo a mano, id ${nuevoId}.`}`,
  );
}
console.log(`✅ 2/4 Verificado en su página: ${describir(leido)}`);

/* ── 3. Apuntar la tabla al plan nuevo ───────────────────────────────────── */
const { data: cambiadas, error: errorEscribir } = await db
  .from("plan_checkout")
  .update({
    url: nuevoEnlace,
    precio_usd: precio,
    onepay_plan_id: nuevoId,
    actualizado_en: new Date().toISOString(),
  })
  .eq("plan", "completo")
  .eq("ciclo", ciclo)
  .select("region");
if (errorEscribir) {
  parar(`El plan se creó (${nuevoEnlace}) pero no se pudo escribir en ${donde}: ${errorEscribir.message}. La página sigue con el plan viejo; repite con precio:cambiar.`);
}
console.log(`✅ 3/4 ${donde}: plan ${ciclo} a ${dinero(precio)} en ${cambiadas.length} regiones. La página ya lo enseña.`);

/* ── 4. Borrar el plan viejo (si nadie lo usa) ───────────────────────────── */
const enUsoAun = new Set(filas.filter((f) => f.ciclo !== ciclo).map(idDe));
for (const id of viejos.filter((v) => v !== nuevoId)) {
  if (conservarViejo) {
    console.log(`·   4/4 Plan viejo ${id}: se conserva (--conservar-viejo).`);
    continue;
  }
  if (enUsoAun.has(id)) {
    console.log(`·   4/4 Plan viejo ${id}: lo usa otro ciclo de la tabla, se conserva.`);
    continue;
  }
  const borrado = await onepay("DELETE", `/plans/${id}`);
  console.log(
    borrado.ok
      ? `✅ 4/4 Plan viejo ${id} borrado de OnePay.`
      : `⚠️ 4/4 No se pudo borrar el plan viejo ${id} (${borrado.status}): ${JSON.stringify(borrado.datos).slice(0, 200)}`,
  );
}

if (esProd) {
  console.log("\n⚠️ Actualiza PRECIOS_RESPALDO en lib/planes.ts cuando puedas (solo se usa si la base falla).");
}
console.log();
