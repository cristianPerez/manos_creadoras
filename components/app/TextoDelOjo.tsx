import { Fragment } from "react";

/**
 * Pinta la respuesta del Ojo Experto con el poco Markdown que de verdad usa:
 * negritas, listas numeradas y listas con viñetas.
 *
 * ⚠️ NO SE AÑADIÓ UNA LIBRERÍA DE MARKDOWN, Y ES DELIBERADO. Las de uso común
 * traen un intérprete completo y, con él, la tentación de `dangerouslySetInnerHTML`.
 * Aquí el texto lo escribe un modelo de lenguaje a partir de lo que teclea la
 * alumna: es exactamente la entrada que no debe poder inyectar HTML. Esto no
 * interpreta etiquetas — parte el texto y devuelve nodos de React, así que no
 * hay forma de que un `<script>` llegue al navegador.
 *
 * Si algún día hace falta más (tablas, enlaces), se amplía aquí. Hasta entonces,
 * esto cubre lo que el modelo escribe y nada más.
 */
export function TextoDelOjo({
  texto,
  variante = "app",
}: {
  texto: string;
  /**
   * "demo" es el mini Ojo del home (2026-10-22): todo en el mismo cuerpo de
   * 15/17px en espresso, sin veredicto en Cormorant — en una tarjeta pequeña,
   * una frase a 28px se comía media tarjeta.
   */
  variante?: "app" | "demo";
}) {
  const bloques = agrupar(texto);
  const demo = variante === "demo";
  const cuerpo = demo ? "demo-ojo-texto" : "ojo-cuerpo";
  /* Espresso en los dos Ojo (2026-10-22, unificados): el gris de la app se
     leía apagado al lado del home. */
  const color = "text-espresso";

  return (
    <div className="flex flex-col gap-3">
      {bloques.map((bloque, i) => {
        if (bloque.tipo === "ol") {
          /*
            ⚠️ EL NÚMERO VA EN UN CUADRITO, NO EN EL `list-decimal` DEL
            NAVEGADOR (rediseño v4, 2026-10-20). El marcador por defecto se
            pinta con el color y el tamaño del texto, así que un paso se leía
            igual que el párrafo de al lado. Con el número en arena el ojo salta
            de número en número.
          */
          return (
            <ol key={i} className={`${cuerpo} flex flex-col gap-2`}>
              {bloque.lineas.map((l, j) => (
                <li key={j} className={`${color} flex gap-3`}>
                  <span
                    aria-hidden="true"
                    className="bg-sand text-espresso cifra mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  >
                    {j + 1}
                  </span>
                  <span className="min-w-0">
                    <Negritas texto={l} />
                  </span>
                </li>
              ))}
            </ol>
          );
        }
        if (bloque.tipo === "ul") {
          return (
            <ul key={i} className={`${cuerpo} flex list-disc flex-col gap-2 pl-5`}>
              {bloque.lineas.map((l, j) => (
                <li key={j} className={color}>
                  <Negritas texto={l} />
                </li>
              ))}
            </ul>
          );
        }

        const parrafo = bloque.lineas.join(" ");

        /*
          ⚠️ EL VEREDICTO (Ojo v5, 2026-10-21). La referencia abre cada respuesta
          con una frase grande en Cormorant: "Vas bien. La base está pareja…".
          El texto del modelo no marca cuál es el veredicto, así que se toma el
          PRIMER párrafo, y solo si es corto: un primer párrafo de cinco líneas
          a 28px sería un muro. Más largo, va como cualquier otro.
        */
        if (!demo && i === 0 && parrafo.length <= VEREDICTO_MAXIMO) {
          return (
            <p
              key={i}
              className="font-display text-espresso ojo-veredicto text-pretty"
              style={{ fontWeight: 500 }}
            >
              <Negritas texto={parrafo} />
            </p>
          );
        }

        /*
          Un párrafo que abre con una etiqueta en negrita ("**Prueba:** suelta
          un poco el hilo…") es una acción, no una explicación: va en su caja,
          con la etiqueta en dorado. Es solo cómo se ve el párrafo; el texto se
          parte igual que antes.
        */
        const accion = parrafo.match(ACCION);
        if (accion && !demo) {
          return (
            <div
              key={i}
              className="bg-ivory border-line ojo-cuerpo flex flex-col gap-1 rounded-(--radius-bloque) border px-5 py-4 sm:flex-row sm:gap-3"
            >
              <span className="text-gold shrink-0 font-semibold">{accion[1]}</span>
              <span className="text-espresso min-w-0">
                <Negritas texto={accion[2]} />
              </span>
            </div>
          );
        }

        return (
          <p key={i} className={`${color} ${cuerpo}`}>
            <Negritas texto={parrafo} />
          </p>
        );
      })}
    </div>
  );
}

/** Hasta cuántos caracteres el primer párrafo se lee como veredicto (unas 2 líneas). */
const VEREDICTO_MAXIMO = 140;

/** `**Prueba:** resto` o `**Prueba**: resto`. Los dos puntos son obligatorios: sin ellos, una frase en negrita ("**Vas bien.** …") se confundiría con una etiqueta. */
const ACCION = /^\*\*([^*:.]{2,24}?)(?::\*\*|\*\*:)\s+(.+)$/;

type Bloque = { tipo: "p" | "ol" | "ul"; lineas: string[] };

function agrupar(texto: string): Bloque[] {
  const bloques: Bloque[] = [];

  for (const linea of texto.split("\n")) {
    const limpia = linea.trim();
    if (!limpia) continue;

    const numerada = limpia.match(/^\d+[.)]\s+(.*)$/);
    const viñeta = limpia.match(/^[-*·]\s+(.*)$/);
    const tipo: Bloque["tipo"] = numerada ? "ol" : viñeta ? "ul" : "p";
    const contenido = numerada?.[1] ?? viñeta?.[1] ?? limpia;

    const ultimo = bloques.at(-1);
    // Los párrafos sueltos NO se juntan entre sí: cada salto de línea del modelo
    // es una pausa que puso a propósito.
    if (ultimo && ultimo.tipo === tipo && tipo !== "p") {
      ultimo.lineas.push(contenido);
    } else {
      bloques.push({ tipo, lineas: [contenido] });
    }
  }

  return bloques;
}

/** `**así**` → <strong>. Lo único que el modelo usa para destacar. */
function Negritas({ texto }: { texto: string }) {
  const trozos = texto.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {trozos.map((t, i) =>
        t.startsWith("**") && t.endsWith("**") ? (
          <strong key={i} className="text-espresso font-semibold">
            {t.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{t}</Fragment>
        ),
      )}
    </>
  );
}
