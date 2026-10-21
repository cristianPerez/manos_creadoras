"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EnlaceCompra, EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { IconoWhatsApp } from "@/components/home/IconoWhatsApp";
import { WHATSAPP_URL } from "@/lib/landing";
import { FRECUENCIA_POR_DEFECTO, precioDesde } from "@/lib/planes";

/**
 * La barra fija de compra, solo en móvil (home v3).
 *
 * Sustituye a la barra de cinco íconos sin texto de la v2. Aquella navegaba
 * (Inicio · Bolso gratis · Ojo · Entrar); esta vende: precio a la izquierda,
 * "Inscribirme" a la derecha y WhatsApp para la duda de última hora. En un
 * teléfono el home mide más de 5.000px, y el botón de compra tiene que estar a
 * un toque en todo el recorrido.
 *
 * ⚠️ CUÁNDO SE VE, Y POR QUÉ:
 *   · NO mientras se ve el banner: ahí ya están el botón dorado y la línea de
 *     precio, y la barra se comería el botón principal (pasó en la v2: el botón
 *     dorado caía justo debajo de la barra y no se podía pulsar).
 *   · NO mientras se ve `#precio`: ahí está el botón de verdad, y dos
 *     "Inscribirme" en la misma pantalla compiten entre sí.
 *
 * La altura que ocupa (72px + safe area) la reserva el `<main>` y el pie con
 * `--barra-compra`, para que no tape el copyright.
 */
export function BarraCompraMovil() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [tapadoVisible, setTapadoVisible] = useState(false);
  const quieto = useReducedMotion();

  useEffect(() => {
    const banner = document.getElementById("banner");
    const observadores: IntersectionObserver[] = [];

    // `#banner` es el envoltorio del banner en `app/page.tsx` y existe siempre,
    // aunque el carrusel no tenga fotos. Si un día se quitara, la barra no
    // aparecería: es el fallo seguro (nunca tapa nada).
    if (banner) {
      const o = new IntersectionObserver(([e]) => setBannerVisible(e.isIntersecting));
      o.observe(banner);
      observadores.push(o);
    }
    /*
     * Secciones donde la barra estorba: `#precio` (ya tiene su botón) y `#ojo`
     * (la barra tapaba el campo "O escribe la tuya…" — lo vio el revisor). Se
     * llevan en un Set porque pueden verse las dos a la vez en el cambio.
     */
    const visibles = new Set<string>();
    const tapadas = ["precio", "ojo"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (tapadas.length > 0) {
      const o = new IntersectionObserver((entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) visibles.add(e.target.id);
          else visibles.delete(e.target.id);
        }
        setTapadoVisible(visibles.size > 0);
      });
      tapadas.forEach((el) => o.observe(el));
      observadores.push(o);
    }
    return () => observadores.forEach((o) => o.disconnect());
  }, []);

  const visible = !bannerVisible && !tapadoVisible;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={quieto ? false : { y: "100%" }}
          animate={{ y: 0 }}
          exit={quieto ? { opacity: 0 } : { y: "100%" }}
          transition={{ duration: quieto ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-espresso sobre-oscuro fixed inset-x-0 bottom-0 z-(--z-sticky) md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex h-18 items-center gap-2 px-4">
            <p className="min-w-0 flex-1 leading-tight">
              <span className="text-on-dark-muted block text-xs">Curso completo</span>
              <span className="text-gold-pale block text-base font-extrabold">
                desde {precioDesde()}/mes
              </span>
            </p>

            <EnlaceWhatsApp
              href={WHATSAPP_URL}
              origen="barra_movil"
              ariaLabel="Escríbenos por WhatsApp"
              className="border-espresso-line text-gold-pale rounded-boton flex size-12 shrink-0 items-center justify-center border"
            >
              <IconoWhatsApp size={22} />
            </EnlaceWhatsApp>

            <EnlaceCompra
              href="#precio"
              origen="barra_movil"
              plan={FRECUENCIA_POR_DEFECTO}
              className="bg-gold-pale text-espresso rounded-boton flex h-12 shrink-0 items-center px-5 font-bold transition-transform active:scale-[0.98]"
            >
              Inscribirme
            </EnlaceCompra>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
