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

  /*
   * ⚠️ AQUÍ YA NO SE ESCRIBE NINGÚN ESTADO DE PAGO (2026-11-06). Este objeto
   * llevaba `status`, `plan`, `first_paid_at` y `access_until`, columnas de
   * cuando el cobro era Hotmart: desde la migración 0014 el acceso lo decide
   * `membresias` y ninguna pantalla las leía ya. La 0047 las BORRÓ de la tabla,
   * así que mandarlas aquí haría fallar el script con "column does not exist".
   *
   * Lo único que queda es quién es: su correo y su nombre. El acceso se da
   * abajo con `dar_membresia`, que es lo que de verdad abre la puerta, y el
   * caso "cancelada" lo arma `cancelar_membresia` con su propia fecha.
   */
  const perfil = {
    id: creado.user.id,
    email: correo,
    nombre: "Alumna de Prueba",
  };

  /*
   * `upsert` y no `insert`.
   *
   * ⚠️ ESTE SCRIPT LLEVABA ROTO DESDE LA MIGRACIÓN 0012 (2026-09-15). Esa
   * migración añadió el disparador `al_crear_usuario`, que crea el perfil solo
   * —con `status = null`, o sea cuenta gratis— en cuanto nace el usuario de
   * auth. Así que cuando llegamos aquí el perfil YA existe y el `insert`
   * reventaba con "duplicate key value violates unique constraint".
   *
   * Es justo el fallo que más molesta: el script existe para poder entrar sin
   * depender del correo, y estaba fallando precisamente cuando hacía falta.
   *
   * El disparador tiene la última palabra sobre que el perfil exista; lo nuestro
   * es ASCENDERLO al plan de prueba. Eso es un upsert, no un insert.
   */
  const { error: e2 } = await admin.from("profiles").upsert(perfil);
  if (e2) throw new Error(`No se pudo preparar el perfil: ${e2.message}`);

  /*
   * EL ACCESO SE CONCEDE EN `accesos`, NO EN `profiles.status`.
   *
   * ⚠️ SEGUNDO DESFASE DEL SCRIPT, este desde la migración 0008. El perfil de
   * arriba dice `status: 'active'`, pero desde esa migración quien decide si se
   * ven las lecciones es `tiene_acceso()`, que mira la tabla `accesos` y ni se
   * asoma a `profiles`. Resultado: la alumna de prueba entraba y se topaba con
   * "Tu membresía no está activa" — el script decía haberla creado con plan
   * anual activo y la pantalla decía que no. Las dos cosas eran ciertas; miraban
   * sitios distintos.
   *
   * Se usa la MISMA función que usan el webhook y `npm run acceso:dar`, que es
   * justo lo que este script promete imitar.
   */
  if (estado === "active") {
    const { error: eAcceso } = await admin.rpc("dar_membresia", {
      p_user_id: creado.user.id,
      /*
       * ⚠️ TERCER DESFASE DEL SCRIPT, y van tres por el mismo motivo: aquí
       * decía `'creadora'`, un plan que la migración 0016 borró al pasar a un
       * solo plan. El `check` de `membresias.plan` lo rechazaba, así que
       * `npm run alumna:crear` llevaba roto desde el 13-oct: reventaba con
       * "violates check constraint" y no se podía crear ni una alumna de
       * prueba. Encontrado el 2026-10-19 al intentar verificar el botón de
       * cancelar — es el cabo suelto que el ESTADO avisaba que quedaba por
       * repasar del renombrado.
       *
       * `completo` es el único plan de pago que existe hoy, y es el que hay que
       * probar: es el que tendrán todas.
       */
      p_plan: "completo",
      p_ciclo: plan === "mensual" ? "mensual" : "anual",
      p_vence_el: null,
      p_pasarela: "manual",
      p_pasarela_id: null,
    });
    if (eAcceso) throw new Error(`No se pudo dar la membresía: ${eAcceso.message}`);
  }

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
  /* Honestidad: solo "active" crea membresía. Pedir "cancelled" deja una cuenta
     GRATIS, no una cancelada con período pendiente — eso lo hace
     `cancelar_membresia`, que este script nunca ha llamado. Antes se disimulaba
     escribiendo `access_until`, una columna que nadie leía (borrada en la 0047). */
  if (estado !== "active") {
    console.log(`   ⚠️  "${estado}" no crea membresía: queda como cuenta gratis.`);
  }
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
