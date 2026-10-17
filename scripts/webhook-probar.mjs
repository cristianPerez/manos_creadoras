#!/usr/bin/env node
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

/**
 * DISPARA UN WEBHOOK FIRMADO, como si lo mandara la pasarela.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * POR QUÉ ESTO Y NO UN TÚNEL (ngrok y compañía)
 * ════════════════════════════════════════════════════════════════════════════
 * Un túnel hace falta UNA vez: para ver con qué forma exacta llega un pago de
 * verdad. Para todo lo demás es peor que esto, porque obliga a tener a mano un
 * pago real cada vez que se quiere probar algo — y una cancelación, y un cobro
 * fallido, y una renovación.
 *
 * Esto manda el evento que haga falta, cuando haga falta, firmado igual que lo
 * firmaría OnePay. La firma se calcula con las MISMAS claves de `.env.local`,
 * así que si la verificación pasa aquí, pasa de verdad.
 *
 * ⚠️ NO SALTA LA SEGURIDAD: firma como la pasarela, no la esquiva. Sin las
 * claves correctas en `.env.local`, esto recibe el mismo 401 que cualquiera.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * USO
 *   npm run webhook:probar -- --correo tu@correo.com
 *   npm run webhook:probar -- --tipo cancelada --correo tu@correo.com
 *   npm run webhook:probar -- --url https://qa.manoscreadoras.co
 *
 * OPCIONES
 *   --tipo    pagada (por defecto) · cancelada · impagada · vencida · basura
 *   --correo  a quién pertenece el pago. Por defecto, uno de prueba.
 *   --sub     id de la suscripción. Repetir el mismo = renovación.
 *   --url     a dónde se manda. Por defecto http://localhost:3000
 *   --repetir manda el MISMO evento dos veces, para comprobar que no se duplica
 */

const args = process.argv.slice(2);
const opcion = (nombre, pordefecto) => {
  const i = args.indexOf(`--${nombre}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : pordefecto;
};
const bandera = (nombre) => args.includes(`--${nombre}`);

// ── Las claves salen de .env.local, las mismas que usa la app ──────────────
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

const secreto = (env.ONEPAY_WEBHOOK_SECRET ?? "").replace(/^"|"$/g, "");
const token = (env.ONEPAY_WEBHOOK_TOKEN ?? "").replace(/^"|"$/g, "");

if (!secreto || !token) {
  console.error("✗ Faltan ONEPAY_WEBHOOK_SECRET y/o ONEPAY_WEBHOOK_TOKEN en .env.local.");
  console.error("  Son las que da OnePay al crear el webhook (Secreto y Header).");
  process.exit(1);
}

const base = opcion("url", "http://localhost:3000").replace(/\/$/, "");
const correo = opcion("correo", "prueba.plan@manoscreadoras.test");
const sub = opcion("sub", `sub_prueba_${Date.now().toString(36)}`);
const tipo = opcion("tipo", "pagada");

/*
 * ⚠️ LOS NOMBRES DE EVENTO SON LOS DE ONEPAY, no los nuestros. La gracia de
 * probar así es ejercitar también la TRADUCCIÓN de su vocabulario al nuestro:
 * si se escribieran los internos, el traductor —que es donde más fácil se
 * equivoca uno— nunca se probaría.
 */
const EVENTOS = {
  pagada: "subscription.paid",
  cancelada: "subscription.canceled",
  impagada: "subscription.unpaid",
  vencida: "subscription.expired",
};

let cuerpo;
if (tipo === "basura") {
  // Un cuerpo con forma que no entendemos: debe quedar anotado como 'error',
  // NO reventar ni devolver 500 (o OnePay nos desactivaría el endpoint).
  cuerpo = JSON.stringify({ hola: "esto no tiene la forma esperada" });
} else {
  const nombre = EVENTOS[tipo];
  if (!nombre) {
    console.error(`✗ Tipo desconocido: "${tipo}". Usa: ${Object.keys(EVENTOS).join(", ")}, basura.`);
    process.exit(1);
  }
  const enUnMes = new Date(Date.now() + 30 * 864e5).toISOString();
  cuerpo = JSON.stringify({
    event: nombre,
    data: {
      id: sub,
      email: correo,
      customer_id: "cus_prueba",
      ...(tipo === "pagada" ? { next_billing_at: enUnMes } : {}),
      ...(tipo === "cancelada" ? { canceled_at: new Date().toISOString() } : {}),
    },
  });
}

const destino = `${base}/api/webhooks/onepay`;

async function enviar(n) {
  const firma = createHmac("sha256", secreto).update(cuerpo).digest("hex");
  const t0 = Date.now();
  const r = await fetch(destino, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-token": token,
      // Así se llama la cabecera en OnePay. NO es `x-onepay-signature`.
      Signature: firma,
    },
    body: cuerpo,
  });
  const texto = await r.text();
  const ms = Date.now() - t0;
  const marca = r.ok ? "✓" : "✗";
  console.log(`${marca} envío ${n}: ${r.status} ${texto}  (${ms} ms)`);
  // OnePay corta a los 10s. Si en local ya roza, en producción es peor.
  if (ms > 8000) console.log("  ⚠️ Tardó más de 8s. OnePay corta a los 10s.");
  return r.ok;
}

console.log(`→ ${destino}`);
console.log(`  tipo: ${tipo} · suscripción: ${sub}`);
if (tipo !== "basura") console.log(`  correo: ${correo}`);
console.log("");

const ok = await enviar(1);

if (bandera("repetir")) {
  console.log("");
  console.log("Mando el MISMO evento otra vez (debe responder 'repetido'):");
  await enviar(2);
}

console.log("");
if (ok) {
  console.log("Para ver qué quedó guardado:  npm run webhook:ver");
} else {
  console.log("Si fue 401, las claves de .env.local no coinciden con las del panel.");
}
