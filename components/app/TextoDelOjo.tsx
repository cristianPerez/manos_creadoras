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
export function TextoDelOjo({ texto }: { texto: string }) {
  const bloques = agrupar(texto);

  return (
    <div className="flex flex-col gap-3">
      {bloques.map((bloque, i) => {
        if (bloque.tipo === "ol") {
          /*
            ⚠️ EL NÚMERO VA EN UN CUADRITO, NO EN EL `list-decimal` DEL
            NAVEGADOR (rediseño v4, 2026-10-20).

            El marcador por defecto se pinta con el color y el tamaño del
            texto, así que un paso se leía igual que el párrafo de al lado: la
            alumna que busca "el paso 2" tenía que leerlo todo. Con el cuadrito
            dorado el ojo salta de número en número.

            ⚠️ Y ES CUADRADO, NO REDONDO: en v4 no hay círculos en el Ojo
            —solo los íconos SVG—, porque la redondez era parte de lo que hacía
            que la pantalla pareciera un juguete y no una herramienta.
          */
          return (
            <ol key={i} className="flex flex-col gap-2">
              {bloque.lineas.map((l, j) => (
                <li key={j} className="text-ink-body flex gap-3">
                  <span
                    aria-hidden="true"
                    /* `--radius-sm` son 8px: dentro del 6-8 que pide v4 para
                       tiles y chips, y es token del sistema, no un número
                       suelto. */
                    className="bg-gold-pale text-espresso mt-1 flex size-6 shrink-0 items-center justify-center rounded-(--radius-sm) text-xs"
                    style={{ fontWeight: 800 }}
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
            <ul key={i} className="flex list-disc flex-col gap-2 pl-5">
              {bloque.lineas.map((l, j) => (
                <li key={j} className="text-ink-body">
                  <Negritas texto={l} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-ink-body">
            <Negritas texto={bloque.lineas.join(" ")} />
          </p>
        );
      })}
    </div>
  );
}

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
