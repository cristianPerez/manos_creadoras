"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * El precio, contando hasta su valor cada vez que cambia.
 *
 * ⚠️ NO SIRVE `NumeroQueCuenta`, Y SE INTENTÓ. Aquel cuenta cuando el número
 * ENTRA EN PANTALLA (`useInView` + `once: true`), que es lo correcto para el
 * home. Aquí el número no entra: ya está a la vista y lo que cambia es el plan
 * elegido. Montándolo de nuevo con `key` el contador arrancaba en 0 y se
 * quedaba ahí — al volver a "Anual" el precio se leía **US$0,00**, que en una
 * pantalla de cobro es lo más parecido a un error que puede pasar.
 *
 * Este cuenta al cambiar el VALOR, sin mirar el scroll.
 */
export function PrecioQueCuenta({ hasta, quieto }: { hasta: number; quieto: boolean }) {
  const [n, setN] = useState(hasta);

  /*
   * ⚠️ GUARDA DÓNDE ESTÁ EL NÚMERO AHORA MISMO, no a dónde va.
   *
   * La primera versión apuntaba el destino (`anterior.current = hasta`) nada
   * más lanzar la animación, y eso tenía un fallo que costó encontrar: si la
   * animación se interrumpe a media cuenta —y se interrumpe, porque React
   * vuelve a montar los efectos— el siguiente arranque creía que ya estaba en
   * el destino y no movía nada. El número se quedaba clavado en el valor del
   * ciclo ANTERIOR: el toggle decía "Anual" y el precio seguía marcando los
   * US$19,70 del mensual.
   *
   * Apuntando el valor real en cada fotograma, una animación cortada se
   * retoma desde donde se quedó y siempre acaba en `hasta`.
   */
  const actual = useRef(hasta);

  useEffect(() => {
    // Con `prefers-reduced-motion` no se anima NI se toca el estado: el valor
    // se pinta directo abajo. Escribirlo aquí sería un `setState` en un efecto
    // para nada.
    if (quieto) return;
    const control = animate(actual.current, hasta, {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        actual.current = v;
        setN(v);
      },
    });
    return () => control.stop();
  }, [hasta, quieto]);

  const texto = (v: number) => `US$${v.toFixed(2).replace(".", ",")}`;

  /* El ancho se reserva con el valor final invisible: si no, el renglón entero
     se movería a cada cifra mientras cuenta. */
  return (
    <span className="relative inline-grid">
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {texto(hasta)}
      </span>
      <span className="col-start-1 row-start-1">{texto(quieto ? hasta : n)}</span>
    </span>
  );
}

