"use client";

import { Search } from "lucide-react";
import { EyebrowLinea } from "@/components/home/EyebrowLinea";
import { useMemo, useState } from "react";
import type { ItemDirectorio } from "@/lib/bolsos-logica";

/**
 * El directorio de proveedores.
 *
 * El buscador filtra en el navegador y no en la base: son 33 productos y caben
 * de sobra en memoria. Una consulta por cada letra tecleada sería más lento y
 * más frágil que esto, y encima necesitaría un estado de carga.
 */
export function Directorio({
  categorias,
  items,
}: {
  categorias: { id: string; nombre: string }[];
  items: ItemDirectorio[];
}) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);

  const porCategoria = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const i of items) cuenta.set(i.categoria, (cuenta.get(i.categoria) ?? 0) + 1);
    return cuenta;
  }, [items]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return items.filter((i) => {
      if (categoria && i.categoria !== categoria) return false;
      if (!q) return true;
      return i.nombre.toLowerCase().includes(q) || i.categoria.toLowerCase().includes(q);
    });
  }, [items, busqueda, categoria]);

  return (
    <div className="w-full">
      {/*
        ⚠️ LA CABECERA VA EN UNA FRANJA ARENA A TODO EL ANCHO (app interna,
        2026-10-23), con el buscador dentro: buscar es lo primero que se hace
        aquí, y en la franja se ve como parte del título, no como un campo más.
      */}
      <header className="bg-sand border-line border-b px-4 py-6 lg:px-8 lg:py-10">
        <div className="mx-auto flex max-w-310 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="min-w-0">
            <EyebrowLinea>Directorio</EyebrowLinea>
            <h1 className="titulo-seccion mt-3 text-balance">
              Todo lo que necesitas, <em className="clave">en un clic</em>
            </h1>
            <p className="text-ink-body mt-3 max-w-2xl max-lg:hidden">
              Los mismos materiales que usamos en los cursos, con el enlace directo para comprarlos.
            </p>
          </div>

          <div className="relative w-full shrink-0 lg:w-110">
            <Search
              size={18}
              className="text-ink-muted pointer-events-none absolute top-1/2 left-5 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cuentas, hilo, cierres…"
              aria-label="Buscar en el directorio"
              className="bg-ivory border-line-strong text-espresso placeholder:text-ink-muted h-14 w-full rounded-full border pr-5 pl-13 outline-none focus-visible:border-(--gold)"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-310 px-4 py-6 lg:px-8 lg:py-8">
        <div
          role="group"
          aria-label="Filtrar por categoría"
          className="sin-barra -mx-4 flex gap-2.5 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
        >
          <Chip activo={categoria === null} onClick={() => setCategoria(null)} cuenta={items.length}>
            Todo
          </Chip>
          {categorias.map((c) => (
            <Chip
              key={c.id}
              activo={categoria === c.nombre}
              onClick={() => setCategoria(c.nombre)}
              cuenta={porCategoria.get(c.nombre) ?? 0}
            >
              {c.nombre}
            </Chip>
          ))}
        </div>

        {visibles.length === 0 ? (
          <p className="text-ink-muted mt-10 text-sm">
            No encontramos nada con «{busqueda}».{" "}
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                setCategoria(null);
              }}
              className="text-gold font-semibold underline"
            >
              Ver todo
            </button>
            .
          </p>
        ) : (
          /* Lista en móvil (fila con el botón a la derecha), cuatro columnas
             de tarjeta en escritorio. */
          <ul className="mt-6 grid gap-3 lg:grid-cols-4 lg:gap-4">
            {visibles.map((item) => (
              <li
                key={item.id}
                className="bg-ivory border-line flex items-center gap-4 rounded-lg border px-5 py-4 lg:flex-col lg:items-stretch lg:gap-0 lg:p-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">{item.categoria}</p>
                  <h3
                    className="font-display text-espresso mt-1.5"
                    style={{ fontWeight: 500, fontSize: 24, lineHeight: 1.15 }}
                  >
                    {item.nombre}
                  </h3>
                  <p className="text-ink-muted mt-1 text-sm">
                    Se usa en {item.bolsos} {item.bolsos === 1 ? "bolso" : "bolsos"}
                  </p>
                </div>

                {/*
                  ⚠️ SIN ENLACE, EL BOTÓN SE VE PERO NO MIENTE. Esconderlo dejaría
                  la tarjeta coja y sin explicar por qué; un botón activo que no
                  lleva a ningún sitio es peor. "Enlace pronto" con borde
                  punteado cuenta la verdad: el producto existe, el enlace llega
                  después.
                */}
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="sponsored noopener"
                    className="bg-cacao text-ivory flex h-11 shrink-0 items-center justify-center rounded-full px-5 text-sm font-semibold transition-transform active:scale-[0.98] lg:mt-5"
                  >
                    Comprar
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    className="border-line-strong text-ink-body flex h-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-dashed px-5 text-sm font-semibold lg:mt-5"
                  >
                    <span className="lg:hidden">Pronto</span>
                    <span className="max-lg:hidden">Enlace pronto</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="text-ink-muted mt-8 text-xs">
          Los precios y la disponibilidad dependen de AliExpress y pueden cambiar. Algunos enlaces
          son de afiliado: a ti no te cuesta más y nos ayuda a seguir haciendo cursos.
        </p>
      </div>
    </div>
  );
}

function Chip({
  children,
  activo,
  cuenta,
  onClick,
}: {
  children: React.ReactNode;
  activo: boolean;
  cuenta: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-5 text-base whitespace-nowrap transition-colors [touch-action:manipulation] ${
        activo
          ? "bg-espresso border-espresso text-cream font-semibold"
          : "border-line-strong text-espresso hover:bg-sand"
      }`}
    >
      {children}
      <span className="cifra">{cuenta}</span>
    </button>
  );
}
