import type { ReactNode } from "react";
import { AnuncioCarga } from "@/components/app/AnuncioCarga";

/**
 * Lo que se ve MIENTRAS el servidor arma una pantalla de la app.
 *
 * ⚠️ POR QUÉ EXISTEN (Mixpanel, 30 días al 2026-11-06): la app no tenía ni un
 * `loading.tsx`. Tocar una tarjeta o un botón de la barra de abajo no cambiaba
 * NADA hasta que el servidor respondía (0,4-1,5 s medidos desde fuera; más en
 * un Android con datos), y Mixpanel lo contaba como "toque en vacío": 24 sobre
 * las tarjetas de Perla Tejida y Nácar Soñado, más los de "Mi plan" y
 * "Cuenta". Para quien toca, la app parecía trabada.
 *
 * Tienen la FORMA del contenido que viene (no un spinner): así el cambio se
 * nota en el mismo toque y, cuando llega la pantalla, nada salta de sitio.
 */

/** Un bloque gris que late. Sin latido si la persona pidió menos movimiento. */
export function Hueso({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`bg-sand animate-pulse motion-reduce:animate-none ${className}`} />;
}

/*
 * ════════════════════════════════════════════════════════════════════════════
 * ESQUELETOS EN TODA LA APP (2026-11-06, pedido de Cristian: "como El Charcu")
 * ════════════════════════════════════════════════════════════════════════════
 * Hasta hoy solo había dos (catálogo y ficha). Las demás pantallas caían en el
 * de catálogo —una rejilla de bolsos encima de Mi plan o de Cuenta— o, fuera
 * de la app, en NADA: tocar "comprar", "Contacto" o abrir el Ojo dejaba la
 * pantalla anterior quieta hasta que respondía el servidor. Cada uno tiene la
 * silueta de SU pantalla, igual que hace El Charcu (`shared/ui/Skeleton.tsx`).
 */

/** Un bloque elevado (tarjeta marfil con borde), para envolver huesos. */
function Tarjeta({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`bg-ivory border-line rounded-bloque border p-4 ${className}`}>{children}</div>;
}

/** `/pagar`: titular, la tarjeta del plan con su botón, qué recibes y los pasos. */
export function EsqueletoPagar() {
  return (
    <div className="bg-surface-base min-h-dvh">
      <AnuncioCarga texto="Preparando tu plan…" />
      <div className="mx-auto flex max-w-270 items-center justify-between px-4 py-3 lg:px-8 lg:py-5">
        <Hueso className="h-6 w-20 rounded-full" />
        <Hueso className="h-6 w-36 rounded-full" />
        <Hueso className="h-4 w-20 rounded-full" />
      </div>
      <div className="mx-auto grid max-w-270 gap-6 px-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12 lg:px-8">
        <div className="flex flex-col gap-6 pt-2 lg:pt-6">
          <div>
            <Hueso className="h-3 w-24 rounded-full" />
            <Hueso className="mt-3 h-10 w-72 max-w-full rounded-lg" />
            <Hueso className="mt-3 h-4 w-full rounded-full" />
            <Hueso className="mt-2 h-4 w-4/5 rounded-full" />
          </div>
          <Tarjeta className="lg:hidden">
            <Hueso className="h-16 w-full rounded-2xl" />
            <Hueso className="mt-5 h-12 w-48 rounded-lg" />
            <Hueso className="mt-3 h-4 w-3/4 rounded-full" />
            <Hueso className="mt-4 h-10 w-full rounded-xl" />
            <Hueso className="mt-5 h-14 w-full rounded-full" />
          </Tarjeta>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Tarjeta key={i} className="flex gap-3">
                <Hueso className="size-11 shrink-0 rounded-xl" />
                <div className="flex-1">
                  <Hueso className="h-4 w-3/4 rounded-full" />
                  <Hueso className="mt-2 h-3 w-full rounded-full" />
                </div>
              </Tarjeta>
            ))}
          </div>
        </div>
        <div className="hidden pt-6 lg:block">
          <Tarjeta className="p-6">
            <Hueso className="h-16 w-full rounded-2xl" />
            <Hueso className="mt-5 h-14 w-52 rounded-lg" />
            <Hueso className="mt-3 h-4 w-3/4 rounded-full" />
            <Hueso className="mt-4 h-10 w-full rounded-xl" />
            <Hueso className="mt-5 h-14 w-full rounded-full" />
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}

/** Mi plan: titular, el selector y la tarjeta partida (precio | incluye). */
export function EsqueletoPlan() {
  return (
    <main className="bg-sand flex-1 px-4 py-8 lg:px-8 lg:py-12">
      <AnuncioCarga texto="Cargando tu plan…" />
      <div className="mx-auto max-w-270">
        <Hueso className="bg-line mx-auto h-3 w-28 rounded-full" />
        <Hueso className="bg-line mx-auto mt-4 h-10 w-72 max-w-full rounded-lg" />
        <Hueso className="bg-line mx-auto mt-8 h-11 w-64 rounded-full" />
        <div className="border-line mt-8 grid overflow-hidden rounded-bloque border md:grid-cols-2">
          <div className="bg-espresso px-6 py-7 md:p-11">
            <div className="bg-espresso-2 h-3 w-24 animate-pulse rounded-full motion-reduce:animate-none" />
            <div className="bg-espresso-2 mt-5 h-16 w-48 animate-pulse rounded-lg motion-reduce:animate-none" />
            <div className="bg-espresso-2 mt-6 h-14 w-full animate-pulse rounded-full motion-reduce:animate-none" />
          </div>
          <div className="bg-ivory flex flex-col gap-3 px-6 py-7 md:p-11">
            {Array.from({ length: 6 }, (_, i) => (
              <Hueso key={i} className="h-4 w-full rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/** Cuenta: titular y un bloque de datos con sus filas. */
export function EsqueletoCuenta() {
  return (
    <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-16">
      <AnuncioCarga texto="Cargando tu cuenta…" />
      <div className="mx-auto max-w-2xl">
        <Hueso className="h-3 w-24 rounded-full" />
        <Hueso className="mt-4 h-10 w-56 rounded-lg" />
        <Tarjeta className="mt-6 flex flex-col gap-4 p-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i}>
              <Hueso className="h-3 w-20 rounded-full" />
              <Hueso className="mt-2 h-11 w-full rounded-md" />
            </div>
          ))}
        </Tarjeta>
        <Hueso className="mt-6 h-12 w-full rounded-full" />
      </div>
    </main>
  );
}

/** Directorio: titular, filtros y la lista de filas (ícono · nombre · botón). */
export function EsqueletoDirectorio() {
  return (
    <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-10">
      <AnuncioCarga texto="Cargando el directorio…" />
      <div className="mx-auto max-w-310">
        <Hueso className="h-3 w-28 rounded-full" />
        <Hueso className="mt-4 h-9 w-64 max-w-full rounded-lg" />
        <div className="mt-6 flex gap-2">
          <Hueso className="h-11 w-20 rounded-full" />
          <Hueso className="h-11 w-24 rounded-full" />
          <Hueso className="h-11 w-24 rounded-full" />
        </div>
        <ul className="mt-6 grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <Tarjeta className="flex items-center gap-3">
                <Hueso className="size-11 shrink-0 rounded-xl" />
                <div className="flex-1">
                  <Hueso className="h-4 w-2/3 rounded-full" />
                  <Hueso className="mt-2 h-3 w-1/3 rounded-full" />
                </div>
                <Hueso className="h-11 w-20 shrink-0 rounded-full" />
              </Tarjeta>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

/** El Ojo Experto: barra de arriba, unas burbujas de conversación y la caja de escribir. */
export function EsqueletoOjo() {
  return (
    <div className="alto-ojo flex w-full flex-col overflow-hidden">
      <AnuncioCarga texto="Abriendo el Ojo Experto…" />
      <div className="flex min-h-0 flex-1">
        <div className="border-line hidden w-72 shrink-0 flex-col gap-3 border-r p-4 lg:flex">
          <Hueso className="h-11 w-full rounded-full" />
          {Array.from({ length: 5 }, (_, i) => (
            <Hueso key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-line flex items-center justify-between border-b px-4 py-3 lg:hidden">
            <Hueso className="h-8 w-24 rounded-full" />
            <Hueso className="h-5 w-28 rounded-full" />
            <Hueso className="h-8 w-16 rounded-full" />
          </div>
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6">
            <div className="flex items-start gap-3">
              <Hueso className="size-9 shrink-0 rounded-full" />
              <div className="flex-1">
                <Hueso className="h-4 w-4/5 rounded-full" />
                <Hueso className="mt-2 h-4 w-3/5 rounded-full" />
              </div>
            </div>
            <Hueso className="ml-auto h-12 w-3/5 rounded-2xl" />
            <div className="flex items-start gap-3">
              <Hueso className="size-9 shrink-0 rounded-full" />
              <div className="flex-1">
                <Hueso className="h-4 w-full rounded-full" />
                <Hueso className="mt-2 h-4 w-11/12 rounded-full" />
                <Hueso className="mt-2 h-4 w-2/3 rounded-full" />
              </div>
            </div>
          </div>
          <div className="mx-auto w-full max-w-2xl px-4 pb-4">
            <Hueso className="h-14 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Contacto y documentos legales: titular y párrafos. */
export function EsqueletoDocumento() {
  return (
    <main className="px-5 py-12">
      <AnuncioCarga texto="Cargando…" />
      <div className="mx-auto max-w-3xl">
        <Hueso className="h-3 w-24 rounded-full" />
        <Hueso className="mt-4 h-10 w-72 max-w-full rounded-lg" />
        <div className="mt-8 flex flex-col gap-3">
          {Array.from({ length: 8 }, (_, i) => (
            <Hueso key={i} className={`h-4 rounded-full ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    </main>
  );
}

/**
 * El home (la página de ventas): cabecera, héroe con su foto y el inicio de
 * la sección siguiente. Es el primer contacto de quien llega de un Reel:
 * mejor la silueta de la página que una pantalla en blanco.
 */
export function EsqueletoHome() {
  return (
    <div className="bg-surface-base min-h-dvh">
      <AnuncioCarga texto="Cargando Manos Creadoras…" />
      <div className="mx-auto flex max-w-300 items-center justify-between px-4 py-4 lg:px-8">
        <Hueso className="h-7 w-40 rounded-full" />
        <Hueso className="h-11 w-28 rounded-full" />
      </div>
      <div className="mx-auto grid max-w-300 gap-8 px-4 pt-4 lg:grid-cols-2 lg:px-8 lg:pt-12">
        <div className="flex flex-col justify-center">
          <Hueso className="h-3 w-32 rounded-full" />
          <Hueso className="mt-4 h-12 w-full rounded-lg" />
          <Hueso className="mt-3 h-12 w-4/5 rounded-lg" />
          <Hueso className="mt-5 h-4 w-full rounded-full" />
          <Hueso className="mt-2 h-4 w-3/4 rounded-full" />
          <Hueso className="mt-8 h-14 w-full rounded-full lg:w-72" />
        </div>
        <Hueso className="aspect-square w-full rounded-(--radius-foto)" />
      </div>
    </div>
  );
}

/** Catálogo, directorio, cuenta y plan: título y una rejilla de tarjetas. */
export function EsqueletoPagina() {
  return (
    <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-10">
      {/* Texto de verdad y no `aria-label`, en el texto y no en `<main>`
          (revisor visual, 2026-11-06): ver `AnuncioCarga`. */}
      <AnuncioCarga texto="Cargando…" />
      <div className="mx-auto max-w-310">
        <Hueso className="h-3 w-32 rounded-full" />
        <Hueso className="mt-4 h-9 w-64 max-w-full rounded-lg" />
        <Hueso className="mt-3 h-4 w-48 rounded-full" />
        <div className="mt-6 flex gap-2">
          <Hueso className="h-11 w-24 rounded-full" />
          <Hueso className="h-11 w-28 rounded-full" />
          <Hueso className="h-11 w-28 rounded-full" />
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-5 lg:gap-y-8">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <Hueso className="aspect-[4/5] rounded-lg" />
              <Hueso className="mt-3 h-5 w-3/4 rounded-full" />
              <Hueso className="mt-2 h-3 w-1/2 rounded-full" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

/** La ficha de un proyecto: video arriba, título, avance y la lista de pasos. */
export function EsqueletoFicha() {
  return (
    <main className="min-w-0 flex-1">
      <AnuncioCarga texto="Cargando el proyecto…" />
      <div className="mx-auto max-w-310 lg:px-8 lg:py-8">
        <Hueso className="mb-6 hidden h-12 w-96 rounded-lg lg:block" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
          <div className="min-w-0">
            {/* El video va en espresso, como el reproductor de verdad: un
                hueco claro donde luego aparece un bloque oscuro sería un
                fogonazo. */}
            <div className="bg-espresso aspect-video lg:rounded-(--radius-foto)" />
            <div className="px-4 pt-6 lg:px-0">
              <Hueso className="h-10 w-56 rounded-lg lg:hidden" />
              <Hueso className="mt-3 h-4 w-44 rounded-full lg:hidden" />
              <Hueso className="mt-6 h-2 w-full rounded-full" />
              <Hueso className="mt-6 h-12 w-full rounded-full" />
              <Hueso className="mt-3 h-12 w-full rounded-full" />
            </div>
          </div>
          <ul className="flex flex-col gap-3 px-4 pb-8 lg:px-0">
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <Hueso className="h-16 rounded-md" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
