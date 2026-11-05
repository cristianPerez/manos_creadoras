"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * LA PALABRA QUE ROTA EN EL TITULAR
 * ════════════════════════════════════════════════════════════════════════════
 * "Crea [bolsos · accesorios · adornos · velas] de perlas de lujo…"
 *
 * Adaptación del componente **Text Rotate** de 21st.dev
 * (https://21st.dev/@danielpetho/components/text-rotate, colección "Fancy
 * Components", de Daniel Petho, MIT). Se parte de su código real —`motion` +
 * `AnimatePresence`, el texto partido en letras con `Intl.Segmenter`, el
 * escalonado por índice— y se le quita todo lo que aquí no se usa.
 *
 * ⚠️ QUÉ SE CAMBIÓ RESPECTO AL ORIGINAL, Y POR QUÉ:
 *
 *   1. **Sin `cn` ni `@/lib/utils`.** Este proyecto no tiene esa utilidad (no
 *      usa shadcn) y no vale la pena traerla por una clase.
 *   2. **Sin `forwardRef` ni la API imperativa** (`next`, `previous`,
 *      `jumpTo`, `reset`). Aquí nadie controla la palabra desde fuera: rota
 *      sola y ya. Código que nadie llama es código que nadie mantiene.
 *   3. **La caja mide la palabra MÁS LARGA, no la actual.** El original deja
 *      que `layout` de motion anime el ancho. Aquí el titular ocupa cuatro
 *      renglones y un ancho que crece y encoge reacomodaría la frase entera a
 *      cada cambio: se vería la página "respirar" sola cada 2,2 segundos. Con
 *      el ancho fijo en la palabra más larga, solo se mueven las letras.
 *   4. **`prefers-reduced-motion`.** El original no lo contempla. Aquí la
 *      palabra cambia sin animación: hay gente a la que el movimiento marea de
 *      verdad. `MotionProvider` ya pone `reducedMotion="user"`, y esto además
 *      se salta el montaje y desmontaje de las letras.
 *   5. **Accesibilidad.** El `<h1>` lleva la frase completa en `aria-label` y
 *      estas letras van `aria-hidden`: un lector de pantalla tiene que leer
 *      una frase, no seis letras saltando.
 *
 * Tiempos de la referencia (`design-ref/paleta-b-claude-code`): sale hacia
 * arriba en 380 ms con `ease-in`, entra desde abajo en 560 ms con
 * `cubic-bezier(.34,1.25,.64,1)` y 25 ms de retraso por letra.
 */

/** Parte en caracteres de verdad: una tilde o una ñ no se parten por la mitad. */
function enLetras(texto: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmentador = new Intl.Segmenter("es", { granularity: "grapheme" });
    return Array.from(segmentador.segment(texto), ({ segment }) => segment);
  }
  return Array.from(texto);
}

const ENTRADA = [0.34, 1.25, 0.64, 1] as const;

export function TextoQueRota({
  palabras,
  intervalo = 2200,
  escalonado = 0.025,
  className,
  onCambio,
}: {
  palabras: string[];
  /** Milisegundos entre cambios. */
  intervalo?: number;
  /** Segundos de retraso entre letra y letra. */
  escalonado?: number;
  className?: string;
  /**
   * Avisa de qué palabra quedó. Lo usa el titular para conjugar el verbo:
   * con "velas" la frase pasa a "conviértelas".
   */
  onCambio?: (indice: number) => void;
}) {
  const [i, setI] = useState(0);
  const quieto = useReducedMotion();

  useEffect(() => {
    if (palabras.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % palabras.length), intervalo);
    return () => clearInterval(id);
  }, [palabras.length, intervalo]);

  /*
   * ⚠️ EL AVISO AL PADRE VA EN SU PROPIO EFECTO, NO DENTRO DEL `setI`.
   *
   * El primer intento lo llamaba dentro de la función que actualiza el estado
   * (`setI((n) => { onCambio(...); return ... })`) y React protestó en consola:
   * "Cannot update a component while rendering a different component". Esa
   * función no es un sitio seguro para efectos secundarios — React puede
   * ejecutarla durante un render, y ahí `onCambio` estaría cambiando el estado
   * del padre a media pintura. En desarrollo es un aviso; en producción son
   * renders perdidos y, con el tiempo, estado que no cuadra.
   *
   * Aquí el aviso sale DESPUÉS de que el cambio ya ocurrió, que además es lo
   * que el padre necesita: conjugar el verbo con la palabra que ya está puesta.
   */
  useEffect(() => {
    onCambio?.(i);
  }, [i, onCambio]);

  const actual = palabras[i] ?? "";
  const letras = useMemo(() => enLetras(actual), [actual]);

  /* La palabra más larga fija el ancho de la caja: ver el punto 3 de arriba. */
  const masLarga = useMemo(
    () => palabras.reduce((a, b) => (b.length > a.length ? b : a), palabras[0] ?? ""),
    [palabras],
  );

  /*
   * Con movimiento reducido, la palabra cambia y ya: ni letras sueltas ni
   * `AnimatePresence`. El hueco invisible sigue reservando el ancho para que
   * tampoco salte la frase.
   */
  /*
   * ⚠️ DOS CAPAS, Y EL RECORTE VA EN LA DE DENTRO. Esto es lo único delicado
   * del componente y costó dos intentos, así que queda escrito:
   *
   *   · La capa de FUERA es un `inline-block` SIN `overflow`. Dentro lleva la
   *     palabra más larga en invisible: eso es lo que reserva el ancho y, sobre
   *     todo, lo que sienta la LÍNEA BASE, porque es texto normal de la misma
   *     fuente y el mismo tamaño que "Crea".
   *   · La capa de DENTRO va en absoluto, cubre a la de fuera y ahí sí lleva
   *     `overflow: hidden`, que es lo que recorta las letras al entrar y salir.
   *
   * El intento anterior ponía el `overflow: hidden` en la capa de fuera, y el
   * CSS tiene una regla poco conocida justo para ese caso: un `inline-block`
   * con overflow deja de alinear por la línea base de su texto y pasa a
   * alinear por su borde inferior. Resultado: la palabra flotaba media línea
   * por encima de "Crea". Se intentó tapar con `vertical-align: top` —que es
   * lo que hace el prototipo— y a 375px coló, pero a 1440, con el titular a
   * 76px, volvió a verse descolgada. Separar las capas lo arregla de raíz en
   * cualquier tamaño.
   */
  if (quieto) {
    return (
      <span className={`relative inline-block ${className ?? ""}`}>
        <span aria-hidden="true" className="invisible whitespace-nowrap">
          {masLarga}
        </span>
        <span className="absolute inset-0 whitespace-nowrap">{actual}</span>
      </span>
    );
  }

  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      {/* Reserva el ancho y la línea base. Invisible, pero ocupa. */}
      <span aria-hidden="true" className="invisible whitespace-nowrap">
        {masLarga}
      </span>

      <span
        aria-hidden="true"
        className="absolute inset-x-0 overflow-hidden"
        /*
         * ⚠️ LA CAJA DE RECORTE SE SALE 0,1em POR ARRIBA Y POR ABAJO, Y ESO NO
         * ES UN AJUSTE "A OJO": está medido. El titular va a 76px con
         * `line-height: 1.03`, o sea una caja de línea de 78px — pero las
         * letras de Cormorant a ese tamaño ocupan 92px de alto real. Recortar a
         * la caja de línea (`inset-0`) les cortaba la cabeza y los pies: se vio
         * en el render a 1440px, con "velas" partido por la mitad.
         *
         * (92 − 78) / 2 ≈ 7px ≈ 0,09em por lado; se redondea a 0,1em. Al ir en
         * `em`, vale igual a 44px en el teléfono que a 76 en el monitor.
         *
         * Las letras viajan un 115% de SU propio alto al entrar y salir, así
         * que siguen despejando la caja aunque ahora sea un poco más alta.
         */
        /*
         * `paddingTop` devuelve el contenido a su sitio: la caja empieza 0,1em
         * más arriba, así que sin este relleno las letras se pintarían 0,1em
         * por encima de la línea base de "Crea".
         */
        style={{ top: "-0.1em", bottom: "-0.1em", paddingTop: "0.1em" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={i} className="block whitespace-nowrap">
            {letras.map((letra, n) => (
              <motion.span
                key={`${i}-${n}`}
                className="inline-block"
                initial={{ y: "115%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-115%" }}
                transition={{
                  /* Entrar y salir no duran lo mismo: la que se va tiene que
                     despejar antes de que la nueva termine de llegar, o se
                     cruzan a media altura y se lee un borrón. */
                  y: { duration: 0.56, ease: ENTRADA },
                  delay: n * escalonado,
                }}
              >
                {letra}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
