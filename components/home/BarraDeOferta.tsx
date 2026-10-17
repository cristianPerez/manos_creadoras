"use client";

import { X } from "lucide-react";
import { useSyncExternalStore } from "react";
import { AHORRO_ANUAL, AHORRO_ANUAL_PCT, PRECIO_ANUAL, PRECIO_MENSUAL } from "@/lib/planes";

/**
 * La barra de ahorro, arriba del todo.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ POR QUÉ NO LLEVA CUENTA ATRÁS (decidido con Cristian el 2026-10-17)
 * ════════════════════════════════════════════════════════════════════════════
 * La referencia que trajo era «Oferta relámpago: ~~US$70~~ US$19,70 · termina
 * en 10:16:50», con el reloj guardado en una cookie para que cada dispositivo
 * tuviera el suyo. Eso no se pudo hacer tal cual, por dos motivos concretos:
 *
 * 1. **US$70 no ha sido nunca el precio.** Hoy son US$25 al mes y US$250 al
 *    año. Tachar un precio que no existió es publicidad engañosa —en Colombia
 *    lo sanciona la SIC— y basta que una alumna mire el histórico para perder
 *    la confianza en todo lo demás de la página.
 *
 * 2. **El botón cobraría otra cosa.** En OnePay solo existen los planes de
 *    US$25 y US$250. Una barra que promete US$19,70 llevando a un cobro de
 *    US$25 no es una oferta: es cobrar de más, y son devoluciones seguras.
 *
 * Así que la barra anuncia el descuento que SÍ existe y que el botón SÍ
 * cumple: pagar el año sale US$250 en vez de US$300. Y como ese descuento es
 * permanente, **no lleva reloj**: un contador sobre algo que no caduca es el
 * dark pattern que más rápido se descubre —basta recargar— y el sistema de
 * este proyecto los prohíbe.
 *
 * El día que haya un plan de oferta de verdad en OnePay, esto se convierte en
 * una cuenta atrás honesta cambiando dos cosas: el enlace y una fecha de fin.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * La COOKIE sigue haciendo falta, pero para lo contrario de lo que suele
 * usarse: recuerda que esta persona ya la cerró, para no volver a ponérsela
 * encima en cada visita. Caduca a los 7 días, así que vuelve a verla más
 * adelante —que es lo que pidió Cristian— sin resultar insistente.
 */

const COOKIE = "oferta_cerrada";
const DIAS_OCULTA = 7;

/*
 * ⚠️ LA COOKIE SE LEE CON `useSyncExternalStore` Y NO CON `useEffect`.
 *
 * El primer intento ponía `setVisible(true)` dentro de un efecto y el linter lo
 * rechazó con razón: un `setState` síncrono en un efecto provoca un render en
 * cascada —pinta, decide, vuelve a pintar— en lo PRIMERO que se ve de la
 * página. `document.cookie` es exactamente lo que React llama un "almacén
 * externo", y este hook existe para leerlos sin ese doble render.
 *
 * `leerEnServidor` devuelve `true` a propósito: durante el HTML del servidor no
 * hay cookies, y si devolviera `false` la barra entraría con un salto visible
 * en cuanto hidratara. Quien la haya cerrado la ve desaparecer en el primer
 * fotograma, que es mucho menos molesto que verla aparecer de golpe cada vez.
 */
const oyentes = new Set<() => void>();

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  return () => oyentes.delete(avisar);
}

function leerEnCliente(): boolean {
  return !document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=`));
}

function leerEnServidor(): boolean {
  return true;
}

export function BarraDeOferta() {
  const visible = useSyncExternalStore(suscribir, leerEnCliente, leerEnServidor);

  if (!visible) return null;

  const cerrar = () => {
    const caduca = new Date(Date.now() + DIAS_OCULTA * 864e5).toUTCString();
    // `SameSite=Lax` y sin `Secure` para que funcione igual en localhost.
    document.cookie = `${COOKIE}=1; path=/; expires=${caduca}; SameSite=Lax`;
    // La cookie cambió, pero nadie se entera solo: hay que avisar al hook.
    for (const avisar of oyentes) avisar();
  };

  return (
    <div className="bg-espresso relative text-white">
      {/*
        `pr-12` deja sitio a la X: sin ese hueco, en un móvil estrecho el texto
        pasa por debajo del botón de cerrar y se lee a medias.
      */}
      <a
        href="#precio"
        className="flex min-h-11 items-center justify-center px-5 py-3 pr-12 text-center text-xs leading-snug [touch-action:manipulation] md:text-sm"
      >
        <span>
          Paga el año y ahorras{" "}
          <strong className="text-gold-light font-semibold">
            US${AHORRO_ANUAL} ({AHORRO_ANUAL_PCT}%)
          </strong>
          <span className="hidden sm:inline">
            {" "}
            · US${PRECIO_ANUAL} en vez de US${PRECIO_MENSUAL * 12}
          </span>
        </span>
      </a>

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
