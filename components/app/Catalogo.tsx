"use client";

import { ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PagoConPlan } from "@/components/app/PagoConPlan";
import { TarjetaBolso } from "@/components/app/TarjetaBolso";
import { esLlavero, estadoDe, siguienteVideo, type Bolso } from "@/lib/bolsos-logica";
import type { Frecuencia } from "@/lib/planes";

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
  desde,
  enlaces,
}: {
  bolsos: Bolso[];
  continuar: Bolso | null;
  tieneAcceso: boolean;
  /** Quien mira no ha entrado: se le enseña la oferta junto al catálogo. */
  invitada?: boolean;
  /** Los enlaces de pago de su país (`lib/checkout.ts`); `null` si ese ciclo no tiene. */
  enlaces: Record<Frecuencia, string | null>;
  /*
   * "US$6,67" ya formateado. Llega hecho desde el servidor porque el precio
   * depende de si esta persona sigue dentro de sus 24h de oferta, y eso solo
   * se sabe leyendo una cookie — que aquí, en el navegador, ya no se mira.
   */
  desde: string;
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
      {invitada && <Invitacion bolsos={bolsos} desde={desde} enlaces={enlaces} />}

      <div
        role="group"
        aria-label="Filtrar bolsos"
        className="sin-barra -mx-4 mt-6 flex gap-2.5 overflow-x-auto px-4 lg:mx-0 lg:mt-8 lg:flex-wrap lg:px-0"
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
              className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-5 text-base whitespace-nowrap transition-colors [touch-action:manipulation] ${
                activo
                  ? "bg-espresso border-espresso text-cream font-semibold"
                  : "border-line-strong text-espresso hover:bg-sand"
              }`}
            >
              {texto}
              <span className="cifra">{cuenta[id]}</span>
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
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-5 lg:gap-x-4 lg:gap-y-8">
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
function Invitacion({
  bolsos,
  enlaces,
  desde,
}: {
  bolsos: Bolso[];
  desde: string;
  enlaces: Record<Frecuencia, string | null>;
}) {
  const gratis = bolsos.find((b) => b.gratis);
  const llaveros = bolsos.filter(esLlavero).length;
  const deBolso = bolsos.length - llaveros;

  return (
    <>
      {/*
        ⚠️ CAFÉ PLANO (app interna, 2026-10-23): sin el degradado de
        `--card-destacada`. En escritorio, una fila: la pregunta a la izquierda
        y el selector con el botón a la derecha.
      */}
      <section className="bg-cacao sobre-oscuro mt-8 hidden items-center gap-8 rounded-(--radius-foto) px-8 py-7 lg:flex">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-cream text-balance" style={{ fontWeight: 500, fontSize: 30 }}>
            ¿Y si sigues hasta el <em className="clave">bolso terminado</em>?
          </h2>
          <p className="text-sand mt-1.5">
            {gratis ? `${gratis.nombre} es tuyo ahora mismo. ` : ""}
            {/* ⚠️ Decía "se abren los 23, uno nuevo cada mes": contaba los
                llaveros como bolsos y prometía un bolso nuevo al mes, que no
                existe (corregido el 2026-10-21). */}
            Con el plan se abren los {deBolso} bolsos
            {llaveros > 0 ? ` y ${llaveros} llaveros` : ""}, el directorio de proveedores y el
            Ojo Experto · garantía de 7 días.
          </p>
        </div>
        {/* ⚠️ Antes: "Crear mi cuenta gratis" → /entrar. Desde el 2026-10-21
            lleva a PAGAR, con anual por defecto (pedido de Cristian). */}
        <div className="shrink-0">
          <PagoConPlan enlaces={enlaces} origen="catalogo" tono="oscuro" disposicion="fila" />
        </div>
      </section>

      {/* En móvil se resume en una fila tocable: la tarjeta entera empujaba
          los bolsos fuera de la primera pantalla. Lleva a Mi plan, donde
          están el selector y el pago. */}
      <Link
        href="/app/plan"
        className="bg-cacao sobre-oscuro mt-6 flex items-center gap-4 rounded-(--radius-foto) px-5 py-4 lg:hidden"
      >
        <span className="min-w-0 flex-1">
          <span className="font-display text-cream block" style={{ fontWeight: 500, fontSize: 21 }}>
            ¿Sigues hasta el <em className="clave">bolso terminado</em>?
          </span>
          <span className="text-sand mt-0.5 block text-sm">
            Desde {desde}/mes · garantía 7 días
          </span>
        </span>
        <ChevronRight size={22} className="text-cream shrink-0" aria-hidden="true" />
      </Link>
    </>
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
          <span className="bg-sand-hover h-1.5 flex-1 overflow-hidden rounded-full">
            <span
              className="bg-cacao block h-full rounded-full"
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
