"use client";

import { ImagenDeCapsula, useCapsulas } from "@/components/home/Capsulas";
import { EntradaB, PiezaB } from "@/components/home-b/EntradaB";
import { fotoTopo } from "@/lib/fotos-topo";

/**
 * "Empieza desde cero" — las cápsulas gratis del home B v2 (2026-11-05).
 *
 * ⚠️ BAJARON DE ARRIBA. En la B anterior abrían la página en el teléfono, como
 * las historias de Instagram, y el revisor lo marcó: pesaban más que el héroe y
 * empujaban el titular y el botón fuera de la primera pantalla. Aquí van
 * después de la comunidad, que es cuando quien duda "¿y yo podré?" busca por
 * dónde empezar.
 *
 * ⚠️ SIN MARCO DE COLOR. El marco frambuesa era lo que las hacía leerse como
 * "historias"; abajo en la página ya no compiten por el primer toque, y el
 * color de apoyo queda para las palabras en cursiva. Una cápsula ya vista se
 * apaga un poco (la misma pista de siempre, sin marco).
 *
 * MISMO VISOR Y MISMO REGISTRO DE VISTAS QUE EL CONTROL (`useCapsulas()`).
 *
 * Nivel HUNDIDO: es un bloque que se lee aparte, como el de los dolores.
 */
export function CapsulasB() {
  const { capsulas, vistas, abrir } = useCapsulas();
  if (capsulas.length === 0) return null;

  return (
    <section id="capsulas" data-seccion="capsulas" aria-label="Cápsulas gratis" className="hundido-b">
      {/* Las cinco miniaturas entran de izquierda a derecha, en su turno: es
          lo que invita a recorrer la fila (y en el teléfono, a deslizarla). */}
      <EntradaB className="py-9 lg:contenedor-b lg:flex lg:items-center lg:gap-14 lg:py-14" escalonado={0.07}>
        <div className="contenedor-b lg:flex-1 lg:px-0">
          <h2 className="font-display text-espresso text-[30px] leading-[1.08] font-medium lg:text-[40px] lg:leading-[1.06]">
            Empieza <em className="clave">desde cero</em>
          </h2>
          <p className="text-ink-body mt-1.5 text-[14.5px] lg:mt-2 lg:text-base">
            {capsulas.length} cápsulas con las técnicas base · gratis, sin cuenta
          </p>
        </div>

        {/* Móvil: fila con scroll lateral de miniaturas 64×84. Escritorio:
            rejilla de 5 en 3:4. `sin-barra` corta el "doble scroll". */}
        <ul className="sin-barra flex gap-2.5 overflow-x-auto px-4 pt-4 pb-0.5 md:px-(--aire-b) lg:grid lg:flex-[2] lg:grid-cols-5 lg:gap-3 lg:overflow-visible lg:p-0">
          {capsulas.map((c, i) => {
            const vista = vistas.includes(c.id);
            return (
              <PiezaB como="li" key={c.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => abrir(i)}
                  aria-label={`Ver cápsula ${i + 1}: ${c.titulo}`}
                  className="flex w-16 cursor-pointer flex-col items-start gap-1.5 text-left [touch-action:manipulation] lg:w-full lg:gap-2"
                >
                  <span className="rounded-foto-b bg-line relative block h-21 w-16 overflow-hidden lg:aspect-3/4 lg:h-auto lg:w-full">
                    <ImagenDeCapsula
                      miniatura={c.miniaturaUrl}
                      /* La versión topo: con el fondo café, estas fotos se
                         ven "durazno" sobre el lavanda. Ver `lib/fotos-topo`. */
                      respaldo={fotoTopo(c.portadaUrl)}
                      sizes="(min-width: 1024px) 160px, 64px"
                      className={`object-cover ${vista ? "opacity-70" : ""}`}
                    />
                  </span>
                  <span className="text-espresso text-nota whitespace-nowrap lg:text-sm">
                    {i + 1}. {c.etiquetaCorta}
                  </span>
                </button>
              </PiezaB>
            );
          })}
        </ul>
      </EntradaB>
    </section>
  );
}
