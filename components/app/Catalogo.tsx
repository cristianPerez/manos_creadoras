"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { TarjetaBolso } from "@/components/app/TarjetaBolso";
import { PRECIO_DESDE } from "@/lib/planes";
import { estadoDe, siguienteVideo, type Bolso } from "@/lib/bolsos-logica";

type Filtro = "todos" | "en-curso" | "terminados";

/**
 * La rejilla de bolsos con sus filtros.
 *
 * Es de cliente solo por los filtros. Todo lo demás —los datos, el avance, qué
 * está bloqueado— se calcula en el servidor y llega resuelto: así la primera
 * pintada ya trae todos los bolsos y no hay un parpadeo de carga.
 */
export function Catalogo({
  bolsos,
  continuar,
  tieneAcceso,
  invitada = false,
}: {
  bolsos: Bolso[];
  continuar: Bolso | null;
  tieneAcceso: boolean;
  /** Quien mira no ha entrado: se le enseña la oferta junto al catálogo. */
  invitada?: boolean;
}) {
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const cuenta = {
    todos: bolsos.length,
    "en-curso": bolsos.filter((b) => estadoDe(b) === "en-curso").length,
    terminados: bolsos.filter((b) => estadoDe(b) === "terminado").length,
  };

  const visibles = bolsos.filter((b) => {
    if (filtro === "en-curso") return estadoDe(b) === "en-curso";
    if (filtro === "terminados") return estadoDe(b) === "terminado";
    return true;
  });

  return (
    <>
      {continuar && <ContinuaDondeQuedaste bolso={continuar} />}
      {invitada && <Invitacion bolsos={bolsos} />}

      <div
        role="group"
        aria-label="Filtrar bolsos"
        className="mt-10 flex flex-wrap gap-2.5"
      >
        {(
          [
            ["todos", "Todos"],
            ["en-curso", "En curso"],
            ["terminados", "Terminados"],
          ] as const
        ).map(([id, texto]) => {
          const activo = filtro === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={activo}
              onClick={() => setFiltro(id)}
              className={`flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors [touch-action:manipulation] ${
                activo ? "bg-espresso text-white" : "border-line text-ink-body border"
              }`}
            >
              {texto}
              <span className={activo ? "text-white/60" : "text-ink-muted"}>{cuenta[id]}</span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        /*
          Un filtro sin resultados NO es un error, así que no se pinta como tal:
          se dice qué pasa y se ofrece la salida, que es volver a "Todos".
        */
        <p className="text-ink-muted mt-10 text-sm">
          Todavía no tienes bolsos aquí.{" "}
          <button
            type="button"
            onClick={() => setFiltro("todos")}
            className="text-gold font-semibold underline"
          >
            {/* El total sale de los datos: escrito a mano se queda viejo
                en cuanto entra un bolso nuevo. */}
            Ver los {bolsos.length}
          </button>
          .
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] lg:gap-x-5">
          {visibles.map((b) => (
            <li key={b.id}>
              <TarjetaBolso bolso={b} bloqueado={!b.gratis && !tieneAcceso} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/**
 * La oferta, para quien todavía no ha entrado.
 *
 * Va DENTRO del catálogo y no en una pantalla aparte: quien llega quiere ver
 * los bolsos, y lo que la convence de pagar es tenerlos delante. Un muro antes
 * de enseñar nada solo consigue que se vaya.
 */
function Invitacion({ bolsos }: { bolsos: Bolso[] }) {
  const gratis = bolsos.find((b) => b.gratis);

  return (
    <section
      className="mt-8 flex flex-col gap-6 rounded-[var(--radius-xl)] p-7 text-white md:flex-row md:items-center md:p-8"
      style={{ backgroundImage: "var(--card-destacada)" }}
    >
      <div className="flex-1">
        <h2 className="font-display text-2xl text-balance" style={{ fontWeight: 500 }}>
          ¿Y si sigues hasta el bolso terminado?
        </h2>
        <p className="mt-2 max-w-lg text-sm text-white/75">
          {gratis ? `${gratis.nombre} es tuyo ahora mismo. ` : ""}
          Con un plan se abren los {bolsos.length}, uno nuevo cada mes, el directorio de
          proveedores y el Ojo Experto.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
            Garantía de 7 días
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
            {/* La valoración salió el 2026-10-17: no hay reseñas que la
                respalden. Las alumnas sí son un dato real. */}
            +1.200 alumnas
          </span>
        </div>
      </div>

      <div className="shrink-0">
        {/* Quien mira esto no tiene cuenta: lo siguiente es crearla, no pagar. */}
        <Link
          href="/entrar"
          className="text-espresso flex h-14 items-center justify-center rounded-full px-7 font-semibold"
          style={{ backgroundImage: "var(--boton-dorado)" }}
        >
          Crear mi cuenta gratis
        </Link>
        <p className="mt-2 text-center text-xs text-white/60">Desde {PRECIO_DESDE} al mes</p>
      </div>
    </section>
  );
}

/**
 * La tarjeta de retomar.
 *
 * Es la pieza más importante de la pantalla: quien vuelve no quiere elegir,
 * quiere seguir. Por eso va antes que los filtros y ocupa el ancho entero.
 */
function ContinuaDondeQuedaste({ bolso }: { bolso: Bolso }) {
  const siguiente = siguienteVideo(bolso);
  if (!siguiente) return null;

  return (
    <Link
      href={`/app/bolsos/${bolso.slug}/${siguiente.orden}`}
      className="bg-sand mt-8 grid overflow-hidden rounded-[var(--radius-lg)] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
    >
      {/* Mismo hueco negro que tenía la ficha: aquí también va la foto, con el
          botón de play encima para que se lea como "sigue viendo". */}
      <div className="bg-espresso relative flex aspect-[16/10] items-center justify-center sm:aspect-auto">
        {bolso.portadaUrl && (
          <Image
            src={bolso.portadaUrl}
            alt=""
            fill
            sizes="(min-width: 640px) 320px, 100vw"
            className="object-cover opacity-70"
          />
        )}
        <span
          aria-hidden="true"
          className="bg-ivory/90 text-espresso relative flex size-14 items-center justify-center rounded-full"
        >
          <Play size={20} fill="currentColor" />
        </span>
      </div>

      <div className="p-6 md:p-8">
        <p className="eyebrow">Continúa donde quedaste</p>
        <h2 className="font-display text-espresso mt-2 text-2xl" style={{ fontWeight: 500 }}>
          {bolso.nombre}
        </h2>
        <p className="text-ink-body mt-1 text-sm">{siguiente.etiqueta}</p>

        <div className="mt-5 flex items-center gap-4">
          <span className="bg-line h-1.5 flex-1 overflow-hidden rounded-full">
            <span
              className="bg-gold block h-full rounded-full"
              style={{ width: `${Math.round((bolso.vistos / bolso.videos) * 100)}%` }}
            />
          </span>
          <span className="text-ink-muted shrink-0 text-sm">
            {bolso.vistos} de {bolso.videos} videos
          </span>
        </div>
      </div>
    </Link>
  );
}
