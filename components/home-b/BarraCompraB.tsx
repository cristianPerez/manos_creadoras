"use client";

import { usePrecios } from "@/components/app/Precios";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EnlaceCompra, EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { IconoWhatsApp } from "@/components/home/IconoWhatsApp";
import { WHATSAPP_URL } from "@/lib/landing";
import { FRECUENCIA_POR_DEFECTO } from "@/lib/planes";

/**
 * La barra fija de compra, solo en móvil.
 *
 * ⚠️ EN ESCRITORIO NO EXISTE: la cabecera pegajosa ya lleva "Inscribirme"
 * siempre a la vista, y una barra abajo sería el mismo botón dos veces en la
 * misma pantalla.
 *
 * ⚠️ CUÁNDO SE VE, Y POR QUÉ:
 *   · NO mientras se ve la portada: ahí ya están el botón morado y el enlace
 *     de precio, y la barra se comería el botón principal.
 *   · NO mientras se ve `#precio`: ahí está el botón de verdad, y dos
 *     "Inscribirme" en la misma pantalla compiten entre sí.
 *
 * El alto que ocupa lo reserva el cierre con `reserva-barra-compra`, para que
 * no tape el texto legal.
 */
export function BarraCompraB() {
  const pr = usePrecios();
  const [portadaVisible, setPortadaVisible] = useState(true);
  const [precioVisible, setPrecioVisible] = useState(false);
  const quieto = useReducedMotion();

  useEffect(() => {
    const observadores: IntersectionObserver[] = [];

    /* `#banner` lo pinta `PortadaB` y existe siempre. Si un día se quitara, la
       barra no aparecería nunca: es el fallo seguro (nunca tapa nada). */
    const portada = document.getElementById("banner");
    if (portada) {
      const o = new IntersectionObserver(([e]) => setPortadaVisible(e.isIntersecting));
      o.observe(portada);
      observadores.push(o);
    }

    const precio = document.getElementById("precio");
    if (precio) {
      const o = new IntersectionObserver(([e]) => setPrecioVisible(e.isIntersecting));
      o.observe(precio);
      observadores.push(o);
    }

    return () => observadores.forEach((o) => o.disconnect());
  }, []);

  const visible = !portadaVisible && !precioVisible;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={quieto ? false : { y: "100%" }}
          animate={{ y: 0 }}
          exit={quieto ? { opacity: 0 } : { y: "100%" }}
          transition={{ duration: quieto ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-espresso-2 sobre-oscuro border-espresso-line fixed inset-x-0 bottom-0 z-(--z-sticky) border-t lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex h-18 items-center gap-2.5 px-4">
            <p className="min-w-0 flex-1 leading-tight">
              <span className="text-on-dark-muted block text-[12.5px]">Membresía completa</span>
              {/* `whitespace-nowrap`: a 375px, junto al botón y al WhatsApp,
                  "desde US$9,50/mes" se partía en dos renglones y la barra
                  crecía de alto tapando el contenido. */}
              <span
                className="text-ivory block font-bold whitespace-nowrap"
                style={{ fontSize: 15.5 }}
              >
                desde {pr.desde}/mes
              </span>
            </p>

            <EnlaceWhatsApp
              href={WHATSAPP_URL}
              origen="barra_movil"
              ariaLabel="Escríbenos por WhatsApp"
              className="border-espresso-line text-gold-light rounded-foto-b flex size-12 shrink-0 items-center justify-center border"
            >
              <IconoWhatsApp size={22} />
            </EnlaceWhatsApp>

            <EnlaceCompra
              href="#precio"
              origen="barra_movil"
              plan={FRECUENCIA_POR_DEFECTO}
              className="bg-gold-light text-espresso-2 flex h-12 shrink-0 items-center rounded-full px-5.5 font-bold transition-transform active:scale-[0.98]"
            >
              Inscribirme
            </EnlaceCompra>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
