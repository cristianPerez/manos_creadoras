/**
 * Carga los 14 bolsos, sus 61 lecciones, sus materiales y el directorio.
 *
 *   npm run seed:bolsos            → carga (o actualiza) todo
 *   npm run seed:bolsos -- --borrar → vacía el contenido antes de cargar
 *
 * La fuente es `supabase/seed/bolsos.json`, que sale de las fichas que escribió
 * Elizabeth. Si hay que corregir un material o un video, se corrige ahí y se
 * vuelve a correr esto — nunca a mano en la base, que es donde se pierde el
 * rastro de por qué algo dice lo que dice.
 *
 * ⚠️ ES IDEMPOTENTE. Se puede correr diez veces seguidas y el resultado es el
 * mismo. Hace falta: este script se va a correr en local, en QA y en
 * producción, y un seed que duplica filas al segundo intento es un seed que
 * nadie se atreve a correr.
 *
 * ⚠️ NO TOCA EL AVANCE DE NADIE. `progreso` y `checklist_materiales` apuntan a
 * bolsos y materiales por su identificador, y aquí los identificadores se
 * conservan entre ejecuciones (ver `--borrar` abajo).
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].split("#")[0].trim();
}

const { createClient } = await import("@supabase/supabase-js");

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const datos = JSON.parse(readFileSync("supabase/seed/bolsos.json", "utf8"));
const borrar = process.argv.includes("--borrar");

/*
 * ⚠️ `--solo slug1,slug2` CARGA ÚNICAMENTE ESOS BOLSOS (añadido el 2026-10-20).
 *
 * Sin él, el script borra y vuelve a insertar las lecciones y materiales de
 * TODOS los bolsos — y desde que se escribió, varias migraciones (0031-0034)
 * cambiaron portadas directamente en la base. Recargar los 16 para añadir 4
 * habría deshecho esos cambios y regenerado lecciones con ids nuevos. Para
 * añadir bolsos nuevos, siempre con `--solo`.
 */
const iSolo = process.argv.indexOf("--solo");
const solo = iSolo > -1 ? new Set((process.argv[iSolo + 1] ?? "").split(",").filter(Boolean)) : null;
if (solo && borrar) {
  console.error("❌ --solo y --borrar juntos no tienen sentido: --borrar vacía todo.");
  process.exit(1);
}
if (solo) {
  const desconocidos = [...solo].filter((s) => !datos.bolsos.some((b) => b.slug === s));
  if (desconocidos.length > 0) {
    console.error(`❌ No están en el JSON: ${desconocidos.join(", ")}`);
    process.exit(1);
  }
}

function fallar(paso, error) {
  console.error(`\n❌ ${paso}: ${error.message}`);
  process.exit(1);
}

/* ── 1. El directorio, primero ──────────────────────────────────────────────
 * Va antes que los bolsos porque los materiales apuntan a sus ítems. Al revés,
 * la tabla puente fallaría por clave ajena.
 */
async function cargarDirectorio() {
  const categorias = datos.directorio.categorias.map((c, i) => ({
    id: c.id,
    nombre: c.nombre,
    orden: i + 1,
  }));

  const items = datos.directorio.categorias.flatMap((c) =>
    c.items.map((i) => ({
      id: i.id,
      categoria_id: c.id,
      nombre: i.nombre,
      // ⚠️ `url` entra tal cual, y hoy es null en los 33. Es a propósito: la
      // pantalla enseña "Enlace pronto" en vez de un botón que no lleva a nada.
      url: i.url,
      precio_referencia: i.precio_referencia,
      imagen_url: i.imagen_url ?? null,
    })),
  );

  const { error: e1 } = await db.from("directorio_categorias").upsert(categorias);
  if (e1) fallar("directorio_categorias", e1);

  const { error: e2 } = await db.from("directorio_items").upsert(items);
  if (e2) fallar("directorio_items", e2);

  return { categorias: categorias.length, items: items.length };
}

/* ── 2. Los bolsos, con sus lecciones y materiales ──────────────────────── */
async function cargarBolsos() {
  let lecciones = 0;
  let materiales = 0;
  let enlaces = 0;

  for (const b of datos.bolsos.filter((x) => !solo || solo.has(x.slug))) {
    /*
     * `upsert` por `slug`: el identificador interno se conserva si el bolso ya
     * existía. Eso es lo que permite volver a correr el seed sin que una alumna
     * pierda su avance — `progreso` apunta a ese identificador.
     */
    const { data: bolso, error: e1 } = await db
      .from("bolsos")
      .upsert(
        {
          slug: b.slug,
          nombre: b.nombre,
          nombre_original: b.nombre_original ?? null,
          orden: b.orden,
          bunny_bolso_id: b.bolso_id,
          video_materiales_id: b.video_materiales_id,
          medidas_cm: b.medidas_cm,
          portada_url: b.portada_url ?? null,
          gratis: b.gratis,
          publicado_en: b.publicado_en ?? null,
          notas: b.notas ?? [],
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (e1) fallar(`bolso ${b.slug}`, e1);

    /*
     * Las lecciones y los materiales SÍ se reemplazan enteros.
     *
     * Un upsert por (bolso, orden) dejaría filas zombi si una ficha pasa de 5
     * lecciones a 4: la quinta se quedaría ahí para siempre. Borrar y volver a
     * insertar es lo único que garantiza que la base dice exactamente lo que
     * dice el JSON.
     *
     * El coste conocido: los materiales cambian de identificador, así que la
     * lista de la compra marcada se pierde. Se asume — es un dato de un minuto
     * frente a un catálogo incoherente.
     */
    await db.from("lecciones").delete().eq("bolso_id", bolso.id);
    const { error: e2 } = await db.from("lecciones").insert(
      b.lecciones.map((l) => ({
        bolso_id: bolso.id,
        orden: l.orden,
        titulo: l.titulo,
        video_id: l.video_id,
        parte: l.parte ?? null,
        duracion_seg: l.duracion_seg ?? null,
      })),
    );
    if (e2) fallar(`lecciones de ${b.slug}`, e2);
    lecciones += b.lecciones.length;

    await db.from("materiales").delete().eq("bolso_id", bolso.id);
    const { data: insertados, error: e3 } = await db
      .from("materiales")
      .insert(
        b.materiales.map((m, i) => ({ bolso_id: bolso.id, orden: i + 1, texto: m.texto })),
      )
      .select("id, orden");
    if (e3) fallar(`materiales de ${b.slug}`, e3);
    materiales += insertados.length;

    // El puente material ↔ producto del directorio.
    const puente = [];
    for (const [i, m] of b.materiales.entries()) {
      const fila = insertados.find((x) => x.orden === i + 1);
      for (const itemId of m.directorio_ids) {
        puente.push({ material_id: fila.id, item_id: itemId });
      }
    }
    if (puente.length > 0) {
      const { error: e4 } = await db.from("material_directorio").insert(puente);
      if (e4) fallar(`enlaces de ${b.slug}`, e4);
      enlaces += puente.length;
    }

    process.stdout.write(`   ${String(b.orden).padStart(2)}. ${b.nombre.padEnd(20)} ${b.lecciones.length} lecciones\n`);
  }

  const cargados = solo ? solo.size : datos.bolsos.length;
  return { bolsos: cargados, lecciones, materiales, enlaces };
}

/* ── Arranque ───────────────────────────────────────────────────────────── */

if (borrar) {
  console.log("🗑️  Vaciando el contenido…");
  // El orden importa: primero lo que apunta a otras tablas.
  await db.from("material_directorio").delete().neq("item_id", "");
  await db.from("materiales").delete().neq("texto", "");
  await db.from("lecciones").delete().neq("titulo", "");
  await db.from("bolsos").delete().neq("slug", "");
  await db.from("directorio_items").delete().neq("id", "");
  await db.from("directorio_categorias").delete().neq("id", "");
}

console.log("\n📦 Directorio…");
const dir = await cargarDirectorio();
console.log(`   ${dir.categorias} categorías · ${dir.items} productos`);

console.log("\n👜 Bolsos…");
const res = await cargarBolsos();

const videos = res.lecciones + res.bolsos; // cada bolso suma su video de materiales
console.log(`
✅ Listo
   ${res.bolsos} bolsos · ${res.lecciones} lecciones · ${videos} videos
   ${res.materiales} materiales · ${res.enlaces} enlaces al directorio
`);

// Con --solo no se cargó todo, así que el total del JSON no aplica.
if (!solo && videos !== datos.total_videos) {
  console.warn(`⚠️  El JSON declara ${datos.total_videos} videos y se cargaron ${videos}.`);
  process.exit(1);
}
