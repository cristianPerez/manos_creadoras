import { PlayCircle } from "lucide-react";
import { HOTMART_EMBED_BASE } from "@/lib/config";

export function VideoLeccion({
  videoId,
  titulo,
}: {
  videoId: string;
  titulo: string;
}) {
  if (videoId) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border-default bg-surface-tertiary">
        <iframe
          src={`${HOTMART_EMBED_BASE}/${videoId}`}
          title={titulo}
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-border-default bg-surface-tertiary shadow-sm">
      <PlayCircle className="text-brand-primary" size={40} strokeWidth={1.5} aria-hidden="true" />
      <p className="text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
        Tu video se conecta al enlazar Hotmart
      </p>
    </div>
  );
}
