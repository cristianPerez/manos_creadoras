import { Lock, VideoOff } from "lucide-react";
import { ReproductorEnSitio } from "@/components/home/ReproductorEnSitio";

/**
 * El reproductor de Bunny dentro de la app.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ ANTES MONTABA EL IFRAME DE ENTRADA Y SE REPRODUCÍA CON EL PLAY DE BUNNY
 * ════════════════════════════════════════════════════════════════════════════
 * Eso tenía dos problemas, y el segundo lo pidió arreglar Cristian el
 * 2026-10-20: *"el audio… debe reproducirse y escucharse cuando el usuario le
 * dé click"*. Con el play de Bunny el sonido depende de su reproductor, y el
 * iframe —medio mega por video— se cargaba aunque ella nunca le diera.
 *
 * Ahora delega en `ReproductorEnSitio`, el mismo del curso gratis del home:
 * enseña un póster NUESTRO con el botón dorado y, al tocarlo, monta el iframe
 * ya reproduciendo y CON SONIDO (con su plan B mudo si el navegador no deja).
 *
 * ⚠️ SE REUTILIZA, NO SE COPIA. La lógica del sonido es sutil —tres variantes
 * probadas, dos descartadas— y tenerla en dos sitios garantiza que un día
 * arreglen uno y el otro se quede atrás. Este archivo solo aporta lo que el
 * del home no tiene: los dos estados de respaldo de abajo.
 *
 * ⚠️ LOS DOS ESTADOS DE RESPALDO IMPORTAN.
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
  poster = null,
  respaldo = null,
  arrancar = false,
}: {
  url: string | null;
  bloqueado: boolean;
  titulo: string;
  /** La miniatura del propio video (Bunny). */
  poster?: string | null;
  /** La portada del bolso, por si Bunny no sirve la miniatura. */
  respaldo?: string | null;
  /**
   * Arranca solo, con sonido. SOLO cuando se llega desde un toque suyo en un
   * paso (`?ver=1`): un video no empieza a sonar porque sí al abrir la página.
   */
  arrancar?: boolean;
}) {
  if (url) {
    return (
      <div className="bg-espresso aspect-video overflow-hidden rounded-[var(--radius-lg)]">
        <ReproductorEnSitio
          arrancarAlMontar={arrancar}
          url={url}
          poster={poster}
          respaldo={respaldo}
          titulo={titulo}
          className="size-full"
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
