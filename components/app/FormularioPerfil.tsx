"use client";

import { Check } from "lucide-react";
import { useActionState, useId, useState } from "react";
import { guardarPerfil } from "@/app/(interna)/app/acciones";

/**
 * "Cómo te llamamos" — su nombre y lo que el Ojo Experto debe recordar.
 *
 * ⚠️ LAS DOS CASILLAS VAN JUNTAS A PROPÓSITO. Son los dos únicos datos que la
 * app sabe de ella y que ella misma escribe; separarlas en dos tarjetas con dos
 * botones de guardar sería pedirle dos gestos para una sola idea ("cuéntanos de
 * ti"). Un botón, un guardado.
 *
 * El campo de notas NO es un diario: dice en su propia etiqueta para qué sirve,
 * porque una casilla de texto libre sin explicación en una app de manualidades
 * se llena de cualquier cosa y luego el Ojo responde a eso.
 *
 * ⚠️ EL INPUT ES PÍLDORA Y EL TEXTAREA NO, Y ES DELIBERADO (2ª vuelta tras el
 * revisor visual, que pedía unificarlos en 12px). La casilla de correo de
 * `FormularioAcceso` —el campo de texto más visto de la app— es
 * `h-14 rounded-full`: esa ES la forma de un campo de una línea aquí. Hacer
 * este distinto por coherencia interna de la tarjeta lo volvería incoherente
 * con la app entera. Un textarea de tres líneas en píldora, en cambio, no
 * existe en ninguna parte y se vería mal, así que ese va redondeado normal.
 */
const TOPE_NOTAS = 300;

export function FormularioPerfil({
  nombre,
  notas,
  /** Solo quien tiene plan usa el Ojo: a las demás, la casilla de notas no les sirve de nada. */
  conOjo,
}: {
  nombre: string | null;
  notas: string | null;
  conOjo: boolean;
}) {
  const idNombre = useId();
  const idNotas = useId();
  const [estado, enviar, enviando] = useActionState(guardarPerfil, null);
  /*
   * Sin tocar nada no hay nada que guardar: el botón arranca apagado y se
   * enciende al primer tecleo. Evita el guardado "por si acaso" que no cambia
   * ni una letra y devuelve un "Guardado." que no significa nada.
   */
  const [tocado, setTocado] = useState(false);
  /*
   * ⚠️ EL BOTÓN APAGADO TIENE QUE PARECER APAGADO (3ª vuelta del revisor). Con
   * `disabled:opacity-50` sobre un sólido grande a ancho completo, el lila
   * rebajado seguía leyéndose como un botón primario normal: se toca, no pasa
   * nada y nada lo explica. En reposo pasa a CONTORNO, que es una forma
   * distinta, no el mismo botón más pálido.
   */
  const puedeGuardar = tocado && !enviando;
  /* Cuántos caracteres lleva en las notas: el aviso solo aparece cerca del
     tope. Un contador siempre visible en una casilla de 300 es ruido; uno que
     aparece al 80% es un aviso justo antes de que el texto se corte solo. */
  const [largoNotas, setLargoNotas] = useState((notas ?? "").length);
  const cercaDelTope = largoNotas >= TOPE_NOTAS * 0.8;

  return (
    <form action={enviar} onInput={() => setTocado(true)} className="flex flex-col gap-5">
      <div>
        <label
          htmlFor={idNombre}
          className="text-ink-muted block text-sm font-medium"
        >
          Tu nombre
        </label>
        <input
          id={idNombre}
          name="nombre"
          type="text"
          maxLength={60}
          defaultValue={nombre ?? ""}
          autoComplete="given-name"
          placeholder="Elizabeth"
          /*
           * h-13 = 52px, como los campos y botones del resto de la app.
           *
           * ⚠️ `bg-cream` y NO `bg-ivory`: la tarjeta ya es marfil, así que un
           * campo marfil sobre tarjeta marfil deja todo en un solo plano con un
           * contorno de 1px (lo marcó el revisor: "la tarjeta es un rectángulo
           * plano"). El crema es el nivel HUNDIDO de los tres de la ficha, y es
           * el que hace que una casilla parezca una casilla.
           */
          className="bg-cream border-line-strong text-espresso placeholder:text-ink-muted focus-visible:border-(--gold) mt-1.5 h-13 w-full rounded-full border px-5 outline-none"
        />
        <p className="text-ink-muted mt-1.5 text-sm">Así te saludamos al entrar.</p>
      </div>

      {conOjo && (
        <div>
          <label
            htmlFor={idNotas}
            className="text-ink-muted block text-sm font-medium"
          >
            Qué debe recordar el Ojo Experto de tu tejido
          </label>
          <textarea
            id={idNotas}
            name="notas_tejido"
            rows={3}
            maxLength={TOPE_NOTAS}
            defaultValue={notas ?? ""}
            onChange={(e) => setLargoNotas(e.target.value.length)}
            placeholder="Soy zurda y me cuesta mantener la tensión en la base."
            /* ⚠️ `resize-none`: con `resize-y`, el agarre nativo del navegador
               asoma por fuera del borde redondeado y se ve como un defecto
               (lo cazó el revisor visual en el render). Tres líneas sobran
               para 300 caracteres. */
            className="bg-cream border-line-strong text-espresso placeholder:text-ink-muted focus-visible:border-(--gold) mt-1.5 w-full resize-none rounded-2xl border px-5 py-3.5 outline-none"
          />
          <div className="mt-1.5 flex items-start justify-between gap-3">
            <p className="text-ink-muted text-sm">
              Lo tiene en cuenta cada vez que le preguntas. Solo tu tejido — nada personal.
            </p>
            {cercaDelTope && (
              <p
                className="text-ink-muted motion-safe:animate-[aparecer_200ms_ease-out] shrink-0 text-sm tabular-nums"
                aria-live="polite"
              >
                {largoNotas}/{TOPE_NOTAS}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={!puedeGuardar}
          /* `bg-cacao text-ivory` es la acción primaria sólida de la app
             (Directorio, avisos). En arena se leía como apagado. */
          /* `transition-colors` además del tap: el salto de contorno a sólido
             al primer tecleo era instantáneo y se perdía (4ª vuelta). */
          className={`flex h-13 w-full items-center justify-center rounded-full font-semibold transition-[color,background-color,border-color,transform] duration-200 [touch-action:manipulation] motion-safe:active:scale-[0.98] sm:w-auto sm:px-8 ${
            puedeGuardar
              ? "bg-cacao text-ivory"
              : "border-line-strong text-ink-muted border bg-transparent"
          }`}
        >
          {enviando ? "Guardando…" : "Guardar"}
        </button>

        {/*
          Salida para quien se arrepiente (3ª vuelta del revisor): sin esto, con
          algo escrito solo se podía guardar o irse perdiéndolo sin aviso.
          `type="reset"` lo devuelve a los `defaultValue`, que son lo que hay en
          la base — no hace falta guardar los valores iniciales a mano.

          ⚠️ SIEMPRE OCUPA SU SITIO, aunque esté invisible (4ª vuelta): montarlo
          y desmontarlo empujaba el alto de la tarjeta de un salto al primer
          tecleo. Con `invisible` el hueco ya está reservado y nada se mueve.
          `aria-hidden` + `tabIndex -1` para que, apagado, no exista tampoco
          para el teclado ni para el lector de pantalla.

          Sin `px`: alineado al borde izquierdo del botón de arriba, que es con
          quien forma columna en el celular.
        */}
        {tocado && !enviando ? (
          <button
            type="reset"
            onClick={() => {
              setTocado(false);
              setLargoNotas((notas ?? "").length);
            }}
            className="text-ink-muted hover:text-espresso flex h-11 w-full items-center text-sm font-medium [touch-action:manipulation] sm:w-auto"
          >
            Descartar
          </button>
        ) : (
          /* ⚠️ EL BOTÓN APAGADO TIENE QUE DECIR POR QUÉ (4ª vuelta). Un botón
             que no responde y no se explica es el defecto, no el botón apagado.
             Ocupa el MISMO hueco que "Descartar", así que al teclear se cambia
             un texto por otro y la tarjeta no da un salto de alto. */
          <p className="text-ink-muted flex h-11 w-full items-center text-sm sm:w-auto">
            Cambia algo para guardar.
          </p>
        )}

        {/*
          `aria-live`: quien usa lector de pantalla no ve el check, así que el
          resultado se anuncia. Y el contenedor existe SIEMPRE (aunque vacío)
          porque un `aria-live` que aparece a la vez que su texto no se lee.
        */}
        <p
          aria-live="polite"
          /* `motion-safe:`: quien pidió menos movimiento ve el mensaje sin
             fundido, no se queda sin mensaje. */
          className={`motion-safe:animate-[aparecer_300ms_ease-out] flex items-center gap-1.5 text-sm ${
            estado?.ok ? "text-cacao" : "text-status-error"
          }`}
        >
          {estado?.ok && <Check size={16} aria-hidden="true" />}
          {estado?.mensaje ?? ""}
        </p>
      </div>
    </form>
  );
}
