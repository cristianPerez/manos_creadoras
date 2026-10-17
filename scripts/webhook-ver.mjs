#!/usr/bin/env node
import { readFileSync } from "node:fs";

/**
 * QUÉ HA PASADO CON LOS WEBHOOKS. El panel que todavía no existe.
 *
 * ⚠️ ESTO ES LO QUE SUSTITUYE A DATADOG en este proyecto (decidido el
 * 2026-10-17). La información ya estaba toda en `webhook_eventos` —con el
 * cuerpo completo de cada evento, que es MÁS de lo que guardaría una
 * herramienta de logs— y lo único que faltaba era poder leerla sin abrir el
 * editor de SQL de Supabase. Eso es este archivo.
 *
 * El día que haya backoffice, esta consulta es la pantalla.
 *
 * USO
 *   npm run webhook:ver                 los 15 últimos
 *   npm run webhook:ver -- --malos      solo los huérfanos y los erróneos
 *   npm run webhook:ver -- --traza a1b2 la historia de UNO, con su cuerpo
 */

const args = process.argv.slice(2);
const opcion = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : d;
};

let env = {};
try {
  env = Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
      .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
  );
} catch {
  console.error("✗ No encuentro .env.local. Ejecútalo desde la raíz del proyecto.");
  process.exit(1);
}

const U = (env.SUPABASE_URL ?? "").replace(/^"|"$/g, "");
const K = (env.SUPABASE_SECRET_KEY ?? "").replace(/^"|"$/g, "");
if (!U || !K) {
  console.error("✗ Faltan SUPABASE_URL y/o SUPABASE_SECRET_KEY en .env.local.");
  process.exit(1);
}

const h = { apikey: K, Authorization: `Bearer ${K}` };
const traza = opcion("traza", null);
const soloMalos = args.includes("--malos");

const campos = "traza,recibido_en,proveedor,evento,tipo,estado,nota,recurso_id,duracion_ms";
let consulta = `${U}/rest/v1/webhook_eventos?select=${traza ? "*" : campos}&order=recibido_en.desc&limit=${traza ? 5 : 15}`;
if (traza) consulta += `&traza=eq.${encodeURIComponent(traza)}`;
if (soloMalos) consulta += `&estado=in.(huerfano,error)`;

const filas = await fetch(consulta, { headers: h }).then((r) => r.json());

if (!Array.isArray(filas) || filas.length === 0) {
  console.log(traza ? `No hay ningún evento con la traza "${traza}".` : "No hay eventos todavía.");
  process.exit(0);
}

// Con --traza se enseña TODO, incluido el cuerpo: es el modo "investigar un
// caso concreto", y ahí el cuerpo es justo lo que hace falta.
if (traza) {
  for (const f of filas) {
    console.log(`\n── ${f.traza} · ${new Date(f.recibido_en).toLocaleString("es-CO")} ──`);
    console.log(`   ${f.proveedor} · ${f.evento} → ${f.tipo}`);
    console.log(`   estado: ${f.estado}${f.nota ? ` · ${f.nota}` : ""}`);
    console.log(`   suscripción: ${f.recurso_id}`);
    if (f.duracion_ms != null) console.log(`   tardó: ${f.duracion_ms} ms`);
    console.log(`   cuerpo tal cual llegó:`);
    console.log(
      JSON.stringify(f.cuerpo, null, 2)
        .split("\n")
        .map((l) => `     ${l}`)
        .join("\n"),
    );
  }
  console.log("");
  process.exit(0);
}

const SIMBOLO = { procesado: "✓", huerfano: "?", error: "✗", recibido: "·" };

console.log("");
for (const f of filas) {
  const cuando = new Date(f.recibido_en).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const dur = f.duracion_ms != null ? `${String(f.duracion_ms).padStart(5)}ms` : "      -";
  console.log(
    `${SIMBOLO[f.estado] ?? "·"} ${(f.traza ?? "--------").padEnd(8)} ${cuando}  ${dur}  ${(f.tipo ?? "").padEnd(22)} ${f.nota ?? ""}`,
  );
}

const malos = filas.filter((f) => f.estado === "huerfano" || f.estado === "error").length;
console.log("");
console.log(`${filas.length} eventos · ${malos} necesitan atención`);
console.log("Para ver uno entero:  npm run webhook:ver -- --traza <código>");
console.log("");
