import { ANUNCIO } from "@/lib/landing";

/**
 * La franja de arriba del todo.
 *
 * Es la única pieza oscura antes del héroe y hace de marco: la página arranca
 * con una línea de espresso que separa el navegador del contenido crema.
 *
 * No se puede cerrar a propósito. Una barra de anuncio con una X invita a
 * cerrarla, y lo que dice —que el plan anual sale tres meses gratis— es
 * justamente el argumento que queremos que siga viendo mientras baja.
 */
export function BarraAnuncio() {
  return (
    <div className="bg-espresso px-4 py-2.5 text-center">
      <p className="text-cream text-xs md:text-sm">
        <span aria-hidden="true" className="text-gold-light mr-2">
          ●
        </span>
        {ANUNCIO.texto} <strong className="text-gold-light font-semibold">{ANUNCIO.destacado}</strong>
      </p>
    </div>
  );
}
