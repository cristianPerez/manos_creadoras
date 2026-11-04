/**
 * Cambia el precio de un ciclo: precio + enlace de OnePay, juntos y verificados.
 *
 *   npm run precio:cambiar -- mensual 14,70 https://pagos.onepay.la/plan/<id>          (QA, simulación)
 *   npm run precio:cambiar -- prod anual 97 https://pagos.onepay.la/plan/<id>          (producción, simulación)
 *   npm run precio:cambiar -- prod anual 97 https://pagos.onepay.la/plan/<id> --si     (producción, de verdad)
 *
 * Antes, crear el plan en el panel de OnePay (en un plan no se edita el precio:
 * se crea uno nuevo). Este comando hace TODO lo demás. No hace falta publicar
 * código: la app lee precio y enlace de `plan_checkout` en cada visita.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ QUÉ COMPRUEBA ANTES DE ESCRIBIR (y si algo falla, NO escribe)
 * ════════════════════════════════════════════════════════════════════════════
 * Abre la página pública del plan en OnePay y lee lo que cobra de verdad:
 *   · el MONTO es exactamente el precio que escribiste (al centavo). Así no
 *     pasa lo del 2026-11-03, cuando el panel leyó "14.70" como 1.470;
 *   · la MONEDA es USD y el IMPUESTO 0% (la página promete lo que se cobra);
 *   · la FRECUENCIA es la del ciclo (mensual = "mes", anual = "año");
 *   · el MODO es el del entorno: producción solo acepta planes REALES y QA solo
 *     planes de MODO PRUEBA. Sin esto, QA podría acabar cobrando de verdad.
 *
 * Sin `--si` solo SIMULA: enseña el antes y el después. Cambia las dos regiones
 * (Colombia e internacional) a la vez, como desde la 0037. Cada cambio queda en
 * `plan_checkout_historial` (lo escribe un trigger, migración 0044).
 *
 * ⚠️ NO archiva el plan viejo en OnePay: quien ya pagó sigue en él con su
 * precio. Archivar es irreversible y se decide aparte.
 */
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const confirmar = args.includes("--si");
const resto = args.filter((a) => a !== "--si");
const esProd = resto[0] === "prod" || resto[0] === "produccion";
if (esProd) resto.shift();
const [ciclo, precioTexto, url] = resto;

const USO =
  "Uso:  npm run precio:cambiar -- [prod] <mensual|anual> <precio en USD> https://pagos.onepay.la/plan/<id> [--si]";

function parar(motivo) {
  console.error(`\n❌ ${motivo}\n`);
  process.exit(1);
}

if (!["mensual", "anual"].includes(ciclo)) parar(`Falta el ciclo (mensual o anual).\n${USO}`);
const precio = Number(String(precioTexto ?? "").replace(",", "."));
if (!/^\d+([.,]\d{1,2})?$/.test(String(precioTexto ?? "")) || !(precio > 0)) {
  parar(`"${precioTexto ?? ""}" no es un precio válido. Escríbelo así: 14,70 o 97.\n${USO}`);
}
if (!/^https:\/\/pagos\.onepay\.la\/plan\/[0-9a-f-]{36}$/.test(url ?? "")) {
  parar(`El enlace tiene que ser https://pagos.onepay.la/plan/<id>.\n${USO}`);
}

const archivo = esProd ? ".env.prod" : ".env.local";
for (const linea of readFileSync(archivo, "utf8").split("\n")) {
  const m = linea.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].split("#")[0].trim();
}
const donde = esProd ? "PRODUCCIÓN" : "QA";
const dinero = (v) => (v == null ? "—" : `US$${Number(v).toFixed(2).replace(".", ",")}`);

/* ── 1. Lo que cobra el plan de verdad, leído de su página en OnePay ─────── */
const pagina = await fetch(url, { redirect: "follow" }).then((r) => (r.ok ? r.text() : null));
if (!pagina) parar(`OnePay no devolvió la página del plan (${url}). ¿Está bien copiado el enlace?`);

/* Los datos van en un JSON dentro de la página: "currency":"USD",
   "unitAmountInCents":1470… Se lee el primer valor de cada campo. */
const campo = (nombre) => {
  const m = pagina.match(new RegExp(`"${nombre}":(?:"((?:[^"\\\\]|\\\\.)*)"|([^,}\\]]+))`));
  return m ? (m[1] ?? m[2]) : undefined;
};
const leido = {
  esPrueba: campo("isTest") === "true",
  moneda: campo("currency"),
  centavos: Number(campo("unitAmountInCents")),
  impuesto: Number(campo("taxRatePercent")),
  frecuencia: JSON.parse(`"${campo("frequencyShort") ?? ""}"`),
};
if (!Number.isFinite(leido.centavos)) {
  parar("No se pudo leer el monto en la página de OnePay. Puede que hayan cambiado su página: revisa a mano.");
}

const problemas = [];
if (leido.centavos !== Math.round(precio * 100)) {
  problemas.push(`El plan cobra ${dinero(leido.centavos / 100)}, no ${dinero(precio)}.`);
}
if (leido.moneda !== "USD") problemas.push(`El plan está en ${leido.moneda}, no en USD.`);
if (leido.impuesto !== 0) problemas.push(`El plan tiene ${leido.impuesto}% de impuesto: cobraría más de lo que dice la página.`);
const frecuenciaEsperada = ciclo === "mensual" ? "mes" : "año";
if (leido.frecuencia !== frecuenciaEsperada) {
  problemas.push(`El plan se cobra cada "${leido.frecuencia}", y el ciclo ${ciclo} es cada "${frecuenciaEsperada}".`);
}
if (esProd && leido.esPrueba) problemas.push("Es un plan de MODO PRUEBA: en producción no cobraría nada de verdad.");
if (!esProd && !leido.esPrueba) {
  problemas.push("Es un plan REAL: en QA se cobraría de verdad. Para QA crea el plan en modo pruebas.");
}

console.log(`\nPlan de OnePay: ${dinero(leido.centavos / 100)} ${leido.moneda} cada ${leido.frecuencia} · impuesto ${leido.impuesto}% · ${leido.esPrueba ? "modo prueba" : "modo real"}`);
if (problemas.length) parar(`No se cambia nada:\n   · ${problemas.join("\n   · ")}`);
console.log("✅ Coincide con lo que pediste.");

/* ── 2. El antes y el después ────────────────────────────────────────────── */
const { createClient } = await import("@supabase/supabase-js");
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: antes, error: errorLeer } = await admin
  .from("plan_checkout")
  .select("region, url, precio_usd")
  .eq("plan", "completo")
  .eq("ciclo", ciclo)
  .order("region");
if (errorLeer) parar(`No se pudo leer ${donde}: ${errorLeer.message}`);
if (!antes?.length) parar(`${donde} no tiene filas del plan ${ciclo} en plan_checkout.`);

console.log(`\n${donde} · plan ${ciclo}:`);
for (const f of antes) {
  console.log(`  ${f.region.padEnd(14)} ${dinero(f.precio_usd).padEnd(10)} → ${dinero(precio).padEnd(10)}  ${f.url === url ? "(mismo enlace)" : url}`);
}

if (!confirmar) {
  console.log(`\nSimulación: no se cambió nada. Para aplicarlo, repite el comando con --si al final.\n`);
  process.exit(0);
}

/* ── 3. Escribir precio y enlace en el MISMO update ──────────────────────── */
const { data: cambiadas, error: errorEscribir } = await admin
  .from("plan_checkout")
  .update({ url, precio_usd: precio, actualizado_en: new Date().toISOString() })
  .eq("plan", "completo")
  .eq("ciclo", ciclo)
  .select("region");
if (errorEscribir) parar(`No se pudo escribir en ${donde}: ${errorEscribir.message}`);

console.log(`\n✅ ${donde}: plan ${ciclo} a ${dinero(precio)} en ${cambiadas.length} regiones (${cambiadas.map((f) => f.region).join(", ")}).`);
console.log("   La página ya lo enseña: lee precio y enlace de la base en cada visita, sin publicar código.");
if (esProd) {
  console.log("   ⚠️ Si cambió el precio, actualiza también PRECIOS_RESPALDO en lib/planes.ts (solo se usa si la base falla).");
}
console.log();
