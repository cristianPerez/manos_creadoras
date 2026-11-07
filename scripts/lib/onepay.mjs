/**
 * Piezas compartidas por los scripts de precios (`precio-cambiar.mjs` y
 * `plan-onepay.mjs`): leer el entorno, hablar con la API de OnePay y verificar
 * que un plan cobra lo que se cree que cobra. SOLO para scripts de terminal.
 */
import { readFileSync } from "node:fs";

/** Carga `.env.prod` (prod) o `.env.local` (QA) en `process.env`. */
export function cargarEntorno(esProd) {
  const archivo = esProd ? ".env.prod" : ".env.local";
  for (const linea of readFileSync(archivo, "utf8").split("\n")) {
    const m = linea.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].split(" #")[0].trim().replace(/^"|"$/g, "");
  }
  return esProd ? "PRODUCCIÓN" : "QA";
}

/** "US$14,60" · "$59.900 COP" · "$269 MXN". Sin moneda, dólares (como siempre). */
export const dinero = (v, moneda = "USD") => {
  if (v == null) return "—";
  const n = Number(v);
  if (moneda === "USD") return `US$${n.toFixed(2).replace(".", ",")}`;
  const entero = Number.isInteger(n);
  const txt = n.toLocaleString("es-CO", { minimumFractionDigits: entero ? 0 : 2, maximumFractionDigits: 2 });
  return `$${txt} ${moneda}`;
};

/** Qué fila de `plan_checkout` cobra en cada moneda local. USD = las que siguen en dólares. */
export const REGION_DE_MONEDA = { COP: "colombia", MXN: "mexico" };

/* ── API de OnePay ───────────────────────────────────────────────────────── */
const BASE = "https://api.onepay.la/v1";

/**
 * Una llamada a la API. Siempre con `Authorization: Bearer <ONEPAY_API_KEY>`
 * del entorno elegido: la de QA es de MODO PRUEBA y la de producción de MODO
 * REAL, así que el entorno decide en qué mundo del panel se crea o borra.
 */
export async function onepay(metodo, ruta, cuerpo, extra = {}) {
  const clave = process.env.ONEPAY_API_KEY;
  if (!clave) throw new Error("Falta ONEPAY_API_KEY en el archivo de entorno.");
  const r = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${clave}`,
      Accept: "application/json",
      ...(cuerpo ? { "Content-Type": "application/json" } : {}),
      ...extra,
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const texto = await r.text();
  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = texto;
  }
  return { ok: r.ok, status: r.status, datos };
}

export const idDelEnlace = (url) => url?.match(/\/plan\/([0-9a-f-]{36})$/)?.[1] ?? null;

/* ── La verificación contra la página pública del plan ───────────────────── */

/**
 * Lee lo que cobra de verdad un plan en su página pública de OnePay y lo
 * compara con lo esperado: monto al centavo, USD, impuesto 0%, frecuencia del
 * ciclo y modo (producción solo planes REALES, QA solo de PRUEBA).
 * Devuelve `{ leido, problemas }`; con `problemas` vacío, todo cuadra.
 */
export async function verificarPlan(url, { ciclo, precio, esProd, moneda = "USD" }) {
  const pagina = await fetch(url, { redirect: "follow" }).then((r) => (r.ok ? r.text() : null));
  if (!pagina) return { leido: null, problemas: [`OnePay no devolvió la página del plan (${url}).`] };

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
    return { leido: null, problemas: ["No se pudo leer el monto en la página de OnePay (¿cambiaron su página?)."] };
  }

  const problemas = [];
  if (leido.centavos !== Math.round(precio * 100)) {
    problemas.push(`El plan cobra ${dinero(leido.centavos / 100, moneda)}, no ${dinero(precio, moneda)}.`);
  }
  if (leido.moneda !== moneda) problemas.push(`El plan está en ${leido.moneda}, no en ${moneda}.`);
  if (leido.impuesto !== 0) problemas.push(`El plan tiene ${leido.impuesto}% de impuesto: cobraría más de lo que dice la página.`);
  const esperada = ciclo === "mensual" ? "mes" : "año";
  if (leido.frecuencia !== esperada) {
    problemas.push(`El plan se cobra cada "${leido.frecuencia}", y el ciclo ${ciclo} es cada "${esperada}".`);
  }
  if (esProd && leido.esPrueba) problemas.push("Es un plan de MODO PRUEBA: en producción no cobraría nada de verdad.");
  if (!esProd && !leido.esPrueba) problemas.push("Es un plan REAL: en QA se cobraría de verdad.");
  return { leido, problemas };
}

export const describir = (l) =>
  `${dinero(l.centavos / 100, l.moneda)} cada ${l.frecuencia} · impuesto ${l.impuesto}% · ${l.esPrueba ? "modo prueba" : "modo real"}`;
