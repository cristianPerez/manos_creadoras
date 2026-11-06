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
function Hueso({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`bg-sand animate-pulse motion-reduce:animate-none ${className}`} />;
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
