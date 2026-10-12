"use client";

import { ExternalLink, Search } from "lucide-react";
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
    <>
      <div className="relative mt-8">
        <Search
          size={18}
          className="text-ink-muted pointer-events-none absolute top-1/2 left-5 -translate-y-1/2"
          aria-hidden="true"
        />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Busca cuentas, hilo, cierres…"
          aria-label="Buscar en el directorio"
          className="bg-ivory border-line text-espresso placeholder:text-ink-muted h-14 w-full rounded-full border pr-5 pl-13 outline-none focus-visible:border-(--gold)"
        />
      </div>

      <div role="group" aria-label="Filtrar por categoría" className="mt-5 flex flex-wrap gap-2.5">
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
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((item) => (
            <li
              key={item.id}
              className="bg-ivory border-line flex flex-col rounded-[var(--radius-lg)] border p-5"
            >
              <p className="eyebrow">{item.categoria}</p>
              <h3 className="text-espresso mt-2 font-semibold">{item.nombre}</h3>
              <p className="text-ink-muted mt-1 text-sm">
                Se usa en {item.bolsos} {item.bolsos === 1 ? "bolso" : "bolsos"}
              </p>

              {/*
                ⚠️ SIN ENLACE, EL BOTÓN SE VE PERO NO MIENTE. Los 33 productos
                tienen la URL vacía todavía. Esconder el botón dejaría la tarjeta
                coja y sin explicar por qué; un botón activo que no lleva a
                ningún sitio es peor. Deshabilitado y diciendo "Enlace pronto"
                cuenta la verdad: el producto existe, el enlace llega después.
              */}
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="sponsored noopener"
                  className="border-espresso text-espresso mt-4 flex h-11 items-center justify-center gap-2 rounded-full border text-sm font-semibold"
                >
                  Ver en AliExpress
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className="border-line text-ink-muted mt-4 flex h-11 cursor-not-allowed items-center justify-center rounded-full border text-sm font-semibold"
                >
                  Enlace pronto
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-ink-muted mt-8 text-xs">
        Los precios y la disponibilidad dependen de AliExpress y pueden cambiar. Algunos enlaces son
        de afiliado: a ti no te cuesta más y nos ayuda a seguir haciendo cursos.
      </p>
    </>
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
      className={`flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors [touch-action:manipulation] ${
        activo ? "bg-espresso text-white" : "border-line text-ink-body border"
      }`}
    >
      {children}
      <span className={activo ? "text-white/60" : "text-ink-muted"}>{cuenta}</span>
    </button>
  );
}
