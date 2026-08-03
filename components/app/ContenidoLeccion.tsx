import { FileText, Link2, PlayCircle, ScrollText } from "lucide-react";
import { HOTMART_EMBED_BASE } from "@/lib/config";
import type { TipoLeccion } from "@/lib/curso";

/**
 * El contenido de una lección. No todo el curso es video: la sección de bienvenida
 * son avisos y enlaces, y hay secciones con patrones en PDF.
 *
 * Mientras la lección no tenga su identificador de Hotmart, se muestra un marcador
 * rotulado en vez de un reproductor roto (regla UX 11: nada finge funcionar).
 */
const MARCADOR: Record<TipoLeccion, { Icono: typeof PlayCircle; texto: string }> = {
  video: { Icono: PlayCircle, texto: "Tu video se conecta al enlazar Hotmart" },
  pdf: { Icono: FileText, texto: "Tus patrones en PDF se conectan al enlazar Hotmart" },
  enlace: { Icono: Link2, texto: "Este enlace se conecta al enlazar Hotmart" },
  texto: { Icono: ScrollText, texto: "Esta lectura se conecta al enlazar Hotmart" },
};

export function ContenidoLeccion({
  tipo,
  hotmartId,
  titulo,
}: {
  tipo: TipoLeccion;
  hotmartId: string | null;
  titulo: string;
}) {
  if (tipo === "video" && hotmartId) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border-default bg-surface-tertiary">
        <iframe
          src={`${HOTMART_EMBED_BASE}/${hotmartId}`}
          title={titulo}
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  const { Icono, texto } = MARCADOR[tipo];

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-border-default bg-surface-tertiary px-6 text-center shadow-sm">
      <Icono className="text-brand-primary" size={40} strokeWidth={1.5} aria-hidden="true" />
      <p className="text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
        {texto}
      </p>
    </div>
  );
}
