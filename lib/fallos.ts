/**
 * Un solo sitio por el que sale TODO fallo técnico.
 *
 * Existe ANTES de que haya un proveedor de errores, y a propósito: mientras no
 * lo haya, esto escribe en la consola, que en el servidor ya recoge Vercel. El
 * día que entre uno (Sentry, Datadog, lo que sea) se cablea AQUÍ y en ningún
 * otro sitio — en vez de repartir llamadas del proveedor por veinte archivos y
 * tener que desenredarlas si algún día se cambia de herramienta.
 *
 * ⚠️ QUÉ ES UN FALLO TÉCNICO Y QUÉ NO — la distinción que hace esto útil:
 *
 *   · SÍ van aquí las cosas ROTAS: la base que no contesta, una excepción sin
 *     capturar, una pantalla que revienta, Gemini devolviendo basura.
 *   · NO van los resultados ESPERADOS del producto: que a una alumna se le
 *     acabe el cupo, que el Ojo Experto se quede sin presupuesto del día, que
 *     una respuesta se corrija por prometer ingresos. Eso no está roto — es el
 *     producto funcionando, y ya vive en Mixpanel (`lib/analitica/eventos.ts`).
 *
 * Mezclarlos hace que ninguna de las dos herramientas cuente la verdad: los
 * errores se llenan de ruido que nadie mira, y el embudo pierde eventos que sí
 * importaban.
 */

/** De dónde salió el fallo. Sirve para filtrar sin leer el mensaje. */
export type Area =
  | "ojo-experto"
  | "webhook"
  | "acceso"
  | "curso"
  | "video"
  | "avisos"
  | "config"
  | "navegador";

export type Contexto = Record<string, string | number | boolean | undefined>;

/**
 * Apunta un fallo técnico.
 *
 * ⚠️ NUNCA SE LE PASA NADA QUE IDENTIFIQUE A UNA PERSONA NI NINGÚN SECRETO.
 * Ni correos, ni nombres, ni el texto de las preguntas al Ojo Experto, ni
 * claves, ni el contenido de una foto. Lo que se escriba aquí ACABA SALIENDO
 * del edificio en cuanto exista un recolector de logs: un registro no es un
 * sitio privado, es una copia de los datos en manos de otro proveedor.
 *
 * Lo que SÍ vale: identificadores opacos (`user_id`, `leccion`, un código de
 * error, un número). Sirven para depurar y no dicen quién es nadie.
 *
 * Nunca lanza: un fallo al reportar un fallo no puede tumbar lo que iba bien.
 */
export function reportarFallo(area: Area, mensaje: string, contexto: Contexto = {}): void {
  try {
    /*
      JSON en UNA línea, no un texto suelto.

      Un recolector de logs lo convierte en campos filtrables solo ("enséñame
      todos los fallos del área `webhook` de ayer"). Una cadena de texto hay que
      parsearla después con una regla frágil que se rompe el día que alguien
      cambie una palabra del mensaje.
    */
    console.error(JSON.stringify({ nivel: "error", area, mensaje, ...contexto }));
  } catch {
    // Si ni siquiera se pudo convertir a texto, algo muy raro pasa — pero
    // callarse es mejor que reventar el camino de quien está usando la app.
  }
}

/** Lo mismo, para lo que preocupa pero todavía no ha roto nada. */
export function reportarAviso(area: Area, mensaje: string, contexto: Contexto = {}): void {
  try {
    console.warn(JSON.stringify({ nivel: "aviso", area, mensaje, ...contexto }));
  } catch {
    // Igual que arriba.
  }
}
