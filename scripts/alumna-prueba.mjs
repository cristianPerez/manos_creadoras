/**
 * Crea (o borra) una alumna de prueba, igual que lo haría el webhook de Hotmart al recibir
 * un pago — y te imprime el enlace de acceso directo, sin depender de que llegue el correo.
 *
 *   npm run alumna:crear -- ana@ejemplo.com
 *   npm run alumna:crear -- ana@ejemplo.com mensual
 *   npm run alumna:crear -- ana@ejemplo.com anual cancelada
 *   npm run alumna:borrar -- ana@ejemplo.com
 *
 * SOLO para desarrollo. Nunca se ejecuta en producción.
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

const [accion, email, plan = "anual", estado = "active"] = process.argv.slice(2);
const BASE = process.env.APP_URL ?? "http://localhost:3000";

if (!email || !email.includes("@")) {
  console.error("Falta el correo.  Ejemplo:  npm run alumna:crear -- ana@ejemplo.com");
  process.exit(1);
}

async function buscarUsuario(correo) {
  const { data } = await admin.auth.admin.listUsers();
  return data.users.find((u) => u.email?.toLowerCase() === correo.toLowerCase()) ?? null;
}

async function borrar(correo) {
  const u = await buscarUsuario(correo);
  if (!u) {
    console.log(`No existe ninguna alumna con ${correo}.`);
    return;
  }
  await admin.auth.admin.deleteUser(u.id);
  console.log(`🗑️  Borrada: ${correo} (su perfil y datos se van con ella)`);
}

async function crear(correo) {
  const existente = await buscarUsuario(correo);
  if (existente) {
    console.log(`ℹ️  ${correo} ya existía — la borro y la vuelvo a crear limpia.`);
    await admin.auth.admin.deleteUser(existente.id);
  }

  const { data: creado, error: e1 } = await admin.auth.admin.createUser({
    email: correo,
    email_confirm: true,
  });
  if (e1) throw new Error(`No se pudo crear la cuenta: ${e1.message}`);

  const perfil = {
    id: creado.user.id,
    email: correo,
    nombre: "Alumna de Prueba",
    status: estado,
    plan,
    first_paid_at: new Date().toISOString(),
  };
  // Si la simulamos cancelada, le dejamos 20 días de período ya pagado.
  if (estado === "cancelled") {
    perfil.access_until = new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString();
  }

  const { error: e2 } = await admin.from("profiles").insert(perfil);
  if (e2) throw new Error(`No se pudo crear el perfil: ${e2.message}`);

  const { data: link, error: e3 } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: correo,
    options: { redirectTo: `${BASE}/auth/callback` },
  });
  if (e3) throw new Error(`No se pudo generar el enlace: ${e3.message}`);

  // Apuntamos DIRECTO a nuestra página de aterrizaje con el token.
  // El `action_link` que devuelve Supabase pasa por su verificador y termina
  // entregando la sesión en el fragmento de la URL, que el servidor no puede leer.
  const entrar = `${BASE}/auth/callback?token_hash=${link.properties.hashed_token}&type=magiclink`;

  console.log(`\n✅ Alumna de prueba lista`);
  console.log(`   Correo: ${correo}`);
  console.log(`   Plan:   ${plan}  ·  Estado: ${estado}`);
  console.log(`\n🔗 Pega este enlace en tu navegador para entrar como ella:\n`);
  console.log(`   ${entrar}\n`);
  console.log(`   (El enlace sirve una sola vez. Vuelve a correr el comando si lo gastas.)`);
  console.log(`   Para borrarla:  npm run alumna:borrar -- ${correo}\n`);
}

try {
  if (accion === "borrar") await borrar(email);
  else await crear(email);
} catch (err) {
  console.error(`\n❌ ${err.message}\n`);
  process.exit(1);
}
