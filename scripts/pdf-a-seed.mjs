/**
 * Convierte las fichas en PDF de Elizabeth al seed de la app.
 *
 * ⚠️ NO SE TRANSCRIBE A MANO. La primera vez se copiaron 89 identificadores de
 * video leyéndolos de un PDF, y un solo carácter cambiado deja un video que no
 * carga sin que nadie se entere hasta que una alumna lo abre. Este script lee el
 * PDF, y si el PDF cambia se vuelve a correr.
 *
 * Uso: node scripts/pdf-a-seed.mjs <ruta-del-texto-extraido>
 */
import { readFileSync, writeFileSync } from "node:fs";

const texto = readFileSync(process.argv[2], "utf8");

/** "Bolso Gota de Rocío" → "Gota de Rocío". El prefijo no es parte del nombre. */
function nombreLimpio(crudo) {
  return crudo.replace(/^Bolso\s+/i, "").trim();
}

/** "Gota de Rocío" → "gota-de-rocio" */
function aSlug(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * ⚠️ LOS NOMBRES DE MARCA REGISTRADA NO SE PUBLICAN. El PDF los trae porque son
 * los nombres con los que Elizabeth los grabó, pero vender un curso llamado
 * "Bolso Dior" es usar una marca ajena. El original se guarda en `nombre_original`
 * para que ella siga reconociéndolos.
 */
const RENOMBRADOS = {
  "Bottega": "Perla Tejida",
  "Dior": "Anillos de Seda",
  "Balenciaga": "Silueta Nácar",
};

/** "Largo: 19 cm" → { largo: 19 } · "Alto con el asa: 26 cm" → { alto_con_asa: 26 } */
function medida(linea) {
  const m = linea.match(/^\s*([^:]+):\s*([\d,.]+)\s*cm/i);
  if (!m) return null;
  const clave = m[1]
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim()
    .replace(/\s+sin\s+incluir\s+el\s+asa/, "")
    // "con el asa" e "incluyendo el asa" son la misma medida escrita de dos
    // formas en el PDF. Sin unificarlas salen dos claves distintas y la ficha
    // enseña "alto con asa" en unos bolsos y "alto incluyendo el asa" en otros.
    .replace(/\s+(con|incluyendo)\s+el\s+asa/, "_con_asa")
    .replace(/[^a-z0-9_]+/g, "_").replace(/^_|_$/g, "");
  return [clave, Number(m[2].replace(",", "."))];
}

/**
 * Erratas del PDF que NO se copian tal cual.
 *
 * ⚠️ SE CORRIGEN MUY POCAS Y SIEMPRE CON MOTIVO ESCRITO. El PDF es la fuente de
 * verdad y "mejorar" la redacción de Elizabeth por cuenta propia es cómo se
 * pierde información. Solo entra aquí lo que haría que una alumna COMPRE MAL.
 */
const ERRATAS = [
  {
    de: "Hilo de pescar de 7 mm",
    a: "Hilo de pescar de 0,7 mm",
    porque:
      "7 mm de hilo de pescar es cuerda de amarre, no hilo de ensartar. Los otros " +
      "quince bolsos usan entre 0,4 y 0,7 mm, y el seed anterior ya lo tenía en 0,7. " +
      "Copiarlo tal cual haría que una alumna gaste dinero en algo que no le sirve.",
  },
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Partir por bolso. El encabezado "N. Nombre" abre cada ficha.
const trozos = texto.split(/^\s*(\d{1,2})\.\s+(.+)$/m);
const bolsos = [];

for (let i = 1; i < trozos.length; i += 3) {
  const orden = Number(trozos[i]);
  const crudo = trozos[i + 1].trim();
  const cuerpo = trozos[i + 2];

  const nombreBase = nombreLimpio(crudo);
  const nombre = RENOMBRADOS[nombreBase] ?? nombreBase;

  /*
   * ⚠️ LAS VIÑETAS DEL PDF SON `\x7f`, NO ESPACIOS. Es el carácter DEL, que el
   * generador usó como punto de lista y que al extraer el texto sobrevive tal
   * cual. Detectarlas por sangría no funciona: no hay sangría.
   */
  const lineas = cuerpo.split("\n").map((l) => l.trimEnd());
  const esVinieta = (l) => l.trimStart().startsWith("\u007f");
  const uuids = lineas.filter((l) => UUID.test(l.trim())).map((l) => l.trim());

  // El primero es el id del bolso (la colección de Bunny), el segundo el video
  // de materiales. El resto son las lecciones, en orden.
  const bolsoId = uuids[0];
  const videoMateriales = uuids[1];

  // Materiales: las líneas con viñeta entre "Materiales" y la siguiente cabecera.
  const materiales = [];
  const medidas = {};
  let zona = null;
  for (const l of lineas) {
    const t = l.trim();
    if (/^Materiales/i.test(t)) { zona = "materiales"; continue; }
    if (/^Medidas del bolso/i.test(t)) { zona = "medidas"; continue; }
    if (/^Videos del proceso/i.test(t)) { zona = "videos"; continue; }
    if (/^ID del/i.test(t) || UUID.test(t) || t === "Lección" || t === "ID del video") continue;
    if (!t) continue;
    if (zona === "materiales" && esVinieta(l)) {
      const texto = t.replace(/^\u007f\s*/, "");
      const errata = ERRATAS.find((e) => e.de === texto);
      if (errata) console.warn(`  ⚠️ corregido en ${nombre}: "${errata.de}" → "${errata.a}"\n     ${errata.porque}`);
      materiales.push(errata ? errata.a : texto);
    }
    if (zona === "medidas") { const m = medida(t.replace(/^\u007f\s*/, "")); if (m) medidas[m[0]] = m[1]; }
  }

  // Lecciones: en la zona de videos, un título seguido de su uuid.
  const lecciones = [];
  const iv = lineas.findIndex((l) => /^Videos del proceso/i.test(l.trim()));
  if (iv >= 0) {
    const zonaVideos = lineas.slice(iv);
    for (let j = 0; j < zonaVideos.length - 1; j++) {
      const t = zonaVideos[j].trim();
      const sig = zonaVideos[j + 1].trim();
      if (!t || UUID.test(t) || /^(Lección|ID del video|Videos del proceso)$/i.test(t)) continue;
      if (UUID.test(sig)) lecciones.push({ titulo: t, video_id: sig });
    }
  }

  /*
   * ⚠️ UN PASO PARTIDO EN VARIOS VIDEOS SIGUE SIENDO UN PASO. El PDF marca las
   * partes de DOS formas distintas —"Tejido de la base (ID 1)" y "Tejido del
   * cuerpo — parte 1"— porque las fichas las escribió gente distinta. Las dos se
   * normalizan al mismo sitio: el título queda limpio y la parte va aparte.
   *
   * Si no se hiciera, la app enseñaría "Tejido de la base (ID 1)" como si fuera
   * un paso llamado así, y el paso 4 de un bolso de 4 pasos pasaría a ser el 5.
   */
  const limpias = lecciones.map((l, i) => {
    let titulo = l.titulo;
    let parte = null;

    const porId = titulo.match(/^(.*?)\s*\(ID\s*(\d+)\)\s*$/i);
    const porGuion = titulo.match(/^(.*?)\s*[—–-]\s*parte\s*(\d+)\s*$/i);
    const m = porId ?? porGuion;
    if (m) { titulo = m[1].trim(); parte = Number(m[2]); }

    return { titulo, parte, video_id: l.video_id, orden: i + 1 };
  });

  /*
   * ⚠️ LAS PARTES SE AGRUPAN POR SECUENCIA, NO POR TÍTULO IGUAL. Zafiro Perlado
   * llama a su primera parte "Tejido del cuerpo DEL BOLSO" y a las otras dos
   * "Tejido del cuerpo": agrupando por título salían dos pasos y la tercera
   * quedaba como "parte 3 de 2".
   *
   * Lo que de verdad define un paso partido es que las partes vayan seguidas y
   * numeradas 1, 2, 3. El título del grupo es el de la PRIMERA parte, que es la
   * que Elizabeth escribió completa.
   */
  const grupos = [];
  for (const l of limpias) {
    const ultimo = grupos.at(-1);
    const sigue = l.parte && ultimo?.partes.at(-1)?.parte === l.parte - 1;
    if (sigue) ultimo.partes.push(l);
    else grupos.push({ titulo: l.titulo, partes: [l] });
  }

  const finales = [];
  for (const g of grupos) {
    for (const l of g.partes) {
      const salida = { titulo: g.titulo, video_id: l.video_id, orden: l.orden };
      if (g.partes.length > 1) salida.parte = `${l.parte} de ${g.partes.length}`;
      finales.push(salida);
    }
  }

  bolsos.push({
    orden,
    nombre,
    slug: aSlug(nombre),
    nombre_original: nombreBase !== nombre ? crudo : null,
    bolso_id: bolsoId,
    video_materiales_id: videoMateriales,
    medidas_cm: Object.keys(medidas).length ? medidas : null,
    materiales,
    lecciones: finales,
  });
}

console.log(`${bolsos.length} bolsos · ${bolsos.reduce((s, b) => s + b.lecciones.length, 0)} lecciones · ${bolsos.reduce((s, b) => s + b.materiales.length, 0)} materiales`);
writeFileSync(process.argv[3], JSON.stringify({ bolsos }, null, 2) + "\n");
