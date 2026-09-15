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
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /*
          La app interna no tiene nada que buscar: son pantallas de alumnas que
          además la base no entregaría sin sesión. Que Google no gaste tiempo
          ahí — lo que tiene que encontrar es la página de ventas.
        */
        disallow: ["/cuenta", "/ojo-experto", "/auth/", "/api/"],
      },
    ],
  };
}
