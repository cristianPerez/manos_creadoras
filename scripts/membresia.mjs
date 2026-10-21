/**
 * Da, quita y consulta la membresía de una alumna, a mano.
 *
 *   npm run membresia:ver    -- ana@ejemplo.com
 *   npm run membresia:dar    -- ana@ejemplo.com completo anual
 *   npm run membresia:dar    -- ana@ejemplo.com completo mensual 30
 *   npm run membresia:quitar -- ana@ejemplo.com
 *
 * ⚠️ ESTE ARCHIVO SUSTITUYE A `scripts/acceso.mjs`, y el cambio de nombre es a
 * propósito. Antes se daba "acceso" y punto: había un solo programa, así que
 * bastaba con decir sí o no. Ahora hay tres planes y el comando TIENE que
 * decir cuál — si hubiera conservado el nombre viejo, `npm run acceso:dar`
 * seguiría escribiéndose igual pero significaría otra cosa, que es la forma
 * más fácil de dar a alguien el plan equivocado sin enterarse.
 *
 * PARA QUÉ SIRVE HOY: para cobrar sin pasarela. Mientras OnePay no esté
 * integrado, Elizabeth cobra por transferencia o Nequi y activa con esto. Es
 * el mismo camino que usará el webhook cuando exista — llama a la misma
 * función de la base, `dar_membresia`.
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

/*
 * ⚠️ AQUÍ DECÍA `creadora` Y ESE PLAN NO EXISTE DESDE LA MIGRACIÓN 0016.
 *
 * Encontrado el 2026-10-19: con el valor por defecto viejo,
 * `npm run membresia:dar -- correo` (sin escribir el plan, que es como se usa)
 * moría con "violates check constraint". Y la lista de PLANES ofrecía los tres
 * nombres antiguos, así que el mensaje de ayuda mandaba a escribir justo lo que
 * la base rechaza. Es el mismo cabo suelto del renombrado que rompió
 * `alumna-prueba.mjs`; el ESTADO avisaba que quedaba repasarlo.
 *
 * `gratis` también se acepta: es el suelo que tiene toda cuenta, y poder
 * bajar a alguien a mano sirve para probar el muro de pago.
 */
const [accion, email, plan = "completo", ciclo = "anual", dias] = process.argv.slice(2);

const PLANES = ["gratis", "completo"];
const CICLOS = ["mensual", "anual"];

if (!email || !email.includes("@")) {
  console.error("Falta el correo.  Ejemplo:  npm run membresia:dar -- ana@ejemplo.com completo anual");
  process.exit(1);
}

/*
 * Se valida AQUÍ además de en la base. La base lo rechazaría igual —tiene su
 * `check`— pero el error que devuelve habla de restricciones y nombres de
 * columna. Quien usa esto es Elizabeth desde una terminal, y merece leer qué
 * escribió mal.
 */
if (accion === "dar") {
  if (!PLANES.includes(plan)) {
    console.error(`Plan desconocido: "${plan}".  Usa uno de: ${PLANES.join(", ")}`);
    process.exit(1);
  }
  if (!CICLOS.includes(ciclo)) {
    console.error(`Ciclo desconocido: "${ciclo}".  Usa uno de: ${CICLOS.join(", ")}`);
    process.exit(1);
  }
}

const fecha = (d) =>
  new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

async function buscarPerfil(correo) {
  const { data } = await admin
    .from("profiles")
    .select("id, email")
    .ilike("email", correo)
    .maybeSingle();

  if (!data) {
    console.error(`No existe ninguna cuenta con ${correo}.`);
    console.error("La cuenta se crea sola la primera vez que ella pide su enlace de acceso.");
    process.exit(1);
  }
  return data;
}

async function ver(correo) {
  const perfil = await buscarPerfil(correo);

  const { data: m } = await admin
    .from("membresias")
    .select("plan, ciclo, estado, vence_el, pasarela, actualizada_el")
    .eq("user_id", perfil.id)
    .maybeSingle();

  const { data: puedeEntrar } = await admin.rpc("tiene_acceso_de", { uid: perfil.id });

  console.log(`\n${perfil.email}`);
  if (!m) {
    console.log("   Sin membresía (ni siquiera Aprendiz) — es raro, avisa.");
  } else {
    const hasta = m.vence_el ? `hasta el ${fecha(m.vence_el)}` : "sin fecha de corte";
    console.log(`   Plan:   ${m.plan}${m.ciclo ? ` · ${m.ciclo}` : ""}`);
    console.log(`   Estado: ${m.estado} (${hasta})`);
    console.log(`   Entró por: ${m.pasarela ?? "—"}`);
  }
  console.log(`\n   → ${puedeEntrar ? "✅ TIENE acceso de pago" : "⛔ NO tiene acceso de pago"}\n`);
}

async function dar(correo) {
  const perfil = await buscarPerfil(correo);

  /*
   * Sin `dias`, la membresía NO vence. Es lo correcto en una suscripción al
   * día: mientras siga pagando no hay fecha que mantener actualizada, y poner
   * una obligaría a acordarse de moverla cada mes.
   *
   * Con `dias`, vence. Sirve para cobros por fuera de un solo período: le diste
   * un mes, se acaba, y la app deja de darle acceso sola.
   */
  const venceEl = dias ? new Date(Date.now() + Number(dias) * 86_400_000).toISOString() : null;

  const { error } = await admin.rpc("dar_membresia", {
    p_user_id: perfil.id,
    p_plan: plan,
    p_ciclo: ciclo,
    p_vence_el: venceEl,
    p_pasarela: "manual",
    p_pasarela_id: null,
  });

  if (error) {
    console.error(`No se pudo dar la membresía: ${error.message}`);
    process.exit(1);
  }

  console.log(
    `\n✅ ${perfil.email} → plan ${plan} (${ciclo})` +
      `${venceEl ? `, hasta el ${fecha(venceEl)}` : ", sin fecha de corte"}\n`,
  );
}

async function quitar(correo) {
  const perfil = await buscarPerfil(correo);

  /*
   * ⚠️ CANCELAR NO ES CORTAR. Se marca como cancelada y, si tenía fecha, la
   * conserva: sigue entrando hasta el final de lo que YA pagó. Cortarle el
   * acceso el mismo día de cancelar es quedarse con un mes cobrado sin dar el
   * servicio, y es la forma más rápida de ganarse una disputa de pago.
   *
   * Para cortar de verdad hoy mismo:
   *   npm run membresia:dar -- correo gratis
   */
  const { error } = await admin.rpc("cancelar_membresia", {
    p_user_id: perfil.id,
    p_vence_el: null,
  });

  if (error) {
    console.error(`No se pudo cancelar: ${error.message}`);
    process.exit(1);
  }

  const { data: m } = await admin
    .from("membresias")
    .select("vence_el")
    .eq("user_id", perfil.id)
    .maybeSingle();

  console.log(
    `\n✅ ${perfil.email}: cancelada.` +
      ` Conserva el acceso ${m?.vence_el ? `hasta el ${fecha(m.vence_el)}` : "hasta ahora mismo"}.\n`,
  );
}

if (accion === "ver") await ver(email);
else if (accion === "dar") await dar(email);
else if (accion === "quitar") await quitar(email);
else {
  console.error("Acción desconocida. Usa: ver | dar | quitar");
  process.exit(1);
}
