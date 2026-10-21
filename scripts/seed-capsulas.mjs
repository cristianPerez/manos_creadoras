/**
 * Carga las 5 cápsulas del home, con sus videos.
 *
 * ⚠️ FUENTE: `Manos_Creadoras_desde_Perla_Clasica_CORREGIDO.pdf` (2026-10-20),
 * página "Cápsulas de aprendizaje". Por fin son CINCO VIDEOS DISTINTOS: hasta
 * aquí solo había cuatro y la quinta repetía "Tipo de grosor" (migración 0030).
 * Los cinco ids se comprobaron en Bunny antes de cargarlos (miniatura 200).
 *
 * Los TÍTULOS son los nombres del PDF. El ORDEN no es el del PDF sino el que ya
 * tenía el home (hilo → fila → unir hilo → firmeza), con "Aro lateral" quinta.
 * Los SUBTÍTULOS se heredan de la cápsula de la misma técnica; el de "Aro
 * lateral" es nuevo y genérico, porque el PDF no lo describe.
 *
 * ⚠️ HASTA ESTA FECHA ESTE SCRIPT ESTABA DESFASADO: ponía `video_id: null` y
 * títulos de un prompt viejo. Correrlo habría dejado las cápsulas sin video.
 *
 * `portada_url` NO ES LO QUE SE VE: el círculo enseña un fotograma del propio
 * video (`lib/capsulas.ts`, `urlDeMiniatura`). La portada es solo el RESPALDO
 * para cuando Bunny no sirve la miniatura (su CDN bloquea localhost).
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
  { orden: 1, titulo: "Hilo adecuado", etiqueta_corta: "Hilo",        subtitulo: "Qué hilo usar y por qué",              video_id: "e1369c32-359f-47eb-b297-be3aac955306", portada: "cristal-brillante" },
  { orden: 2, titulo: "Nueva fila",    etiqueta_corta: "Nueva fila",  subtitulo: "El arranque, paso a paso",             video_id: "83690ef8-e672-4ffe-961b-2065318b8c3b", portada: "brillo-lunar" },
  { orden: 3, titulo: "Nuevo hilo",    etiqueta_corta: "Nuevo hilo",  subtitulo: "Sin que se note el empate",            video_id: "0efda986-7980-42cd-bc02-8c640ba7cdcc", portada: "perla-tejida" },
  { orden: 4, titulo: "Tejido firme",  etiqueta_corta: "Firmeza",     subtitulo: "Para que el bolso guarde su forma",    video_id: "ae790fcb-6ed4-493d-8e68-4c1dda688404", portada: "gota-de-rocio" },
  { orden: 5, titulo: "Aro lateral",   etiqueta_corta: "Aro lateral", subtitulo: "El aro de los laterales, paso a paso", video_id: "746210f3-ff17-4e26-9503-8c8f7c159896", portada: "marfil-elegante" },
];

const { error } = await db.from("capsulas").upsert(
  CAPSULAS.map((c) => ({
    orden: c.orden,
    titulo: c.titulo,
    etiqueta_corta: c.etiqueta_corta,
    subtitulo: c.subtitulo,
    video_id: c.video_id,
    portada_url: `/images/bolso-${c.portada}.webp`,
  })),
  { onConflict: "orden" },
);

if (error) {
  console.error("❌", error.message);
  process.exit(1);
}

const { count } = await db.from("capsulas").select("*", { count: "exact", head: true });
console.log(`✅ ${count} cápsulas cargadas, cada una con su video`);
