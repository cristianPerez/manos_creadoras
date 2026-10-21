import { headers } from "next/headers";

/**
 * Desde qué país nos está visitando quien pide esta página.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ EL USER-AGENT NO SIRVE PARA ESTO, Y ES LA TRAMPA EVIDENTE
 * ════════════════════════════════════════════════════════════════════════════
 * El User-Agent lleva navegador, sistema y dispositivo:
 *
 *   Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) … Safari/605.1.15
 *
 * Ahí NO hay geografía. Montar el cobro sobre él significaría mandarle a una
 * alumna de México el enlace de la pasarela colombiana — o al revés.
 *
 * Lo que sí dice el país es `x-vercel-ip-country`: Vercel lo calcula de la IP y
 * lo añade a cada petición, sin coste ni configuración.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type Region = "colombia" | "internacional";
export type FuenteDelPais = "vercel" | "idioma" | "defecto";

export type PaisDetectado = {
  /** ISO-3166 alpha-2 en mayúsculas: "CO", "MX", "PE"… */
  pais: string;
  fuente: FuenteDelPais;
  /** En qué navega. Se guarda como dato de dispositivo, NO como país. */
  userAgent: string | null;
};

/** El país que se asume cuando no se puede saber. Ver `regionDe`. */
const PAIS_POR_DEFECTO = "XX";

export async function detectarPais(): Promise<PaisDetectado> {
  const h = await headers();
  const userAgent = h.get("user-agent");

  // 1. Vercel. Es el bueno: sale de la IP y lo pone la plataforma.
  const deVercel = h.get("x-vercel-ip-country");
  if (deVercel && deVercel.length === 2) {
    return { pais: deVercel.toUpperCase(), fuente: "vercel", userAgent };
  }

  /*
   * 2. El idioma del navegador, solo como red.
   *
   * ⚠️ ES POBRE Y HAY QUE SABERLO: "es-419" (español de Latinoamérica) no dice
   * el país, y mucha gente en Colombia navega con el sistema en inglés. Solo se
   * acepta cuando trae país explícito, como "es-CO".
   */
  const idioma = h.get("accept-language");
  const conPais = idioma?.match(/[a-z]{2}-([A-Z]{2})/);
  if (conPais) {
    return { pais: conPais[1].toUpperCase(), fuente: "idioma", userAgent };
  }

  return { pais: PAIS_POR_DEFECTO, fuente: "defecto", userAgent };
}

/**
 * De qué pasarela cobra este país.
 *
 * ⚠️ EL RESPALDO ES "INTERNACIONAL" A PROPÓSITO. Si no se pudo averiguar el
 * país, es mejor que una colombiana vea el enlace internacional —puede pagar
 * igual— a que una mexicana se tope con un cobro en pesos colombianos y
 * abandone. El error barato es el que se elige.
 */
export function regionDe(pais: string): Region {
  return pais.toUpperCase() === "CO" ? "colombia" : "internacional";
}
