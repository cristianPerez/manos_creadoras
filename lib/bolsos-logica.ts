/**
 * Los bolsos: tipos y reglas, SIN tocar la base.
 *
 * ⚠️ ESTE ARCHIVO EXISTE SEPARADO POR UNA RAZÓN CONCRETA. La rejilla del
 * catálogo y los filtros son componentes de CLIENTE, y necesitan `estadoDe` y
 * `siguienteVideo`. Si esas funciones vivieran junto a las consultas, importar
 * una sola arrastraría al navegador el cliente de servidor de Supabase —que usa
 * `next/headers`— y Next lo rechaza en cuanto se compila.
 *
 * La regla, por si vuelve a pasar: lo que puedan necesitar las dos mitades va
 * aquí; lo que habla con la base, en `lib/bolsos.ts`.
 */

export type Leccion = {
  id: string;
  orden: number;
  titulo: string;
  videoId: string;
  /** "1 de 2" cuando el paso se partió en varios videos. */
  parte: string | null;
  duracionSeg: number | null;
  vista: boolean;
};

/**
 * Un paso tal como se ENSEÑA, que no es lo mismo que una lección.
 *
 * Cuando Elizabeth partió un paso en dos videos, la base guarda dos lecciones
 * con el mismo título y `parte` distinto. En pantalla eso es UN paso con dos
 * partes dentro.
 */
export type Paso = {
  /** 1, 2, 3… Cuenta pasos, NO videos, y no incluye el de materiales. */
  numero: number;
  titulo: string;
  partes: Leccion[];
  completado: boolean;
};

export type Material = {
  id: string;
  texto: string;
  /** Productos del directorio con los que se compra. Puede venir vacío. */
  compras: { id: string; nombre: string; url: string | null }[];
  tengo: boolean;
};

export type Bolso = {
  id: string;
  slug: string;
  nombre: string;
  orden: number;
  videoMaterialesId: string;
  medidas: Record<string, number> | null;
  portadaUrl: string | null;
  gratis: boolean;
  lecciones: Leccion[];
  /** Total de videos = lecciones + el de materiales. */
  videos: number;
  vistos: number;
  materialesVisto: boolean;
};

export type BolsoConDetalle = Bolso & {
  pasos: Paso[];
  materiales: Material[];
};

/* ── La regla de agrupar ─────────────────────────────────────────────────── */

/**
 * Convierte lecciones en pasos.
 *
 * ⚠️ EL NÚMERO DE PASOS SE CALCULA, NUNCA SE ESCRIBE. Se agrupan las lecciones
 * consecutivas que comparten título, y cada grupo es un paso. Así, el día que
 * se cargue un bolso nuevo con otro reparto de partes, los números salen solos.
 *
 * `consecutivas` importa: si un bolso repitiera el mismo título en dos momentos
 * distintos del proceso —"Acabados finales" al principio y al final— son dos
 * pasos, no uno partido. Agrupar por título a secas los fundiría y dejaría la
 * ficha mintiendo.
 */
export function agruparEnPasos(lecciones: Leccion[]): Paso[] {
  const pasos: Paso[] = [];

  for (const leccion of lecciones) {
    const ultimo = pasos.at(-1);
    if (ultimo && ultimo.titulo === leccion.titulo) {
      ultimo.partes.push(leccion);
    } else {
      pasos.push({ numero: pasos.length + 1, titulo: leccion.titulo, partes: [leccion], completado: false });
    }
  }

  for (const paso of pasos) {
    paso.completado = paso.partes.every((p) => p.vista);
  }

  return pasos;
}

/** El siguiente video sin ver, que es a donde lleva el botón "Continuar". */
export function siguienteVideo(bolso: Bolso): {
  videoId: string;
  etiqueta: string;
  orden: number;
} | null {
  if (!bolso.materialesVisto) {
    return { videoId: bolso.videoMaterialesId, etiqueta: "Materiales", orden: 0 };
  }

  const pasos = agruparEnPasos(bolso.lecciones);
  for (const paso of pasos) {
    for (const parte of paso.partes) {
      if (!parte.vista) {
        return {
          videoId: parte.videoId,
          etiqueta: `Paso ${paso.numero} · ${paso.titulo}${parte.parte ? `, parte ${parte.parte}` : ""}`,
          orden: parte.orden,
        };
      }
    }
  }
  return null; // terminado
}

/**
 * Las medidas, EN ORDEN. Largo primero, luego alto, luego ancho.
 *
 * ⚠️ HACE FALTA PORQUE EL ORDEN DEL JSON NO SOBREVIVE. Postgres guarda `jsonb`
 * normalizado —ordena las claves por longitud y luego alfabéticamente— así que
 * al leerlo salía "alto, ancho, largo": 12, 5, 19. Las medidas de un bolso se
 * dicen largo × alto × ancho, siempre, y leerlas en otro orden hace dudar de
 * cuál es cuál.
 *
 * Las claves que no están en la lista van al final, en el orden que vengan: así
 * un bolso con una medida rara (`largo_estrechamiento`) no se pierde.
 */
const ORDEN_MEDIDAS = ["largo", "diametro", "alto", "alto_con_asa", "ancho"];

export function medidasOrdenadas(medidas: Bolso["medidas"]): [string, number][] {
  if (!medidas) return [];
  const entradas = Object.entries(medidas);
  return entradas.sort(([a], [b]) => {
    const ia = ORDEN_MEDIDAS.indexOf(a);
    const ib = ORDEN_MEDIDAS.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

/** "19 × 12 × 5 cm" a partir del jsonb, o null si ese bolso aún no tiene medidas. */
export function medidasEnTexto(medidas: Bolso["medidas"]): string | null {
  if (!medidas) return null;
  const { largo, alto, ancho, diametro } = medidas;
  const partes = [diametro ?? largo, alto, ancho].filter((n) => typeof n === "number");
  if (partes.length === 0) return null;
  return `${partes.map((n) => String(n).replace(".", ",")).join(" × ")} cm`;
}

/**
 * El bolso que se sugiere retomar: el más avanzado sin terminar.
 *
 * Se ordena por videos vistos y no por fecha porque `progreso` guarda cuándo se
 * vio cada video, pero pedir el máximo por bolso costaría otra consulta. Con 14
 * bolsos, ordenar en memoria es gratis y evita el viaje.
 */
export function continuarDonde(bolsos: Bolso[]): Bolso | null {
  const empezados = bolsos.filter((b) => b.vistos > 0 && b.vistos < b.videos);
  if (empezados.length > 0) {
    return empezados.sort((a, b) => b.vistos - a.vistos)[0];
  }
  // Nadie ha empezado nada: se sugiere el gratis, que es por donde se entra.
  return bolsos.find((b) => b.gratis) ?? bolsos[0] ?? null;
}

/**
 * El orden en que se enseña el catálogo.
 *
 * ⚠️ EL BOLSO GRATIS VA PRIMERO, y no es lo mismo que el orden de Elizabeth.
 * El campo `orden` es el suyo —el del PDF— y se respeta en todo lo demás; aquí
 * se antepone el gratis porque esta lista la mira sobre todo quien AÚN NO HA
 * EMPEZADO, y lo único que puede abrir sin pagar debe estar donde se ve sin
 * desplazarse. Enterrado en la posición 10 es como no tenerlo.
 *
 * Se ordena al mostrar y no se cambia el dato: cambiar `orden` en la base
 * perdería el orden original de Elizabeth, que es información suya.
 */
export function ordenCatalogo(bolsos: Bolso[]): Bolso[] {
  return [...bolsos].sort((a, b) => {
    if (a.gratis !== b.gratis) return a.gratis ? -1 : 1;
    return a.orden - b.orden;
  });
}

export function estadoDe(bolso: Bolso): "terminado" | "en-curso" | "nuevo" {
  if (bolso.vistos >= bolso.videos) return "terminado";
  return bolso.vistos > 0 ? "en-curso" : "nuevo";
}

/* ── El directorio ───────────────────────────────────────────────────────── */

export type ItemDirectorio = {
  id: string;
  nombre: string;
  url: string | null;
  precioReferencia: string | null;
  categoria: string;
  /** En cuántos bolsos se usa. Sale de la tabla puente, no se escribe a mano. */
  bolsos: number;
};

