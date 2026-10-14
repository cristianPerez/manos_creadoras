import { createHash } from "node:crypto";

/**
 * De dónde salen los videos del curso.
 *
 * ⚠️ POR QUÉ NO ES HOTMART: el soporte de Hotmart confirmó (2026-08-03) que el Hotmart
 * Player funciona EXCLUSIVAMENTE dentro de Hotmart Club y que no existe código de
 * inserción para sitios externos. La app tiene que servir el video desde otro lado.
 * Ellos mismos recomiendan alojar en un servicio de video y embeber ESE video — así el
 * mismo archivo sirve para la app y para Hotmart Club, sin subir nada dos veces.
 *
 * Se soportan tres destinos para no atar el proyecto a ninguno:
 *  · bunny   — Bunny Stream. El más barato y con enlace firmado que caduca (recomendado).
 *  · vimeo   — cómodo de administrar, precio plano.
 *  · youtube — gratis, pero cualquiera con el enlace puede verlo: solo para material abierto.
 *
 * Esta función corre SIEMPRE en el servidor (firma con una clave secreta), así que el
 * navegador nunca ve la clave, solo un enlace que expira.
 */

export type ProveedorVideo = "bunny" | "vimeo" | "youtube";

export type Video = {
  proveedor: ProveedorVideo;
  /** El identificador tal cual lo da el proveedor. En Vimeo puede venir como "id/hash". */
  id: string;
};

/** Cuánto vive un enlace firmado de Bunny. Da margen para ver una lección larga y pausar. */
const HORAS_DE_VIDA = 6;

/**
 * Devuelve la URL del reproductor embebido, o `null` si ese proveedor no está
 * configurado todavía. Si devuelve `null`, la pantalla muestra el marcador de
 * "estamos subiendo este video" en vez de un reproductor roto.
 */
export function urlDelReproductor(video: Video): string | null {
  switch (video.proveedor) {
    case "bunny":
      return urlBunny(video.id);
    case "vimeo":
      return urlVimeo(video.id);
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?rel=0&modestbranding=1&playsinline=1`;
  }
}

/**
 * Bunny Stream. La biblioteca es pública (va en la URL); la clave de firma NO.
 *
 * Con `BUNNY_TOKEN_KEY` configurada el enlace se firma y caduca, así que copiar la URL
 * del inspector del navegador no sirve para compartir el curso: a las pocas horas deja
 * de funcionar. Sin la clave el video igual se ve, pero sin esa protección.
 */
function urlBunny(videoId: string): string | null {
  const biblioteca = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  if (!biblioteca) return null;

  const base = `https://iframe.mediadelivery.net/embed/${biblioteca}/${encodeURIComponent(videoId)}`;
  const clave = process.env.BUNNY_TOKEN_KEY;
  if (!clave) return base;

  const expira = Math.floor(Date.now() / 1000) + HORAS_DE_VIDA * 3600;
  const firma = createHash("sha256").update(`${clave}${videoId}${expira}`).digest("hex");
  return `${base}?token=${firma}&expires=${expira}`;
}

/**
 * La miniatura que Bunny genera de cada video.
 *
 * ⚠️ VA POR OTRO HOSTNAME, y no se puede deducir del id de la biblioteca. Bunny
 * sirve los videos desde `iframe.mediadelivery.net` pero las imágenes desde la
 * zona de pull de la cuenta (`vz-36dca6c8-7e1.b-cdn.net`), que es un valor suyo
 * y hay que leerlo del propio reproductor. Por eso va en variable de entorno:
 * el día que Bunny la cambie, no hay que recompilar.
 *
 * Se usa como PÓSTER: la pantalla enseña esta imagen con nuestro botón de play
 * encima y NO monta el iframe hasta que alguien lo pulsa. Así el home no carga
 * dieciséis reproductores de golpe, y hasta el clic todo lo que se ve es
 * nuestro — misma tipografía, mismo dorado.
 *
 * Devuelve `null` si no está configurada: quien lo use debe tener su propio
 * respaldo (la portada del bolso), no un hueco.
 */
export function urlDeMiniatura(videoId: string): string | null {
  const zona = process.env.NEXT_PUBLIC_BUNNY_CDN_HOST;
  if (!zona) return null;
  return `https://${zona}/${encodeURIComponent(videoId)}/thumbnail.jpg`;
}

/** Vimeo. Los videos privados llevan un hash: se guarda como "123456789/abc123def". */
function urlVimeo(id: string): string {
  const [numero, hash] = id.split("/");
  const base = `https://player.vimeo.com/video/${encodeURIComponent(numero)}`;
  return hash ? `${base}?h=${encodeURIComponent(hash)}` : base;
}
