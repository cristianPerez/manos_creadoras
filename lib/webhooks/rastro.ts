import { randomBytes } from "node:crypto";
import type { Area } from "@/lib/fallos";

/**
 * El diario de UN webhook, de principio a fin.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ POR QUÉ ESTO Y NO DATADOG (decidido el 2026-10-17)
 * ════════════════════════════════════════════════════════════════════════════
 * La tentación era mandar los webhooks a una herramienta de observabilidad.
 * No hace falta, y además sería peor para este caso concreto:
 *
 *   · El registro de verdad YA EXISTE y es `webhook_eventos`, que guarda el
 *     CUERPO ENTERO de cada evento. Datadog guarda líneas de log que caducan;
 *     esa tabla guarda el hecho completo y permite reprocesarlo.
 *   · Vercel ya conserva lo que se escribe por `console`, que es donde va esto.
 *   · Una herramienta de pago para vigilar un endpoint es coste fijo mensual a
 *     cambio de algo que esta app resuelve con dos columnas.
 *
 * Lo que de verdad faltaba —y es lo que hace este archivo— era poder seguir UN
 * evento concreto: con dos pagos simultáneos los logs se entrelazan y no se
 * sabe qué línea es de cuál.
 *
 * ⚠️ Y NO ES MIXPANEL. Mixpanel responde "¿cuánto vendimos?"; esto responde
 * "¿por qué falló ESTE pago?". Mezclarlos ensucia las dos: el embudo se llena
 * de ruido técnico y los fallos se pierden entre eventos de producto.
 * ════════════════════════════════════════════════════════════════════════════
 */

const AREA: Area = "webhook";

export type Rastro = {
  /** El código corto que aparece en la fila y en cada línea de log. */
  readonly traza: string;
  /** Apunta un paso. `datos` nunca debe llevar secretos ni tarjetas. */
  paso(que: string, datos?: Record<string, string | number | boolean | null>): void;
  /** Cierra el diario y devuelve lo que tardó, en milisegundos. */
  cerrar(resultado: string, datos?: Record<string, string | number | boolean | null>): number;
};

export function abrirRastro(proveedor: string): Rastro {
  /*
   * 8 caracteres: suficientes para no chocar entre los eventos de un mismo día
   * y cortos para poder leerlos en voz alta por teléfono cuando alguien está
   * mirando el panel y otro los logs.
   */
  const traza = randomBytes(4).toString("hex");
  const arranque = Date.now();

  const escribir = (
    nivel: "paso" | "fin",
    que: string,
    datos?: Record<string, string | number | boolean | null>,
  ) => {
    /*
     * ⚠️ UNA LÍNEA, JSON, Y SIEMPRE CON `traza`. En JSON porque Vercel permite
     * buscar dentro; en UNA línea porque un objeto multilínea se parte en
     * entradas sueltas y deja de poder buscarse. Es el mismo formato que usa
     * `lib/fallos.ts`, para no tener dos vocabularios de log.
     */
    console.log(
      JSON.stringify({
        nivel,
        area: AREA,
        traza,
        proveedor,
        que,
        ms: Date.now() - arranque,
        ...datos,
      }),
    );
  };

  return {
    traza,
    paso: (que, datos) => escribir("paso", que, datos),
    cerrar: (resultado, datos) => {
      const ms = Date.now() - arranque;
      /*
       * ⚠️ SE AVISA SI PASA DE 8 SEGUNDOS. OnePay da 10 y luego lo reintenta;
       * si se repite, DESACTIVAN el endpoint y dejamos de enterarnos de los
       * pagos. 8s es el aviso temprano: todavía funciona, pero queda poco
       * margen y hay que mirarlo antes de que sea tarde.
       */
      escribir("fin", resultado, { ...datos, lento: ms > 8000 });
      return ms;
    },
  };
}
