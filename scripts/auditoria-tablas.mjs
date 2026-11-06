/**
 * AUDITORÍA DE LA BASE: qué tablas tienen datos, qué columnas siguen vacías.
 *
 * Solo LEE. Va por PostgREST con la clave de servidor, así que no necesita la
 * contraseña de Postgres (que no entra; ver ESTADO.md).
 *
 *   npm run auditoria:tablas              → QA
 *   npm run auditoria:tablas -- prod      → producción
 *
 * Qué contesta: qué tablas están VACÍAS (candidatas a muertas o a nunca
 * estrenadas) y, en las que tienen datos, qué columnas están nulas y en cuántas
 * filas. De aquí salieron las migraciones 0047 y 0048 (2026-11-06): dos tablas
 * muertas, seis columnas de `profiles` que ya no decidían nada, y el hallazgo
 * de que `profiles.nombre` y `notas_tejido` estaban vacías porque NO HABÍA
 * dónde escribirlas.
 *
 * ⚠️ Una columna 100% nula no es siempre un error: puede ser que nadie haya
 * estrenado esa función todavía. Antes de borrar nada, hay que buscar en el
 * código quién la escribe — es lo que salvó a `membresias.pasarela`, que está
 * vacía pero la escribe `dar_membresia()`.
 */
import { readFileSync } from "node:fs";

const archivo = process.argv[2] === "prod" ? ".env.prod" : ".env.local";
const env = {};
for (const linea of readFileSync(archivo, "utf8").split("\n")) {
  const m = linea.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const URL_BASE = `${env.SUPABASE_URL}/rest/v1`;
const CLAVE = env.SUPABASE_SECRET_KEY;
const cabeceras = { apikey: CLAVE, Authorization: `Bearer ${CLAVE}` };

async function cuantas(ruta) {
  const r = await fetch(`${URL_BASE}/${ruta}`, {
    headers: { ...cabeceras, Prefer: "count=exact", Range: "0-0" },
  });
  const cr = r.headers.get("content-range");
  if (!r.ok) return `ERROR ${r.status}`;
  return Number(cr?.split("/")[1] ?? 0);
}

const spec = await (await fetch(`${URL_BASE}/`, { headers: cabeceras })).json();
const tablas = Object.entries(spec.definitions ?? {});

console.log(`\n=== ${archivo} · ${tablas.length} tablas ===\n`);

for (const [tabla, def] of tablas) {
  const total = await cuantas(`${tabla}?select=*`);
  if (typeof total !== "number") {
    console.log(`${tabla}: ${total}`);
    continue;
  }
  const columnas = Object.keys(def.properties ?? {});
  const vacias = [];
  if (total > 0) {
    for (const col of columnas) {
      const conDato = await cuantas(`${tabla}?select=${col}&${col}=not.is.null`);
      if (conDato === 0) vacias.push(`${col} (100% nulo)`);
      else if (typeof conDato === "number" && conDato < total)
        vacias.push(`${col} (${total - conDato}/${total} nulos)`);
    }
  }
  console.log(
    `${total === 0 ? "🔴 VACÍA" : "   " + String(total).padStart(6)} · ${tabla}` +
      (vacias.length ? `\n              ↳ ${vacias.join(" · ")}` : ""),
  );
}
