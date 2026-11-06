"use client";

import { Lock, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BannerPlan } from "@/components/app/BannerPlan";
import { Entrada } from "@/components/home/Entrada";
import { TarjetaBolso } from "@/components/app/TarjetaBolso";
import { estadoDe, siguienteVideo, type Bolso } from "@/lib/bolsos-logica";
import type { Frecuencia } from "@/lib/planes";
import { CURSOS_PROXIMOS, type CursoProximo } from "@/lib/proximamente";

type Filtro = "todos" | "en-curso" | "terminados";

/**
 * La rejilla de proyectos (bolsos y accesorios) con sus filtros, y debajo los
 * cursos que se abren pronto.
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
  /** Quien mira no tiene plan (con cuenta o sin ella): se le enseña la oferta. */
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
        aria-label="Filtrar proyectos"
        /* A 375px "Terminados 0" quedaba cortado por el borde y se leía como
           un error (revisor visual, 2026-11-06). Se probó fundir el borde y
           era peor: el chip seguía medio borrado incluso al final del
           desplazamiento. Ahora los tres CABEN: gap y padding de los chips un
           paso más chicos solo en el celular. */
        className="sin-barra -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:mt-8 lg:flex-wrap lg:gap-2.5 lg:px-0"
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
              className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-base whitespace-nowrap lg:px-5 transition-colors [touch-action:manipulation] ${
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
          Todavía no tienes proyectos aquí.{" "}
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

      {/* Solo en "Todos": en "En curso" o "Terminados" un curso que aún no
          existe no pinta nada. */}
      {filtro === "todos" && CON_FOTO.length > 0 && <Proximamente invitada={invitada} />}
    </>
  );
}

/*
 * Solo los cursos que ya tienen foto (revisor visual, 2026-11-02): una tarjeta
 * espresso con un ícono junto a una foto real se leía como una imagen que no
 * cargó. El de velas sale solo en cuanto tenga `imagen` en `lib/proximamente.ts`;
 * mientras, lo nombra el subtítulo.
 */
const CON_FOTO = CURSOS_PROXIMOS.filter((c) => c.imagen);
const SIN_FOTO = CURSOS_PROXIMOS.filter((c) => !c.imagen);

/**
 * "Se abre en diciembre": los cursos anunciados que aún no tienen videos
 * (`lib/proximamente.ts`). Es lo que responde "¿por qué sigo pagando?".
 *
 * ⚠️ NO SON ENLACES, Y A PROPÓSITO: no hay nada que abrir todavía, y una
 * tarjeta que parece tocable y no hace nada rompe la confianza. Por eso no
 * tienen hover ni cursor, y el candado + la fecha dicen por qué.
 */
function Proximamente({ invitada }: { invitada: boolean }) {
  /* Con una sola tarjeta, horizontal a todo el ancho: en la rejilla de 2
     dejaba media pantalla vacía y se leía como algo a medio hacer. */
  const sola = CON_FOTO.length === 1;
  return (
    <section aria-labelledby="proximamente-titulo" className="mt-12 lg:mt-14">
      <Entrada>
        <h2
          id="proximamente-titulo"
          className="font-display text-espresso"
          style={{ fontWeight: 500, fontSize: 26, lineHeight: 1.15 }}
        >
          Se abre <em className="clave">en diciembre</em>
        </h2>
        <p className="text-ink-body mt-1.5 max-w-2xl text-sm">
          Adornos para tejer y vender esta Navidad
          {SIN_FOTO.length > 0 ? ` y, muy pronto, ${SIN_FOTO.map((c) => c.nombre.toLowerCase()).join(" y ")}` : ""}.
          Entran en tu membresía, sin pagar de nuevo.
        </p>
      </Entrada>
      <ul
        className={`mt-5 grid gap-x-4 gap-y-6 ${sola ? "grid-cols-1 lg:max-w-3xl" : "grid-cols-2 lg:grid-cols-5"}`}
      >
        {CON_FOTO.map((c, i) => (
          <li key={c.id}>
            <Entrada retraso={0.07 * (i + 1)}>
              <TarjetaProxima curso={c} horizontal={sola} />
            </Entrada>
          </li>
        ))}
      </ul>
      {/* La salida para quien aún no tiene plan: sin esto la sección era un
          callejón sin salida (revisor visual, 2026-11-02). */}
      {invitada && (
        <Link
          href="/app/plan"
          className="text-gold mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline underline-offset-4"
        >
          Ver el plan que los incluye →
        </Link>
      )}
    </section>
  );
}

function TarjetaProxima({ curso, horizontal }: { curso: CursoProximo; horizontal: boolean }) {
  return (
    <div className={horizontal ? "flex items-center gap-4 lg:gap-6" : ""}>
      <div
        className={`bg-espresso relative overflow-hidden rounded-lg ${
          horizontal ? "aspect-square w-[44%] shrink-0 lg:w-64" : "aspect-[4/5]"
        }`}
      >
        {curso.imagen && (
          <>
            <Image src={curso.imagen} alt="" fill sizes="(min-width: 1024px) 280px, 45vw" className="object-cover" />
            {/* Velo espresso suave: el candado ya dice "todavía no"; un velo
                fuerte apagaba la foto que más vende de la sección. */}
            <span aria-hidden="true" className="bg-espresso/20 absolute inset-0" />
          </>
        )}
        <span className="bg-espresso text-gold-pale absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase">
          <Lock size={12} aria-hidden="true" />
          {curso.abre}
        </span>
      </div>
      <div className="min-w-0">
        <h3
          className={`font-display text-espresso ${horizontal ? "" : "mt-3 truncate"}`}
          style={{ fontWeight: 500, fontSize: horizontal ? 24 : 21, lineHeight: 1.2 }}
        >
          {curso.nombre}
        </h3>
        <p className="text-ink-muted mt-1 text-sm">
          {curso.detalle ?? "Por anunciar"} · en tu membresía
        </p>
      </div>
    </div>
  );
}

/**
 * La oferta, para quien todavía no ha entrado. Va DENTRO del catálogo y no en
 * una pantalla aparte: lo que la convence de pagar es tener los proyectos delante.
 * La pieza es `BannerPlan`, la misma que usa la ficha de un bolso con plan.
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
  return (
    <div className="mt-8 max-lg:mt-6">
      <BannerPlan
        gratisNombre={bolsos.find((b) => b.gratis)?.nombre ?? null}
        desde={desde}
        enlaces={enlaces}
        origen="catalogo"
        compactoEnMovil
      />
    </div>
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
      href={`/app/bolsos/${bolso.slug}?video=${siguiente.orden}&ver=1`}
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
            className="object-cover"
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
