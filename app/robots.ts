import type { MetadataRoute } from "next";

/**
 * Qué puede mirar Google.
 *
 * ⚠️ NACE PORQUE QA SE ABRE AL PÚBLICO (2026-09-15). Mientras QA estaba detrás
 * del login de Vercel no hacía falta: nadie de fuera podía entrar, y Google
 * tampoco. En cuanto se quita esa puerta, el sitio de pruebas queda tan visible
 * para un buscador como el de verdad — y ahí empiezan los problemas:
 *
 *   · **Le compite a la página real.** Google ve dos sitios casi idénticos y
 *     reparte la autoridad entre los dos; a veces enseña el equivocado.
 *   · **Una clienta podría comprar desde QA**, que apunta a otra base de datos y
 *     a otra biblioteca de video. Su compra existiría en el sitio que no es.
 *   · Los precios y textos de QA son los que se están probando, no los buenos.
 *
 * ⚠️ LA CONDICIÓN VA AL REVÉS DE LO INTUITIVO, y es a propósito: se abre SOLO
 * si `VERCEL_ENV === "production"`. Cualquier otra cosa —QA, una vista previa de
 * una rama, una variable sin configurar, un entorno nuevo que no existe todavía—
 * queda cerrada. Si algún día esto se equivoca, se equivoca escondiendo algo que
 * debía verse, no publicando un sitio de pruebas: lo primero se nota y se
 * arregla en cinco minutos, lo segundo tarda semanas en limpiarse de Google.
 */
export default function robots(): MetadataRoute.Robots {
  const esProduccion = process.env.VERCEL_ENV === "production";

  if (!esProduccion) {
    /*
     * Fuera de producción SE DEJA RASTREAR, y es a propósito. Lo que saca a QA
     * de Google es el `X-Robots-Tag: noindex, nofollow` que `next.config.ts`
     * pone en TODA respuesta fuera de producción. Para leerlo, Google tiene que
     * poder entrar: con `Disallow: /` no lo vería nunca y podría seguir
     * listando URLs de QA que alguien enlazó (pasó entre sept y oct de 2026).
     *
     * ⚠️ NO VOLVER A `disallow: "/"`. Antes este bloque decía que era temporal;
     * desde 2026-11-05 es la regla definitiva: rastrear + noindex es lo único
     * que garantiza que QA no aparezca en Google.
     */
    return { rules: [{ userAgent: "*", allow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /*
          ⚠️ ACTUALIZADO EL 2026-11-05. Bloqueaba `/cuenta` y `/ojo-experto`,
          rutas que dejaron de existir cuando la app pasó a vivir en `/app`, y
          dejaba todo `/app/*` abierto.

          SE DEJA ABIERTO a propósito: `/app` (el catálogo) y las fichas
          `/app/bolsos/<slug>` — tienen fotos y nombres de los proyectos, y
          pueden traer búsquedas como "bolso de perlas paso a paso".

          SE CIERRA lo que no tiene nada que buscar: las pantallas personales
          de la alumna, las lecciones (`/app/bolsos/<slug>/<orden>`, el video va
          firmado y sin membresía no se ve), el salto a los enlaces del
          directorio, el pago, el login y lo técnico.
        */
        disallow: [
          "/app/bolsos/*/",
          "/app/cuenta",
          "/app/plan",
          "/app/ojo",
          "/app/directorio/ir/",
          "/pagar",
          "/bienvenida",
          "/entrar",
          "/auth/",
          "/api/",
        ],
      },
    ],
  };
}
