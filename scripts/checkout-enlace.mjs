/**
 * Mira y cambia los enlaces de pago de `plan_checkout`, por entorno.
 *
 *   npm run checkout:ver                       (QA, de .env.local)
 *   npm run checkout:ver -- prod               (producción, de .env.prod)
 *   npm run checkout:fijar -- anual https://pagos.onepay.la/plan/<id>
 *   npm run checkout:fijar -- prod anual https://pagos.onepay.la/plan/<id>
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
    .select("plan, ciclo, region, url, actualizado_en")
    .order("ciclo")
    .order("region");
  if (error) {
    console.error(`No se pudo leer ${donde}:`, error.message);
    process.exit(1);
  }
  console.log(`\nEnlaces de pago en ${donde}:\n`);
  for (const f of data) {
    console.log(`  ${f.ciclo.padEnd(8)} ${f.region.padEnd(14)} ${f.url}`);
  }
  console.log();
}

async function fijar() {
  const [ciclo, url] = args;
  if (!["mensual", "anual"].includes(ciclo) || !url?.startsWith("https://pagos.onepay.la/plan/")) {
    console.error(
      "Uso:  npm run checkout:fijar -- [prod] <mensual|anual> https://pagos.onepay.la/plan/<id>",
    );
    process.exit(1);
  }

  /* Las dos regiones a la vez: desde la 0037 comparten plan, y la 0039 dejó
     dicho que si alguna vez se separan, se separan a propósito y a mano. */
  const { data, error } = await admin
    .from("plan_checkout")
    .update({ url, actualizado_en: new Date().toISOString() })
    .eq("plan", "completo")
    .eq("ciclo", ciclo)
    .select("region");
  if (error) {
    console.error(`No se pudo escribir en ${donde}:`, error.message);
    process.exit(1);
  }
  console.log(`\n✅ ${donde} · plan ${ciclo} → ${url}`);
  console.log(`   Filas cambiadas: ${data.length} (${data.map((f) => f.region).join(", ")})`);
  await ver();
}

if (accion === "ver") await ver();
else if (accion === "fijar") await fijar();
else {
  console.error("Acciones:  ver | fijar");
  process.exit(1);
}
