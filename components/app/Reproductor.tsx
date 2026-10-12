import { Lock, VideoOff } from "lucide-react";

/**
 * El reproductor de Bunny.
 *
 * ⚠️ TIENE DOS ESTADOS DE RESPALDO, Y LOS DOS IMPORTAN.
 *
 * `bloqueado` → no hay plan. No se pinta un reproductor que luego falla: se
 * dice que hace falta el plan, que es información útil.
 *
 * `url === null` → el video no está disponible (falta la biblioteca de Bunny,
 * o ese identificador no existe). Esto NO es hipotético: durante semanas las
 * lecciones de cortesía apuntaban a un video que no existía y el reproductor
 * mostraba un 404 de Bunny dentro de un marco negro. Un 404 ajeno dentro de tu
 * app parece que tu app está rota.
 */
export function Reproductor({
  url,
  bloqueado,
  titulo,
}: {
  url: string | null;
  bloqueado: boolean;
  titulo: string;
}) {
  if (url) {
    return (
      <div className="bg-espresso aspect-video overflow-hidden rounded-[var(--radius-lg)]">
        <iframe
          src={url}
          title={titulo}
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="size-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="bg-espresso flex aspect-video flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] px-6 text-center">
      <span aria-hidden="true" className="text-gold-light">
        {bloqueado ? <Lock size={28} /> : <VideoOff size={28} />}
      </span>
      <p className="font-display text-lg text-white" style={{ fontWeight: 500 }}>
        {bloqueado ? "Este video viene con el plan" : "Este video aún no está disponible"}
      </p>
      <p className="max-w-sm text-sm text-white/60">
        {bloqueado
          ? "Puedes ver los pasos y los materiales mientras decides."
          : "Lo estamos subiendo. Los demás pasos de este bolso sí funcionan."}
      </p>
    </div>
  );
}
