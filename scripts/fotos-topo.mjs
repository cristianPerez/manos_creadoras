/**
 * Pasa las fotos "topo" de la exploración de la paleta B a webp de 720px.
 *
 * ⚠️ POR QUÉ EXISTEN ESAS FOTOS. Los bolsos están fotografiados sobre fondos
 * café y madera. Con la paleta de siempre (crema y dorado) eso pega; con la B
 * (lavanda) el café se lee como "durazno" y pelea con el morado. Las de
 * `design-ref/paleta-b-claude-code/fotos-topo/` son LAS MISMAS fotos, mismo
 * encuadre, con el fondo pasado a topo (un gris cálido neutro) para que no
 * discutan con ninguna de las dos paletas.
 *
 * ⚠️ SE USAN SOLO EN LA RAMA B. La rama de siempre sigue con las de
 * `public/images/`, que es parte de que apagar la flag devuelva el sitio de hoy
 * byte por byte.
 *
 * 720px y calidad 80: estas fotos se pintan como miniaturas de 70–150px, así
 * que da de sobra hasta en una pantalla al triple de densidad, y bajan de ~700
 * KB a unas decenas. El público entra desde Android de gama media en LATAM.
 *
 * Uso:  node scripts/fotos-topo.mjs
 */
import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ORIGEN = "design-ref/paleta-b-claude-code/fotos-topo";
const DESTINO = "public/images/topo";

mkdirSync(DESTINO, { recursive: true });

const fuentes = readdirSync(ORIGEN).filter((n) => n.endsWith(".jpg"));
if (fuentes.length === 0) {
  console.error(`No hay .jpg en ${ORIGEN}`);
  process.exit(1);
}

for (const archivo of fuentes) {
  const salida = join(DESTINO, archivo.replace(/\.jpg$/, ".webp"));
  const info = await sharp(join(ORIGEN, archivo))
    .resize({ width: 720, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(salida);
  console.log(`${salida} · ${Math.round(info.size / 1024)} KB`);
}
