/**
 * Da o quita acceso a mano, sin que nadie tenga que comprar.
 *
 * Es la razón de ser de la migración 0008: hasta entonces el acceso solo lo
 * podía dar el webhook de Hotmart, así que regalarle el programa a alguien —una
 * alumna de cortesía, una ganadora de un sorteo, la propia dueña para enseñarlo—
 * era imposible sin simular una compra.
 *
 *   npm run acceso:dar -- ana@ejemplo.com
 *   npm run acceso:dar -- ana@ejemplo.com regalo 30      (vence en 30 días)
 *   npm run acceso:dar -- ana@ejemplo.com manual
 *   npm run acceso:quitar -- ana@ejemplo.com
 *   npm run acceso:ver -- ana@ejemplo.com
 *
 * ⚠️ Usa la clave SECRETA de Supabase (la que se salta todos los permisos), así
 * que lee `.env.local` y apunta a la base que ahí esté configurada. Antes de
 * correrlo contra producción, mira qué hay en ese archivo.
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].split("#")[0].trim();
}

const { createClient } = await import("@supabase/supabase-js");

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const [accion, email, motivo = "regalo", dias] = process.argv.slice(2);

if (!email || !email.includes("@")) {
  console.error("Falta el correo.  Ejemplo:  npm run acceso:dar -- ana@ejemplo.com");
  process.exit(1);
}

/*
  El motivo se valida AQUÍ además de en la base. La base lo rechazaría igual
  (tiene un `check`), pero el error que devuelve es de Postgres y no le dice a
  nadie cuáles son los valores válidos. Un error útil vale más que uno correcto.

  ⚠️ SOLO al dar. `ver` y `quitar` no llevan motivo, y validarlo también en ellos
  hacía que `npm run acceso:ver -- ana@ejemplo.com` muriera con "Motivo
  desconocido" en cuanto npm colara cualquier argumento extra — un error que no
  tenía nada que ver con lo que la dueña pidió.
*/
const MOTIVOS = ["regalo", "compra", "manual"];
if (accion === "dar" && !MOTIVOS.includes(motivo)) {
  console.error(`Motivo desconocido: "${motivo}".  Usa uno de: ${MOTIVOS.join(", ")}`);
  process.exit(1);
}

async function buscarPerfil(correo) {
  const { data } = await admin
    .from("profiles")
    .select("id, email, nombre, status")
    .eq("email", correo.toLowerCase().trim())
    .maybeSingle();
  return data;
}

function fecha(iso) {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function ver(perfil) {
  const { data: filas } = await admin
    .from("accesos")
    .select("motivo, otorgado_por, otorgado_en, vence_en, revocado_en")
    .eq("user_id", perfil.id)
    .order("otorgado_en", { ascending: false });

  const { data: puedeEntrar } = await admin.rpc("tiene_acceso_de", { uid: perfil.id });

  console.log(`\n${perfil.email}${perfil.nombre ? ` (${perfil.nombre})` : ""}`);
  console.log(`Entra ahora mismo: ${puedeEntrar ? "SÍ ✅" : "NO ❌"}`);
  console.log(`Estado en Hotmart: ${perfil.status}\n`);

  if (!filas?.length) {
    console.log("No tiene ninguna concesión de acceso.");
    return;
  }

  console.log("Concesiones (de la más nueva a la más vieja):");
  for (const f of filas) {
    const viva = !f.revocado_en && (!f.vence_en || new Date(f.vence_en) > new Date());
    const hasta = f.vence_en ? `hasta el ${fecha(f.vence_en)}` : "sin vencimiento";
    const estado = f.revocado_en
      ? `revocada el ${fecha(f.revocado_en)}`
      : viva
        ? "VIVA"
        : "vencida";
    console.log(
      `  · ${f.motivo.padEnd(7)} ${hasta.padEnd(28)} ${estado}   (la dio: ${f.otorgado_por}, el ${fecha(f.otorgado_en)})`,
    );
  }
}

async function dar(perfil) {
  /*
    Los días se convierten a una fecha AQUÍ y no en la base. "30 días" tiene que
    contarse desde el momento de darlo, y si el cálculo viviera en SQL con
    `now() + interval` quedaría atado a la zona horaria del servidor de la base,
    que no es la de nadie. Una fecha concreta no se puede malinterpretar.
  */
  let venceEn = null;
  if (dias !== undefined) {
    const n = Number(dias);
    if (!Number.isInteger(n) || n <= 0) {
      console.error(`Los días tienen que ser un número entero positivo. Recibí: "${dias}"`);
      process.exit(1);
    }
    venceEn = new Date(Date.now() + n * 86_400_000).toISOString();
  }

  const { error } = await admin.rpc("otorgar_acceso", {
    p_user_id: perfil.id,
    p_motivo: motivo,
    p_vence_en: venceEn,
    p_otorgado_por: `script:${motivo}`,
  });

  if (error) {
    console.error(`No se pudo dar el acceso: ${error.message}`);
    process.exit(1);
  }

  console.log(
    `✅ ${perfil.email} ya tiene acceso (${motivo}${venceEn ? `, hasta el ${fecha(venceEn)}` : ", sin vencimiento"}).`,
  );
  console.log("   Ya puede entrar: no hace falta desplegar ni esperar nada.");
}

async function quitar(perfil) {
  const { data: cuantas, error } = await admin.rpc("revocar_acceso", { p_user_id: perfil.id });

  if (error) {
    console.error(`No se pudo quitar el acceso: ${error.message}`);
    process.exit(1);
  }

  if (!cuantas) {
    console.log(`${perfil.email} ya no tenía ningún acceso vivo. No cambió nada.`);
    return;
  }

  console.log(`🚫 Quitado el acceso a ${perfil.email} (${cuantas} concesión/es cerradas).`);
  console.log("   Su historial se conserva: nada se borró, solo se marcó como revocado.");
}

const perfil = await buscarPerfil(email);

if (!perfil) {
  console.error(`No existe ninguna alumna con ${email}.`);
  console.error("Las cuentas se crean al comprar, o a mano con:  npm run alumna:crear");
  process.exit(1);
}

if (accion === "dar") await dar(perfil);
else if (accion === "quitar") await quitar(perfil);
else if (accion === "ver") await ver(perfil);
else {
  console.error(`Acción desconocida: "${accion}".  Usa: dar | quitar | ver`);
  process.exit(1);
}
