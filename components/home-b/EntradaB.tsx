"use client";

import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { createContext, useContext, useRef, type ReactNode } from "react";
import { NumeroQueCuenta } from "@/components/home/NumeroQueCuenta";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * LA ENTRADA ESCALONADA DEL HOME B (2026-11-05, pedido de Cristian)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * `components/home/Entrada.tsx` hace aparecer cada sección como UN bloque. El
 * revisor lo marcó tres rondas seguidas (eje "movimiento" en 2/4): las tres
 * tarjetas de dolor, las cinco cápsulas o los ocho "incluye" llegaban de
 * golpe, todos a la vez, y la página se sentía quieta.
 *
 * Aquí la sección entra y, DENTRO, cada pieza marcada con `<PiezaB>` llega 60
 * ms después de la anterior: el ojo las recorre en orden en vez de recibir un
 * bloque. Es la mejora de "estático" a "vivo" más barata que hay.
 *
 * ⚠️ ES UN COMPONENTE APARTE Y NO UN CAMBIO EN `Entrada.tsx`, porque aquel lo
 * usa también el home de control, y el control no se toca mientras dure el
 * experimento.
 *
 * Reglas del sistema: nada bloquea (todo dura < 0,5 s), sin `linear`, se
 * anima una vez (`once`: repetir al volver a subir marea) y con
 * `prefers-reduced-motion` no se mueve nada — las piezas salen ya puestas.
 */

const SALIDA_SUAVE = [0.16, 1, 0.3, 1] as const;

/** Lo que hace cada pieza: sube 14px y aparece. */
const PIEZA: Variants = {
  oculto: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: SALIDA_SUAVE } },
};

/* Con movimiento reducido, las piezas no se animan: lo avisa el contenedor. */
const Quieto = createContext(false);

export function EntradaB({
  children,
  className,
  escalonado = 0.06,
  como = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Segundos entre pieza y pieza. */
  escalonado?: number;
  como?: "div" | "ul";
}) {
  const ref = useRef<HTMLDivElement & HTMLUListElement>(null);
  const visible = useInView(ref, { once: true, margin: "-80px" });
  const quieto = Boolean(useReducedMotion());

  const variantes: Variants = {
    oculto: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: SALIDA_SUAVE, staggerChildren: escalonado, delayChildren: 0.08 },
    },
  };

  if (quieto) {
    const Etiqueta = como;
    return (
      <Quieto.Provider value>
        <Etiqueta className={className}>{children}</Etiqueta>
      </Quieto.Provider>
    );
  }

  const Movil = como === "ul" ? motion.ul : motion.div;
  return (
    <Movil
      ref={ref}
      className={className}
      variants={variantes}
      initial="oculto"
      animate={visible ? "visible" : "oculto"}
    >
      {children}
    </Movil>
  );
}

/**
 * Una pieza que entra en su turno dentro de un `<EntradaB>` (puede estar
 * anidada a cualquier profundidad: las variantes se heredan por contexto).
 */
export function PiezaB({
  children,
  className,
  como = "div",
}: {
  children: ReactNode;
  className?: string;
  como?: "div" | "li" | "p";
}) {
  const quieto = useContext(Quieto);
  if (quieto) {
    const Etiqueta = como;
    return <Etiqueta className={className}>{children}</Etiqueta>;
  }
  const Movil = como === "li" ? motion.li : como === "p" ? motion.p : motion.div;
  return (
    <Movil className={className} variants={PIEZA}>
      {children}
    </Movil>
  );
}

/**
 * Un entero que cuenta desde 0 al entrar en pantalla ("106" videos).
 *
 * ⚠️ EXISTE PORQUE UNA SECCIÓN DEL SERVIDOR NO PUEDE PASARLE UNA FUNCIÓN a
 * `NumeroQueCuenta` (que es de navegador): el primer intento le pasaba
 * `formato={(n) => …}` desde `ProfesoraB` y la página entera dio error 500
 * ("Functions cannot be passed directly to Client Components"). `tsc` y el
 * build no lo ven; solo sale al pintarla. Aquí el formato vive del lado del
 * navegador y desde el servidor solo viaja el número.
 */
export function EnteroQueCuentaB({ hasta }: { hasta: number }) {
  return <NumeroQueCuenta hasta={hasta} formato={(n) => String(Math.round(n))} />;
}
