import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";
import { alumnaActual } from "@/lib/alumna";
import {
  ETIQUETA_CATALOGO,
  ETIQUETA_MATERIALES,
  VIDA_CATALOGO_S,
  VIDA_MATERIALES_S,
} from "@/lib/cache-datos";
import { supabasePublico } from "@/lib/supabase/publico";
import { supabaseServer } from "@/lib/supabase/server";
import {
  agruparEnPasos,
  type Bolso,
  type BolsoConDetalle,
  type AccesoDirectorio,
  type ItemDirectorio,
  type Material,
} from "@/lib/bolsos-logica";

/**
 * Las consultas de los bolsos. SOLO servidor.
 *
 * Los tipos y las reglas que no tocan la base viven en `lib/bolsos-logica.ts`,
 * para que los componentes de cliente puedan usarlas sin arrastrar hasta el
 * navegador el cliente de Supabase. Aquí se re-exportan para que quien solo
 * necesite datos tenga un único sitio del que importar.
 */
export * from "@/lib/bolsos-logica";

/* ── Consultas ───────────────────────────────────────────────────────────── */

/**
 * Normaliza una relación incrustada de PostgREST.
 *
 * ⚠️ HACE FALTA PORQUE EL TIPO Y LA REALIDAD NO COINCIDEN. Cuando se pide
 * `material_directorio(directorio_items(...))`, en ejecución PostgREST
 * devuelve UN objeto —la relación es de muchos a uno— pero la inferencia de
 * tipos de Supabase la declara como lista, porque no puede saberlo desde el
 * texto de la consulta.
 *
 * Tratarlo como lista rompería en ejecución; tratarlo como objeto no compila.
 * Esto acepta las dos formas y siempre devuelve lista, que es con lo que el
 * resto del archivo trabaja.
 */
function comoLista<T>(valor: T | T[] | null | undefined): T[] {
  if (valor === null || valor === undefined) return [];
  return Array.isArray(valor) ? valor : [valor];
}

type FilaLeccion = {
  id: string;
  orden: number;
  titulo: string;
  video_id: string;
  parte: string | null;
  duracion_seg: number | null;
};

function construirBolso(
  fila: {
    id: string;
    slug: string;
    nombre: string;
    orden: number;
    video_materiales_id: string;
    medidas_cm: Record<string, number> | null;
    portada_url: string | null;
    gratis: boolean;
    lecciones: FilaLeccion[];
  },
  vistos: Set<string>,
): Bolso {
  const lecciones = [...fila.lecciones]
    .sort((a, b) => a.orden - b.orden)
    .map((l) => ({
      id: l.id,
      orden: l.orden,
      titulo: l.titulo,
      videoId: l.video_id,
      parte: l.parte,
      duracionSeg: l.duracion_seg,
      vista: vistos.has(l.video_id),
    }));

  const materialesVisto = vistos.has(fila.video_materiales_id);

  return {
    id: fila.id,
    slug: fila.slug,
    nombre: fila.nombre,
    orden: fila.orden,
    videoMaterialesId: fila.video_materiales_id,
    medidas: fila.medidas_cm,
    portadaUrl: fila.portada_url,
    gratis: fila.gratis,
    lecciones,
    // El de materiales SÍ cuenta como video, aunque no cuente como paso.
    videos: lecciones.length + 1,
    vistos: lecciones.filter((l) => l.vista).length + (materialesVisto ? 1 : 0),
    materialesVisto,
  };
}

/**
 * Qué videos ha visto quien mira. Vacío si no ha entrado.
 *
 * Una consulta aparte y no un `join`: así la lista de bolsos se puede cachear
 * igual para todo el mundo y lo único personal es este conjunto.
 */
async function videosVistos(): Promise<Set<string>> {
  if (!(await haySesion())) return new Set();
  const supabase = await supabaseServer();
  const { data } = await supabase.from("progreso").select("video_id");
  return new Set((data ?? []).map((f: { video_id: string }) => f.video_id));
}

/**
 * ¿Trae esta visita una cookie de sesión de Supabase?
 *
 * ⚠️ ES UN ATAJO, NO UN CONTROL DE ACCESO. Sirve para NO ir a la base a buscar
 * el avance o el checklist de alguien que no ha entrado (la mayoría de las
 * visitas del home): sin sesión, RLS iba a devolver vacío de todos modos, pero
 * costaba un viaje a la base por página. Si la cookie está, se pregunta de
 * verdad y RLS decide como siempre. Leer la cookie es local: cero red.
 */
async function haySesion(): Promise<boolean> {
  const bote = await cookies();
  return bote.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
}

/** Lo que se pide de cada bolso. Uno solo para el catálogo y la ficha. */
const COLUMNAS_BOLSO =
  "id, slug, nombre, orden, video_materiales_id, medidas_cm, portada_url, gratis, lecciones(id, orden, titulo, video_id, parte, duracion_seg)";

type FilaBolso = Parameters<typeof construirBolso>[0];

/**
 * El catálogo, IGUAL PARA TODO EL MUNDO, en la caché de datos de Next
 * (2026-11-05). Ver `lib/cache-datos.ts`.
 *
 * Si la base falla, LANZA: así no se guarda un catálogo vacío durante 10
 * minutos. Quien lo llama decide (ver `filasDelCatalogo`).
 */
const catalogoCacheado = unstable_cache(
  async (): Promise<FilaBolso[]> => {
    const { data, error } = await supabasePublico()
      .from("bolsos")
      .select(COLUMNAS_BOLSO)
      .order("orden");
    if (error || !data) throw new Error(`catalogo: ${error?.message ?? "sin datos"}`);
    return data as FilaBolso[];
  },
  ["catalogo-v1"],
  { revalidate: VIDA_CATALOGO_S, tags: [ETIQUETA_CATALOGO] },
);

/** El catálogo, o vacío si la base falla (lo mismo que hacía antes la página). */
async function filasDelCatalogo(): Promise<FilaBolso[]> {
  try {
    return await catalogoCacheado();
  } catch {
    return [];
  }
}

type FilaMaterial = {
  id: string;
  orden: number;
  texto: string;
  material_directorio: unknown;
};

/** Los materiales de una ficha, también públicos y cacheados (uno por bolso). */
const materialesCacheados = unstable_cache(
  async (bolsoId: string): Promise<FilaMaterial[]> => {
    const { data, error } = await supabasePublico()
      .from("materiales")
      .select("id, orden, texto, material_directorio(directorio_items(id, nombre, tiene_enlace))")
      .eq("bolso_id", bolsoId)
      .order("orden");
    if (error || !data) throw new Error(`materiales: ${error?.message ?? "sin datos"}`);
    return data as FilaMaterial[];
  },
  ["materiales-v1"],
  { revalidate: VIDA_MATERIALES_S, tags: [ETIQUETA_MATERIALES] },
);

/** El catálogo entero, con el avance de quien mira. */
export const listarBolsos = cache(async (): Promise<Bolso[]> => {
  const [filas, vistos] = await Promise.all([filasDelCatalogo(), videosVistos()]);
  return filas.map((f) => construirBolso(f, vistos));
});

/**
 * Una ficha completa. `null` si el slug no existe.
 *
 * Sale del MISMO catálogo cacheado (antes era otra consulta con las mismas
 * columnas): la ficha ya no le cuesta a la base más que sus materiales, y esos
 * también vienen de la caché. Lo único fresco es lo personal.
 */
export const obtenerBolso = cache(async (slug: string): Promise<BolsoConDetalle | null> => {
  const [filas, vistos] = await Promise.all([filasDelCatalogo(), videosVistos()]);
  const fila = filas.find((f) => f.slug === slug);
  if (!fila) return null;

  const bolso = construirBolso(fila, vistos);

  const [mats, marcados] = await Promise.all([
    materialesCacheados(bolso.id).catch((): FilaMaterial[] => []),
    checklistPropio(),
  ]);

  type ItemCompra = { id: string; nombre: string; tiene_enlace: boolean };
  type Uso = { directorio_items: ItemCompra | ItemCompra[] | null };

  const materiales: Material[] = mats.map((m) => ({
    id: m.id,
    texto: m.texto,
    compras: comoLista(m.material_directorio as Uso | Uso[] | null).flatMap((md) =>
      comoLista<ItemCompra>(md.directorio_items).map((c) => ({
        id: c.id,
        nombre: c.nombre,
        tieneEnlace: c.tiene_enlace,
      })),
    ),
    tengo: marcados.get(m.id) ?? false,
  }));

  return { ...bolso, pasos: agruparEnPasos(bolso.lecciones), materiales };
});

/** El checklist de quien mira (qué materiales ya tiene). Vacío sin sesión. */
async function checklistPropio(): Promise<Map<string, boolean>> {
  if (!(await haySesion())) return new Map();
  const supabase = await supabaseServer();
  const { data } = await supabase.from("checklist_materiales").select("material_id, tengo");
  return new Map(
    (data ?? []).map((m: { material_id: string; tengo: boolean }) => [m.material_id, m.tengo]),
  );
}

/* ── El directorio ───────────────────────────────────────────────────────── */

type FilaCategoria = { id: string; nombre: string };
type FilaItem = {
  id: string;
  nombre: string;
  tiene_enlace: boolean;
  gratis: boolean;
  imagen_url: string | null;
  precio_referencia: string | null;
  categoria_id: string;
};
type FilaUso = {
  item_id: string;
  materiales: { bolso_id: string } | { bolso_id: string }[] | null;
};

/**
 * Las tres tablas del directorio, públicas y cacheadas (2026-11-05). La URL de
 * Temu NO viene aquí ni podría: esa columna no la lee la clave pública
 * (migración 0041) y cada salto pasa por `/app/directorio/ir/<id>`.
 */
const directorioCacheado = unstable_cache(
  async () => {
    const db = supabasePublico();
    const [c, i, u] = await Promise.all([
      db.from("directorio_categorias").select("id, nombre").order("orden"),
      db
        .from("directorio_items")
        .select("id, nombre, tiene_enlace, gratis, imagen_url, precio_referencia, categoria_id"),
      db.from("material_directorio").select("item_id, materiales(bolso_id)"),
    ]);
    if (c.error || i.error || u.error) {
      throw new Error(`directorio: ${(c.error ?? i.error ?? u.error)?.message}`);
    }
    return {
      cats: (c.data ?? []) as FilaCategoria[],
      items: (i.data ?? []) as FilaItem[],
      usos: (u.data ?? []) as FilaUso[],
    };
  },
  ["directorio-v1"],
  { revalidate: VIDA_MATERIALES_S, tags: [ETIQUETA_MATERIALES] },
);

export const listarDirectorio = cache(
  async (): Promise<{ categorias: { id: string; nombre: string }[]; items: ItemDirectorio[] }> => {
    const { cats, items, usos } = await directorioCacheado().catch(() => ({
      cats: [] as FilaCategoria[],
      items: [] as FilaItem[],
      usos: [] as FilaUso[],
    }));

    // Cuántos BOLSOS distintos usan cada producto (no cuántos materiales: el
    // mismo producto puede aparecer dos veces en la misma ficha).
    const porItem = new Map<string, Set<string>>();
    for (const u of usos ?? []) {
      for (const m of comoLista<{ bolso_id: string }>(u.materiales)) {
        const set = porItem.get(u.item_id) ?? new Set<string>();
        set.add(m.bolso_id);
        porItem.set(u.item_id, set);
      }
    }

    const nombreCat = new Map((cats ?? []).map((c) => [c.id, c.nombre]));

    return {
      categorias: cats ?? [],
      items: (items ?? []).map((i) => ({
        id: i.id,
        nombre: i.nombre,
        tieneEnlace: i.tiene_enlace,
        gratis: i.gratis,
        imagenUrl: i.imagen_url,
        precioReferencia: i.precio_referencia,
        categoriaId: i.categoria_id,
        categoria: nombreCat.get(i.categoria_id) ?? "",
        bolsos: porItem.get(i.id)?.size ?? 0,
      }))
        /* El gratis va primero (es "el primer enlace", el que cualquiera abre),
           luego los que tienen enlace, y al final los "Pronto": si se
           mezclaran, diluirían lo que sí se puede comprar. */
        .sort(
          (a, b) =>
            Number(b.gratis) - Number(a.gratis) || Number(b.tieneEnlace) - Number(a.tieneEnlace),
        ),
    };
  },
);

/**
 * ¿Qué puede abrir quien mira el directorio? La misma idea de "acceso" que el
 * resto de la app: la de `alumnaActual()` (que sale de `tiene_acceso`).
 */
export const accesoDirectorio = cache(async (): Promise<AccesoDirectorio> => {
  const alumna = await alumnaActual();
  return { sesion: Boolean(alumna), conAcceso: alumna?.tieneAcceso === true };
});
