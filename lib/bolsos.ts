import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import {
  agruparEnPasos,
  type Bolso,
  type BolsoConDetalle,
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
  const supabase = await supabaseServer();
  const { data } = await supabase.from("progreso").select("video_id");
  return new Set((data ?? []).map((f: { video_id: string }) => f.video_id));
}

/** El catálogo entero, con el avance de quien mira. */
export const listarBolsos = cache(async (): Promise<Bolso[]> => {
  const supabase = await supabaseServer();

  const [{ data }, vistos] = await Promise.all([
    supabase
      .from("bolsos")
      .select(
        "id, slug, nombre, orden, video_materiales_id, medidas_cm, portada_url, gratis, lecciones(id, orden, titulo, video_id, parte, duracion_seg)",
      )
      .order("orden"),
    videosVistos(),
  ]);

  return (data ?? []).map((f) => construirBolso(f, vistos));
});

/** Una ficha completa. `null` si el slug no existe. */
export const obtenerBolso = cache(async (slug: string): Promise<BolsoConDetalle | null> => {
  const supabase = await supabaseServer();

  const [{ data }, vistos] = await Promise.all([
    supabase
      .from("bolsos")
      .select(
        "id, slug, nombre, orden, video_materiales_id, medidas_cm, portada_url, gratis, lecciones(id, orden, titulo, video_id, parte, duracion_seg)",
      )
      .eq("slug", slug)
      .maybeSingle(),
    videosVistos(),
  ]);

  if (!data) return null;

  const bolso = construirBolso(data, vistos);

  const [{ data: mats }, { data: marcados }] = await Promise.all([
    supabase
      .from("materiales")
      .select("id, orden, texto, material_directorio(directorio_items(id, nombre, url))")
      .eq("bolso_id", bolso.id)
      .order("orden"),
    supabase.from("checklist_materiales").select("material_id, tengo"),
  ]);

  const tengo = new Map(
    (marcados ?? []).map((m: { material_id: string; tengo: boolean }) => [m.material_id, m.tengo]),
  );

  type ItemCompra = { id: string; nombre: string; url: string | null };

  const materiales: Material[] = (mats ?? []).map((m) => ({
    id: m.id,
    texto: m.texto,
    compras: comoLista(m.material_directorio).flatMap((md) =>
      comoLista<ItemCompra>(md.directorio_items),
    ),
    tengo: tengo.get(m.id) ?? false,
  }));

  return { ...bolso, pasos: agruparEnPasos(bolso.lecciones), materiales };
});

/* ── El directorio ───────────────────────────────────────────────────────── */

export const listarDirectorio = cache(
  async (): Promise<{ categorias: { id: string; nombre: string }[]; items: ItemDirectorio[] }> => {
    const supabase = await supabaseServer();

    const [{ data: cats }, { data: items }, { data: usos }] = await Promise.all([
      supabase.from("directorio_categorias").select("id, nombre").order("orden"),
      supabase.from("directorio_items").select("id, nombre, url, precio_referencia, categoria_id"),
      supabase.from("material_directorio").select("item_id, materiales(bolso_id)"),
    ]);

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
        url: i.url,
        precioReferencia: i.precio_referencia,
        categoria: nombreCat.get(i.categoria_id) ?? "",
        bolsos: porItem.get(i.id)?.size ?? 0,
      })),
    };
  },
);
