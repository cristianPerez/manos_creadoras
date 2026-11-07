/**
 * Mira los enlaces de pago y sus precios de `plan_checkout`, por entorno.
 *
 *   npm run checkout:ver                       (QA, de .env.local)
 *   npm run checkout:ver -- prod               (producción, de .env.prod)
 *
 * Para CAMBIAR precio o enlace: `npm run precio:cambiar` (ver ese archivo).
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ POR QUÉ EXISTE: QA NO PUEDE APUNTAR A LOS PLANES DE PRODUCCIÓN
 * ════════════════════════════════════════════════════════════════════════════
 * El panel de OnePay tiene dos modos —real y pruebas— con SUS planes, y no se
 * ven entre ellos. Producción tiene que apuntar a los reales y QA a los de
 * prueba, así que el enlace es CONFIGURACIÓN DE CADA ENTORNO y no esquema: una
 * migración no puede llevarlo bien para los dos a la vez.
 *
 * La convención del repo (ver `supabase/migrations/README.md`) es que la
 * migración lleve el enlace REAL —el correcto para producción— y que en QA se
 * sobrescriba después. Ese "después" se venía haciendo a mano, abriendo el
 * editor SQL del panel de Supabase, y es justo el paso que se olvida: si se
 * olvida, **QA manda a cobrar de verdad con tarjetas reales**. Este script es
 * para que deje de ser un paso a mano.
 *
 * ⚠️ `npm run checkout:ver` DESPUÉS DE CADA MIGRACIÓN QUE TOQUE ENLACES. Si en
 * QA aparece un enlace que no es de modo prueba, falta el update — y el pago de
 * prueba siguiente sería un cobro real.
 */
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const accion = args.shift();
/* El entorno es el primer argumento SOLO si dice "prod": así
   `checkout:fijar -- anual <url>` sigue significando QA, que es lo que se usa
   99 de cada 100 veces y es el lado donde equivocarse no cuesta dinero. */
const esProd = args[0] === "prod" || args[0] === "produccion";
if (esProd) args.shift();
const archivo = esProd ? ".env.prod" : ".env.local";

for (const line of readFileSync(archivo, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].split("#")[0].trim();
}

const { createClient } = await import("@supabase/supabase-js");
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const donde = esProd ? "PRODUCCIÓN" : "QA";

async function ver() {
  const { data, error } = await admin
    .from("plan_checkout")
    .select("plan, ciclo, region, variante, url, precio_usd, moneda, precio, actualizado_en")
    .order("variante")
    .order("ciclo")
    .order("region");
  if (error) {
    console.error(`No se pudo leer ${donde}:`, error.message);
    process.exit(1);
  }
  const { dinero } = await import("./lib/onepay.mjs");
  console.log(`\nEnlaces de pago en ${donde}:\n`);
  for (const f of data) {
    const valor = f.precio ?? f.precio_usd;
    const precio = valor == null ? "sin precio" : dinero(valor, f.moneda ?? "USD");
    console.log(`  ${(f.variante ?? "a").toUpperCase()}  ${f.ciclo.padEnd(8)} ${f.region.padEnd(14)} ${precio.padEnd(14)} ${f.url}`);
  }
  console.log();
}

/*
 * ⚠️ `fijar` YA NO ESCRIBE (2026-11-03). Cambiaba solo el ENLACE, y desde la
 * migración 0044 el precio vive en la misma fila: cambiar uno sin el otro es
 * justo el desajuste "anuncia un precio, cobra otro" que se quería evitar.
 * Ahora lo hace `precio:cambiar`, que además verifica el plan contra OnePay.
 */
function fijar() {
  console.error(
    "\n`checkout:fijar` ya no se usa: el precio y el enlace se cambian juntos.\n" +
      "Usa:  npm run precio:cambiar -- [prod] <mensual|anual> <precio> https://pagos.onepay.la/plan/<id>\n",
  );
  process.exit(1);
}

if (accion === "ver") await ver();
else if (accion === "fijar") fijar();
else {
  console.error("Acciones:  ver | fijar");
  process.exit(1);
}
