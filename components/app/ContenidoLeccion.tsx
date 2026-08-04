import { ExternalLink, FileText, Link2, PlayCircle, ScrollText } from "lucide-react";
import type { Leccion, TipoLeccion } from "@/lib/curso";
import { urlDelReproductor } from "@/lib/video";

/**
 * El contenido de una lección. No todo el curso es video: la sección de bienvenida
 * son avisos y enlaces, y hay secciones con patrones en PDF.
 *
 * Mientras la lección no tenga su video subido (o su enlace cargado), se muestra un
 * marcador rotulado en vez de un reproductor roto (regla UX 11: nada finge funcionar).
 */
const MARCADOR: Record<TipoLeccion, { Icono: typeof PlayCircle; texto: string }> = {
  video: { Icono: PlayCircle, texto: "Estamos subiendo este video — te avisamos apenas esté listo" },
  pdf: { Icono: FileText, texto: "Estamos subiendo estos patrones — te avisamos apenas estén listos" },
  enlace: { Icono: Link2, texto: "Estamos preparando este enlace — te avisamos apenas esté listo" },
  texto: { Icono: ScrollText, texto: "Estamos subiendo esta lectura — te avisamos apenas esté lista" },
};

/** Qué dice el botón según lo que hay del otro lado. */
const ACCION: Partial<Record<TipoLeccion, string>> = {
  pdf: "Abrir los patrones",
  enlace: "Abrir el enlace",
};

export function ContenidoLeccion({ leccion }: { leccion: Leccion }) {
  const { tipo, titulo, video, recursoUrl } = leccion;

  // ── Video ────────────────────────────────────────────────────
  if (tipo === "video" && video) {
    const src = urlDelReproductor(video);
    // `src` viene null si ese proveedor todavía no está configurado (falta la
    // biblioteca de Bunny, por ejemplo): mejor el marcador honesto que un cuadro negro.
    if (src) {
      return (
        // Radio interior menor que el de la card que lo contiene (radios concéntricos).
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border-default bg-surface-tertiary">
          <iframe
            src={src}
            title={titulo}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      );
    }
  }

  // ── PDF de patrones o enlace al grupo ────────────────────────
  if ((tipo === "pdf" || tipo === "enlace") && recursoUrl) {
    const { Icono } = MARCADOR[tipo];
    return (
      <a
        href={recursoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-border-default bg-surface-tertiary px-6 text-center shadow-sm transition-transform active:scale-[0.99] [touch-action:manipulation]"
      >
        <Icono className="text-brand-primary" size={40} strokeWidth={1.5} aria-hidden="true" />
        <span
          className="text-brand-primary flex items-center gap-1.5"
          style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}
        >
          {ACCION[tipo]} <ExternalLink size={14} aria-hidden="true" />
        </span>
      </a>
    );
  }

  // ── Todavía no hay nada que mostrar ──────────────────────────
  const { Icono, texto } = MARCADOR[tipo];

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-border-default bg-surface-tertiary px-6 text-center shadow-sm">
      <Icono className="text-brand-primary" size={40} strokeWidth={1.5} aria-hidden="true" />
      <p className="text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
        {texto}
      </p>
    </div>
  );
}
