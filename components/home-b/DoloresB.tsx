import { Eye, ShoppingBag, SquareCheck, type LucideIcon } from "lucide-react";
import { EntradaB, PiezaB } from "@/components/home-b/EntradaB";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * "LO QUE LOS TUTORIALES NO TE ENSEÑAN" — sección nueva del home B v2
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ VA JUSTO DEBAJO DEL HÉROE PORQUE ES DONDE SE ATIENDE EL DOLOR. La línea
 * del titular lo nombra ("sin pasos saltados ni bolsos deformes"); esta sección
 * lo desarma en tres, con las frustraciones tal cual las cuenta la ficha de
 * avatar: el tutorial de YouTube que se salta el paso clave, el material que
 * se compra mal y se tira, y el acabado casero que da vergüenza enseñar.
 *
 * El dolor va TACHADO y la solución debajo en negrita: se lee en un vistazo
 * como "esto ya no te pasa", sin tener que leer un párrafo.
 *
 * Nivel HUNDIDO (lavanda + líneas por dentro) con tarjetas ELEVADAS encima:
 * es la sección que más profundidad tiene de la página, a propósito — es la
 * que el revisor pidió que se sintiera como un bloque aparte.
 */
const DOLORES: { Icono: LucideIcon; dolor: string; solucion: string }[] = [
  {
    Icono: SquareCheck,
    dolor: "El tutorial se salta el paso clave",
    solucion: "Cada paso está grabado completo y en orden, desde cero.",
  },
  {
    Icono: ShoppingBag,
    dolor: "Compraste cuentas que terminaste tirando",
    solucion: "Cada proyecto trae su ficha de materiales y dónde comprarlos.",
  },
  {
    Icono: Eye,
    dolor: "Se nota que lo hiciste tú",
    solucion: "El Ojo Experto revisa la foto de tu tejido y te dice qué corregir.",
  },
];

export function DoloresB() {
  return (
    <section data-seccion="dolores" className="hundido-b">
      <EntradaB className="contenedor-b py-11 lg:py-18" escalonado={0.09}>
        <p className="eyebrow-b flex items-center gap-3">Si te ha pasado</p>
        <h2 className="titulo-seccion-b mt-2.5 text-balance lg:mt-3">
          Lo que los tutoriales <em className="clave">no te enseñan</em>
        </h2>

        <ul className="mt-5 flex flex-col gap-2.5 lg:mt-8 lg:grid lg:grid-cols-3 lg:gap-4">
          {DOLORES.map(({ Icono, dolor, solucion }) => (
            <PiezaB
              como="li"
              key={dolor}
              className="elevado-b rounded-tarjeta-b flex gap-3.5 p-4 lg:flex-col lg:gap-0 lg:p-6"
            >
              <span className="bg-espresso-2 text-gold-light rounded-foto-b flex size-10 shrink-0 items-center justify-center lg:size-11">
                <Icono size={20} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <div className="min-w-0 lg:mt-4.5">
                <p className="text-ink-body decoration-apoyo text-nota line-through lg:text-sm">
                  {dolor}
                </p>
                <p className="text-espresso mt-1 text-[15.5px] leading-[1.35] font-bold lg:mt-1.5 lg:text-lg lg:leading-[1.4]">
                  {solucion}
                </p>
              </div>
            </PiezaB>
          ))}
        </ul>

        <p className="text-ink-body mt-4.5 text-[15px] leading-[1.55] lg:mt-6.5 lg:text-[17px]">
          Para que tu bolso tenga <strong className="text-espresso">acabado profesional</strong> y
          lo muestres sin vergüenza.
        </p>
      </EntradaB>
    </section>
  );
}
