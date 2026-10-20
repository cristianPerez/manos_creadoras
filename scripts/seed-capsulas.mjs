/**
 * Carga las 5 cápsulas del home.
 *
 * ⚠️ LOS TEXTOS SON PROVISIONALES: los escribió el prompt del diseño, no
 * Elizabeth. Y los VIDEOS NO EXISTEN todavía — `video_id` queda nulo y el visor
 * enseña la portada diciendo que el video llega pronto, en vez de abrir un
 * reproductor roto.
 *
 * ⚠️ `portada_url` YA NO ES LO QUE SE VE: desde el 2026-10-19 el círculo
 * enseña un fotograma DEL PROPIO VIDEO de la cápsula (`lib/capsulas.ts` la
 * calcula con `urlDeMiniatura`). Esto se queda solo como RESPALDO para cuando
 * Bunny no sirve la miniatura — su CDN de imágenes bloquea localhost.
 *
 * ⚠️ Y son `.webp`, no `.jpg`: las portadas de los bolsos se convirtieron
 * todas en la migración 0033 y los `.jpg` se borraron. Con la ruta vieja, los
 * cinco círculos se quedaban negros en cuanto fallaba la miniatura.
 *
 * Las portadas se toman prestadas de bolsos que SÍ tienen foto. Es provisional
 * también: cuando se graben las cápsulas tendrán la suya.
 *
 * Idempotente: se puede correr diez veces sin duplicar nada.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const l of readFileSync(".env.local", "utf8").split("\n")) {
  const m = l.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].split("#")[0].trim();
}

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const CAPSULAS = [
  { orden: 1, titulo: "Elige tus cuentas",      etiqueta_corta: "Cuentas",  subtitulo: "Tamaños y acabados para empezar", portada: "cristal-brillante" },
  { orden: 2, titulo: "El hilo correcto",       etiqueta_corta: "El hilo",  subtitulo: "0,40 · 0,45 · 0,6 · 0,7 mm",      portada: "brillo-lunar" },
  { orden: 3, titulo: "El nudo que no se suelta", etiqueta_corta: "El nudo", subtitulo: "Empieza y termina sin miedo",     portada: "perla-tejida" },
  { orden: 4, titulo: "Tensión pareja",         etiqueta_corta: "Tensión",  subtitulo: "Para que la base no se abombe",   portada: "gota-de-rocio" },
  { orden: 5, titulo: "Remate invisible",       etiqueta_corta: "Remate",   subtitulo: "Que no se note el final",         portada: "marfil-elegante" },
];

const { error } = await db.from("capsulas").upsert(
  CAPSULAS.map((c) => ({
    orden: c.orden,
    titulo: c.titulo,
    etiqueta_corta: c.etiqueta_corta,
    subtitulo: c.subtitulo,
    video_id: null,
    portada_url: `/images/bolso-${c.portada}.webp`,
  })),
  { onConflict: "orden" },
);

if (error) {
  console.error("❌", error.message);
  process.exit(1);
}

const { count } = await db.from("capsulas").select("*", { count: "exact", head: true });
console.log(`✅ ${count} cápsulas cargadas (sin video todavía)`);
