"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EnlaceCompra, EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { IconoWhatsApp } from "@/components/home/IconoWhatsApp";
import { useFrecuenciaElegida } from "@/lib/frecuencia-elegida";
import { WHATSAPP_URL } from "@/lib/landing";
import type { Frecuencia } from "@/lib/planes";

/**
 * La barra fija de compra, solo en móvil.
 *
 * ⚠️ EN ESCRITORIO NO EXISTE: la cabecera pegajosa ya lleva "Inscribirme"
 * siempre a la vista, y una barra abajo sería el mismo botón dos veces en la
 * misma pantalla.
 *
 * ── Home v3 (2026-11-08) ──────────────────────────────────────────────────
 *
 * ⚠️ AHORA PAGA, NO BAJA AL PRECIO. Su botón es dorado (`.cta-pagar`, dorado =
 * pagar) y hace lo mismo que el de la tarjeta de precio: el ciclo elegido, la
 * flag `ruta_pago` y el salto de `/pagar` si ya la vio (`conRuta`).
 *
 * ⚠️ CUÁNDO SE VE, Y POR QUÉ:
 *   · NO hasta que el botón gratis del héroe sale de pantalla POR ARRIBA. Antes
 *     esperaba a toda la portada; ahora sale antes, pero nunca tapa la prueba
 *     social ("+1.200 alumnas") de la primera pantalla.
 *   · NO mientras se ve el botón dorado de la tarjeta de precio: dos botones
 *     dorados iguales en la misma pantalla compiten entre sí.
 *
 * El alto que ocupa lo reserva el cierre con `reserva-barra-compra`, para que
 * no tape el texto legal.
 */
export function BarraCompraB({
  enlaces,
  desde,
}: {
  enlaces: Record<Frecuencia, string | null>;
  /** "$29.992 COP" — el precio por mes más bajo (anual), de la base. */
  desde: string;
}) {
  const frecuencia = useFrecuenciaElegida();
  const enlace = enlaces[frecuencia];
  const [pasoElHeroe, setPasoElHeroe] = useState(false);
  const [precioVisible, setPrecioVisible] = useState(false);
  const quieto = useReducedMotion();

  useEffect(() => {
    const observadores: IntersectionObserver[] = [];

    /* El botón gratis lo pinta `PortadaB`. Si un día se quitara, la barra no
       aparecería nunca: es el fallo seguro (nunca tapa nada). Solo cuenta
       cuando quedó ARRIBA: al cargar, aún por debajo, no debe salir. */
    const heroe = document.getElementById("cta-gratis-heroe");
    if (heroe) {
      const o = new IntersectionObserver(([e]) =>
        setPasoElHeroe(!e.isIntersecting && e.boundingClientRect.bottom < 0),
      );
      o.observe(heroe);
      observadores.push(o);
    }

    const precio = document.getElementById("cta-pagar-precio");
    if (precio) {
      const o = new IntersectionObserver(([e]) => setPrecioVisible(e.isIntersecting));
      o.observe(precio);
      observadores.push(o);
    }

    return () => observadores.forEach((o) => o.disconnect());
  }, []);

  const visible = pasoElHeroe && !precioVisible;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={quieto ? false : { y: "100%" }}
          animate={{ y: 0 }}
          exit={quieto ? { opacity: 0 } : { y: "100%" }}
          transition={{ duration: quieto ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-ivory border-line fixed inset-x-0 bottom-0 z-(--z-sticky) border-t shadow-[0_-8px_24px_-16px_rgba(46,36,64,0.35)] lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex min-h-18 items-center gap-2 px-4 py-2">
            <p className="min-w-0 flex-1 leading-tight">
              <span className="text-ink-body block text-xs whitespace-nowrap">Membresía completa</span>
              {/* Puede partirse en dos renglones ("desde $29.992 / COP/mes"):
                  cede el texto, nunca el botón. */}
              <span className="text-espresso block text-sm font-bold text-pretty">desde {desde}/mes</span>
            </p>

            <EnlaceWhatsApp
              href={WHATSAPP_URL}
              origen="barra_movil"
              ariaLabel="Escríbenos por WhatsApp"
              className="border-line text-espresso rounded-foto-b flex size-12 shrink-0 items-center justify-center border"
            >
              <IconoWhatsApp size={22} />
            </EnlaceWhatsApp>

            <div className="shrink-0">
              <EnlaceCompra
                href={enlace ?? `/pagar?ciclo=${frecuencia}&desde=barra_movil`}
                origen="barra_movil"
                plan={frecuencia}
                abrePago={Boolean(enlace)}
                conRuta
                posicion="barra_fija"
                className="cta-pagar flex h-13 items-center px-5 transition-transform active:scale-[0.98]"
              >
                Inscribirme
              </EnlaceCompra>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
