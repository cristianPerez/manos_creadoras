/**
 * Manda un aviso push a todas las alumnas suscritas.
 *
 *   npm run push:enviar -- "Modelo nuevo" "Ya está el bolso Pearl Royale en tu app"
 *   npm run push:enviar -- "Modelo nuevo" "Ya está disponible" /cursos/s2-l03
 *
 * Apunta a producción con:  APP_URL=https://tu-app.vercel.app npm run push:enviar -- ...
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].split("#")[0].trim();
}

const [titulo, cuerpo, url] = process.argv.slice(2);
const BASE = process.env.APP_URL ?? "http://localhost:3000";

if (!titulo || !cuerpo) {
  console.error(`
Falta el título o el mensaje.

  npm run push:enviar -- "Modelo nuevo" "Ya está el bolso Pearl Royale en tu app"
`);
  process.exit(1);
}

const secreto = process.env.PUSH_ADMIN_SECRET;
if (!secreto) {
  console.error("\n❌ Falta PUSH_ADMIN_SECRET en .env.local\n");
  process.exit(1);
}

console.log(`\n📣 Enviando a ${BASE}`);
console.log(`   "${titulo}"`);
console.log(`   ${cuerpo}\n`);

const res = await fetch(`${BASE}/api/push/enviar`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-push-secret": secreto },
  body: JSON.stringify({ titulo, cuerpo, ...(url ? { url } : {}) }),
});

const datos = await res.json().catch(() => null);

if (!res.ok) {
  console.error(`❌ ${datos?.error ?? `error ${res.status}`}\n`);
  process.exit(1);
}

console.log(`✅ Entregados: ${datos.enviados}`);
if (datos.fallidos) console.log(`   Fallidos: ${datos.fallidos}`);
if (datos.limpiados) console.log(`   Suscripciones caducadas eliminadas: ${datos.limpiados}`);
console.log("");
