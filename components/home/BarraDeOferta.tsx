"use client";

import { X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { descuentoDeLanzamiento, dolares, type Frecuencia } from "@/lib/planes";

/**
 * La barra de oferta de lanzamiento, arriba del todo.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ EL RELOJ ES DE VERDAD. Cuando llega a cero, el precio SUBE.
 * ════════════════════════════════════════════════════════════════════════════
 * Pasadas las 24 horas, `lib/oferta.ts` deja de dar la oferta por activa y
 * toda la app —esta barra, el bloque de precio del home y la pantalla de
 * planes— pasa a US$35 / US$350 para esa persona.
 *
 * Eso es lo que separa una oferta de un engaño, y no es una cuestión de buenas
 * maneras: un contador que se reinicia al recargar se descubre en treinta
 * segundos, y quien lo descubre deja de creerse también el precio, la garantía
 * y los testimonios. La urgencia falsa no es fea, es que se nota.
 *
 * El reloj NO se reinicia entre visitas: la cookie guarda el instante de la
 * primera y no se vuelve a tocar (ver `middleware.ts`).
 * ════════════════════════════════════════════════════════════════════════════
 *
 * El TOGGLE arranca en "anual" porque es donde el descuento se ve más grande
 * —de US$350 a US$80— y porque es el plan que conviene vender: cobra el año
 * entero por adelantado.
 */

const COOKIE_CERRADA = "oferta_cerrada";

/* El almacén externo: `document.cookie`. Ver el comentario en el componente. */
const oyentes = new Set<() => void>();

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  return () => oyentes.delete(avisar);
}

function leerCerradaCliente(): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_CERRADA}=`));
}

/* En el HTML del servidor no hay cookies. Se asume NO cerrada para que el
   servidor y el navegador pinten lo mismo en el primer fotograma. */
function leerCerradaServidor(): boolean {
  return false;
}

export function BarraDeOferta({
  /** Cuándo termina, en ms desde la época. `null` = ya terminó o no hay. */
  terminaEn,
}: {
  terminaEn: number | null;
}) {
  const [frecuencia, setFrecuencia] = useState<Frecuencia>("anual");
  const [restante, setRestante] = useState<number | null>(null);

  /*
   * ⚠️ EL CONTADOR SE CALCULA EN EL NAVEGADOR, pero contra una fecha de FIN que
   * viene del servidor. Si el servidor mandara "quedan 8 horas" y la pestaña
   * se quedara abierta, el número se congelaría; con la fecha de fin, el
   * navegador recalcula solo y el reloj sigue bien aunque vuelva de dormir.
   */
  useEffect(() => {
    if (terminaEn == null) return;
    const tic = () => setRestante(Math.max(0, terminaEn - Date.now()));
    tic();
    const id = setInterval(tic, 1000);
    return () => clearInterval(id);
  }, [terminaEn]);

  /*
   * ⚠️ LA COOKIE SE LEE CON `useSyncExternalStore`, NO CON UN EFECTO.
   *
   * Hacerlo con `useEffect` + `setState` provoca un render en cascada —pinta,
   * decide, vuelve a pintar— en lo PRIMERO que se ve de la página. Y
   * `document.cookie` es exactamente lo que React llama un almacén externo:
   * este hook existe para leerlos sin ese doble render.
   */
  const yaCerrada = useSyncExternalStore(suscribir, leerCerradaCliente, leerCerradaServidor);

  // Sin fecha de fin la oferta terminó: la barra no existe, no "se apaga".
  if (terminaEn == null || yaCerrada) return null;
  // `restante` es null en el primer fotograma, antes de que corra el efecto.
  if (restante !== null && restante <= 0) return null;

  const { antes, ahora, pct } = descuentoDeLanzamiento(frecuencia);

  const cerrar = () => {
    const caduca = new Date(Date.now() + 7 * 864e5).toUTCString();
    document.cookie = `${COOKIE_CERRADA}=1; path=/; expires=${caduca}; SameSite=Lax`;
    // La cookie cambió, pero nadie se entera solo: hay que avisar al hook.
    for (const avisar of oyentes) avisar();
  };

  return (
    <div className="bg-espresso relative text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-5 py-3 pr-12 text-center">
        {/*
          El toggle: dos palabras, no un interruptor. A 375px un control con
          fondo y píldora ocuparía media barra y dejaría el precio sin sitio.
        */}
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
          {(["anual", "mensual"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={frecuencia === f}
              onClick={() => setFrecuencia(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors [touch-action:manipulation] ${
                frecuencia === f ? "bg-white/90 text-espresso" : "text-white/70"
              }`}
            >
              {f === "anual" ? "Anual" : "Mensual"}
            </button>
          ))}
        </div>

        <a href="#precio" className="text-xs [touch-action:manipulation] md:text-sm">
          <span className="text-white/60 line-through">{dolares(antes)}</span>{" "}
          <strong className="text-gold-light font-semibold">{dolares(ahora)}</strong>
          <span className="text-white/70"> · −{pct}%</span>
          {restante !== null && (
            <span className="text-white/70">
              {" · termina en "}
              <strong className="text-gold-light font-semibold tabular-nums">
                {reloj(restante)}
              </strong>
            </span>
          )}
        </a>
      </div>

      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar este aviso"
        className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white [touch-action:manipulation]"
      >
        <X size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * "09:41:07" — horas, minutos y segundos.
 *
 * `tabular-nums` en quien lo pinta: sin eso, cada segundo cambia el ancho de
 * las cifras y el texto de al lado baila.
 */
function reloj(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
