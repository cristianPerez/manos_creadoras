"use client";

import { Check } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { marcarMaterial } from "@/app/(interna)/app/acciones";
import type { Material } from "@/lib/bolsos-logica";

/**
 * "Lo que necesitas": la lista de materiales de un bolso y sus medidas.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ UN SOLO COMPONENTE PARA LOS DOS SITIOS (2026-10-23)
 * ════════════════════════════════════════════════════════════════════════════
 * `completa` va en la página, en el paso de Materiales; `panel` va dentro del
 * cajón (escritorio) o la hoja (móvil) que se abre desde los demás pasos.
 * `design-ref/app-interna-claude-code/PROMPT-ficha-materiales-por-paso.md`.
 * Un solo sitio parte "nombre: cantidad", así las dos vistas no pueden decir
 * cosas distintas del mismo material.
 *
 * ⚠️ MARCAR "YA LO TENGO" SIGUE FUNCIONANDO, aunque la referencia no dibuje
 * casilla. Se guarda en la base (la alumna marca en el teléfono mientras
 * compra y teje mirando el portátil). Ahora toda la fila es el interruptor:
 * marcada, el nombre se tacha y aparece un check pequeño.
 */
export function MaterialesDelBolso({
  materiales,
  medidas,
  variante,
}: {
  materiales: Material[];
  /** `[clave, valor]` en cm, ya ordenadas (`medidasOrdenadas`). */
  medidas: [string, number][];
  variante: "completa" | "panel";
}) {
  const [, empezar] = useTransition();
  /*
   * `useOptimistic`: la fila se marca al instante y la base se entera después.
   * Marcar materiales es un gesto rápido y repetido, y esperar al servidor en
   * cada uno haría que pareciera que la app no responde.
   */
  const [vista, marcarOptimista] = useOptimistic(
    materiales,
    (actual: Material[], cambio: { id: string; tengo: boolean }) =>
      actual.map((m) => (m.id === cambio.id ? { ...m, tengo: cambio.tengo } : m)),
  );
  const listos = vista.filter((m) => m.tengo).length;
  const completa = variante === "completa";

  const lista = (
    <ul className={`grid ${completa ? "gap-x-12 lg:grid-cols-2" : ""}`}>
      {vista.map((m) => {
        const { nombre, cantidad, opcional } = partir(m.texto);
        /* Solo si hay enlace de verdad: un "Comprar" que no lleva a ningún
           sitio gasta la confianza justo antes de gastar dinero. */
        const compra = m.compras.find((c) => c.url);
        return (
          <li key={m.id} className="border-line flex items-center gap-3 border-b">
            <button
              type="button"
              role="checkbox"
              aria-checked={m.tengo}
              aria-label={`${m.tengo ? "Ya tengo" : "Marcar que ya tengo"}: ${m.texto}`}
              onClick={() =>
                empezar(async () => {
                  marcarOptimista({ id: m.id, tengo: !m.tengo });
                  await marcarMaterial(m.id, !m.tengo);
                })
              }
              className="flex min-h-14 min-w-0 flex-1 items-center gap-3 text-left [touch-action:manipulation]"
            >
              {m.tengo && <Check size={15} strokeWidth={3} className="text-gold shrink-0" aria-hidden="true" />}
              <span
                className={`min-w-0 truncate text-base ${
                  m.tengo ? "text-ink-muted line-through" : "text-espresso"
                }`}
              >
                {nombre}
              </span>
              {opcional && (
                <span className="bg-sand text-ink-body shrink-0 rounded-full px-2.5 py-0.5 text-xs">
                  opcional
                </span>
              )}
              <span className="text-ink-muted cifra ml-auto max-w-[45%] shrink-0 truncate pl-2 text-right text-base">
                {cantidad}
              </span>
            </button>
            {compra && (
              <a
                href={compra.url ?? undefined}
                target="_blank"
                /* `sponsored`: son enlaces de afiliado y decirlo es lo correcto.
                   `noopener` evita que la pestaña nueva toque la nuestra. */
                rel="sponsored noopener"
                className="text-gold shrink-0 text-sm font-semibold underline underline-offset-2"
              >
                Comprar
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );

  const franjaMedidas = medidas.length > 0 && (
    <div
      className={`bg-sand ${
        completa
          ? "px-6 py-5 lg:flex lg:items-center lg:gap-10 lg:px-8"
          : "px-4.5 py-5"
      }`}
    >
      <p className="eyebrow">Medidas</p>
      <dl
        className={`mt-3 grid grid-cols-2 gap-x-6 gap-y-2 ${
          completa ? "lg:mt-0 lg:flex lg:flex-wrap lg:gap-x-10" : ""
        }`}
      >
        {medidas.map(([clave, valor]) => (
          <div key={clave} className="flex items-baseline gap-1.5 whitespace-nowrap">
            <dd className="text-espresso cifra text-lg font-semibold">
              {String(valor).replace(".", ",")}
            </dd>
            <dt className="text-ink-body text-base">cm {ETIQUETA_MEDIDA[clave] ?? `de ${clave.replace(/_/g, " ")}`}</dt>
          </div>
        ))}
      </dl>
    </div>
  );

  const resumen = listos > 0 ? `${listos} de ${vista.length} listos` : `${vista.length} materiales`;

  if (!completa) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <p className="text-ink-muted cifra px-4.5 text-sm lg:px-6">{resumen}</p>
        <div className="min-h-0 flex-1 overflow-y-auto px-4.5 lg:px-6">{lista}</div>
        {franjaMedidas}
      </div>
    );
  }

  return (
    <section
      aria-labelledby="lo-que-necesitas"
      className="bg-ivory border-line overflow-hidden rounded-(--radius-foto) border"
    >
      <div className="px-6 pt-6 pb-2 lg:px-8 lg:pt-7">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="lo-que-necesitas"
            className="font-display text-espresso"
            style={{ fontWeight: 500, fontSize: 30, lineHeight: 1.1 }}
          >
            Lo que <em className="clave">necesitas</em>
          </h2>
          <p className="text-ink-muted cifra shrink-0 text-sm">{resumen}</p>
        </div>
        <div className="mt-2">{lista}</div>
      </div>
      {franjaMedidas}
    </section>
  );
}

/** Cómo se lee cada medida: "19 cm de largo", "26 cm con asa". */
const ETIQUETA_MEDIDA: Record<string, string> = {
  largo: "de largo",
  alto: "de alto",
  alto_con_asa: "con asa",
  ancho: "de ancho",
  diametro: "de diámetro",
};

/**
 * "Perlas de 10 mm: 500 gramos" → nombre "Perlas de 10 mm", cantidad "500 g".
 * "2 mosquetones" → "Mosquetones", "2". Sin cantidad → "—".
 *
 * El texto viene escrito a mano en las fichas, así que se parte con reglas
 * simples y, si no encaja ninguna, se deja el texto entero como nombre: es
 * preferible un renglón sin cantidad que una cantidad inventada.
 */
export function partir(texto: string): { nombre: string; cantidad: string; opcional: boolean } {
  const opcional = /\(opcional(es)?\)/i.test(texto);
  const limpio = texto.replace(/\s*\(opcional(es)?\)/gi, "").trim();

  const dosPuntos = limpio.indexOf(": ");
  if (dosPuntos > 0) {
    return {
      nombre: limpio.slice(0, dosPuntos).trim(),
      cantidad: abreviar(limpio.slice(dosPuntos + 2).trim()),
      opcional,
    };
  }

  const conNumero = limpio.match(/^(\d[\d.,]*)\s+(.+)$/);
  if (conNumero) {
    const resto = conNumero[2];
    return {
      nombre: resto.charAt(0).toUpperCase() + resto.slice(1),
      cantidad: conNumero[1],
      opcional,
    };
  }

  return { nombre: limpio, cantidad: "—", opcional };
}

function abreviar(cantidad: string): string {
  return cantidad
    .replace(/^aproximadamente\s+/i, "≈ ")
    .replace(/\s+gramos$/i, " g")
    .replace(/\s+metros$/i, " m")
    .replace(/^(≈ )?([\d.,]+)\s+(unidades|unidad|piezas)$/i, "$1$2");
}
