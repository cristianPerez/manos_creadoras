/**
 * Modo simulado: contestar sin llamar a Google.
 *
 * PARA QUÉ SIRVE. En QA se prueba el embudo entero —cupo, muro, historial,
 * medidor, los dos presupuestos— sin gastar un centavo. Y como la respuesta es
 * siempre la misma, una prueba que falla es un fallo de verdad y no el modelo
 * teniendo un día distinto.
 *
 * ⚠️ DOS CONDICIONES, Y LA SEGUNDA NO SE PUEDE APAGAR. Hace falta pedirlo con
 * `AI_SIMULAR_IA=1` **y** no estar en producción. Copiar una variable de un
 * entorno a otro es de las cosas más fáciles que pasan, y la consecuencia aquí
 * sería que la app de las alumnas contestara texto inventado sin que nadie se
 * diera cuenta: el Ojo Experto parecería funcionar mientras da consejos falsos
 * sobre el tejido de alguien. Por eso `VERCEL_ENV` manda sobre la variable, y
 * no al revés.
 *
 * Es la misma defensa que en El Charcu, donde el riesgo era inventar dosis de
 * sal de cura. Aquí nadie se envenena, pero una alumna que deshace su bolso
 * siguiendo un consejo falso tampoco vuelve.
 */
export function simulacionActiva(): boolean {
  const pedido = process.env.AI_SIMULAR_IA === "1";
  const enProduccion = process.env.VERCEL_ENV === "production";
  return pedido && !enProduccion;
}

/**
 * Una respuesta de mentira con la forma exacta de una de verdad.
 *
 * Lleva a propósito:
 *
 *  · **El aviso de que es simulada**, en la primera línea. Nadie debería mirar
 *    una captura de QA y creer que el Ojo Experto contestó eso.
 *  · **Consejo dentro de lo permitido** — técnica de tensión, nada de promesas
 *    de ingresos. Así el camino normal se recorre ENTERO, incluida la barrera
 *    de promesas, en vez de saltárselo, que es justo lo que uno quiere probar.
 *  · **Un recuento de tokens plausible**, para que se apunte gasto en el libro
 *    de QA y los dos presupuestos se puedan probar de verdad. Como QA tiene su
 *    propia base, ese gasto de mentira no toca el de producción.
 */
export function respuestaSimulada(
  pregunta: string,
  conFoto: boolean,
): { texto: string; tokensEntrada: number; tokensSalida: number } {
  const recorte = pregunta.slice(0, 120);

  const texto = [
    "**[RESPUESTA SIMULADA — no salió del Ojo Experto real]**",
    "",
    `Me preguntaste: «${recorte}»`,
    conFoto ? "\nY me mandaste una foto, que también va simulada." : "",
    "",
    "Lo que veo es la tensión, no el patrón: aprieta medio punto más al cerrar cada vuelta y sostén el hilo con el pulgar antes de pasar a la siguiente. ¿Con cuántas cuentas estás montando la base?",
  ]
    .filter((l) => l !== "")
    .join("\n");

  return {
    texto,
    // Del orden de una consulta real medida: ~1.800 de entrada con el contexto
    // de la alumna, más si lleva foto.
    tokensEntrada: conFoto ? 3200 : 1800,
    tokensSalida: 420,
  };
}
