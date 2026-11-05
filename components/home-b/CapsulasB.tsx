"use client";

import { ImagenDeCapsula, useCapsulas } from "@/components/home/Capsulas";
import { fotoTopo } from "@/lib/fotos-topo";

/**
 * Las cápsulas gratis, en la paleta B.
 *
 * ⚠️ MISMO VISOR, MISMO REGISTRO DE VISTAS QUE EL HOME DE SIEMPRE: lo único
 * distinto es cómo se dibuja la lista. El estado sale de `useCapsulas()`, así
 * que lo que se vea aquí queda marcado también para la otra rama — importa
 * porque una misma persona puede pasar de una a otra con `?paleta=`.
 *
 * ⚠️ EL MARCO ES FRAMBUESA (`--apoyo`) Y NO MORADO. El morado de la B es el
 * color de la acción y vive en el botón del héroe, que está justo debajo: dos
 * moradosen la misma pantalla y el ojo deja de saber dónde tocar. El marco de
 * 2px es lo que hace que estas tarjetas se lean como "historias" y se toquen.
 *
 * En móvil, fila con scroll lateral de tarjetas 70×92 (el gesto de Instagram,
 * que no hay que explicar). Desde 1024px, rejilla de 5 en 3:4 con su titular,
 * porque ahí el scroll lateral con ratón es un patrón que casi nadie descubre.
 */
export function CapsulasB() {
  const { capsulas, vistas, abrir } = useCapsulas();
  if (capsulas.length === 0) return null;

  return (
    <section id="capsulas" aria-label="Cápsulas gratis" className="pt-4 pb-5 lg:pt-0 lg:pb-20">
      {/* ── Móvil y tableta: la fila con scroll ──────────────────────── */}
      <div className="lg:hidden">
        <div className="contenedor-b flex items-baseline justify-between gap-4">
          <h2 className="eyebrow-b-centrado eyebrow-b">Cápsulas gratis</h2>
          <span className="text-ink-body text-nota">
            {vistas.length} de {capsulas.length} · sin cuenta
          </span>
        </div>

        {/* `sin-barra` corta el "doble scroll": el gesto horizontal se queda
            en la fila y no se lo pasa a la página (ver globals.css). */}
        <ul className="sin-barra flex gap-2.5 overflow-x-auto px-4 pt-3 pb-0.5 md:px-(--aire-b)">
          {capsulas.map((c, i) => {
            const vista = vistas.includes(c.id);
            return (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => abrir(i)}
                  aria-label={`Ver cápsula ${i + 1}: ${c.titulo}`}
                  className="flex flex-col items-center gap-2 [touch-action:manipulation]"
                >
                  <span
                    /* El marco se apaga cuando ya la vio: es la misma pista
                       que usan las historias, y se entiende sin leer nada. */
                    className={`rounded-dentro-b block border-2 p-(--grosor-marco) transition-colors ${
                      vista ? "border-line-strong" : "border-apoyo"
                    }`}
                  >
                    <span className="rounded-chip-b bg-sand relative block h-23 w-17.5 overflow-hidden">
                      <ImagenDeCapsula
                        miniatura={c.miniaturaUrl}
                        /* La versión topo: con el fondo café, estas fotos se
                           ven "durazno" sobre el lavanda. Ver `lib/fotos-topo`. */
                        respaldo={fotoTopo(c.portadaUrl)}
                        sizes="70px"
                        className={`object-cover ${vista ? "opacity-70" : ""}`}
                      />
                    </span>
                  </span>
                  <span className="text-espresso text-nota font-semibold">{c.etiquetaCorta}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Escritorio: la rejilla de 5 ──────────────────────────────── */}
      <div className="contenedor-b max-lg:hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 gap-x-6">
          <h2 className="titulo-seccion-b">
            Cápsulas <em className="clave">gratis</em>
          </h2>
          <span className="text-ink-body text-base">
            {capsulas.length} técnicas base · sin crear cuenta
          </span>
        </div>

        <ul className="mt-6 grid grid-cols-5 gap-4">
          {capsulas.map((c, i) => {
            const vista = vistas.includes(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => abrir(i)}
                  aria-label={`Ver cápsula ${i + 1}: ${c.titulo}`}
                  className="block w-full text-left"
                >
                  <span className="rounded-foto-b bg-sand relative block aspect-3/4 overflow-hidden">
                    <ImagenDeCapsula
                      miniatura={c.miniaturaUrl}
                      respaldo={fotoTopo(c.portadaUrl)}
                      sizes="(min-width: 1024px) 220px, 50vw"
                      className={`object-cover ${vista ? "opacity-70" : ""}`}
                    />
                  </span>
                  <span className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="text-espresso text-base font-semibold">{c.etiquetaCorta}</span>
                    <span className="text-ink-body cifra text-nota">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
