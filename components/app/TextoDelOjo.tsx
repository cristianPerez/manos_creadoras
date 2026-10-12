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
          return (
            <ol key={i} className="flex list-decimal flex-col gap-2 pl-5">
              {bloque.lineas.map((l, j) => (
                <li key={j} className="text-ink-body">
                  <Negritas texto={l} />
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
