/**
 * Los cursos que ya se anuncian pero todavía no tienen videos (2026-11-02).
 *
 * ⚠️ POR QUÉ EXISTE. Manos Creadoras dejó de ser "la escuela de bolsos": la
 * membresía son PROYECTOS —bolsos, accesorios, adornos navideños y velas—, y
 * lo que justifica seguir pagando es lo que viene (palabras de Cristian: «son
 * proyectos, no solo bolsos»). Estos cursos se enseñan en el catálogo con
 * candado y su fecha, para que quien paga sepa qué le llega y cuándo.
 *
 * NO van en la tabla `bolsos` porque no tienen videos ni lecciones: una fila
 * ahí sin `video_materiales_id` rompería la ficha y el "Continuar". Cuando se
 * publiquen, cada pieza entra al catálogo como los llaveros (un video por
 * pieza) y el curso SE BORRA de esta lista — si se queda, el catálogo anuncia
 * como "próximamente" algo que ya se puede ver.
 *
 * Para poner la foto de un curso: guardar el archivo en `public/images/` y
 * escribir su ruta en `imagen`. ⚠️ SIN FOTO EL CURSO NO SALE COMO TARJETA (solo
 * se nombra en el subtítulo de la sección): una tarjeta vacía parecía rota.
 */
export type CursoProximo = {
  id: string;
  nombre: string;
  /** Lo que se sabe del contenido. `null` si todavía no está definido. */
  detalle: string | null;
  /** Cuándo se abre, tal como se le dice a la alumna. */
  abre: string;
  /** Ruta en `public/`, o `null` mientras lleguen las fotos. */
  imagen: string | null;
};

export const CURSOS_PROXIMOS: readonly CursoProximo[] = [
  {
    id: "adornos-navidenos",
    nombre: "Adornos navideños",
    // Las 12 piezas de la sección del home (`components/home/Navidad.tsx`).
    detalle: "12 piezas",
    abre: "Diciembre",
    imagen: "/images/navidad-accesorios.webp",
  },
  {
    id: "velas",
    nombre: "Velas",
    // ⚠️ Sin detalle a propósito: el contenido aún no está definido y no se inventa.
    detalle: null,
    abre: "Diciembre",
    imagen: null,
  },
];
