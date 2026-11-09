import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PuentePago } from "@/components/pago/PuentePago";
import { alumnaActual } from "@/lib/alumna";
import { enlacesDeCobro } from "@/lib/checkout";
import { rutaDePago } from "@/lib/experimento-servidor";
import { esNavegadorInterno } from "@/lib/pago-textos";
import { detectarPais } from "@/lib/pais";
import { esOrigenCompra } from "@/lib/origen-compra";
import { FRECUENCIA_POR_DEFECTO, type Frecuencia } from "@/lib/planes";

export const metadata: Metadata = {
  title: "Tu plan — Manos Creadoras",
  robots: { index: false },
};

/**
 * LA PÁGINA INTERMEDIA ANTES DE ONEPAY (2026-11-06).
 *
 * ⚠️ HASTA HOY `/pagar` SOLO REDIRIGÍA A MI PLAN, y todos los botones de compra
 * saltaban directo a OnePay. Embudo de 30 días: 285 vieron el precio → 17
 * abrieron OnePay → 1 pagó. OnePay pide primero el WhatsApp (con +57 ya
 * puesto) y enseñaba "$14.60" sin decir que son dólares: quien llegaba sin
 * aviso desconfiaba y se iba. OnePay no se puede cambiar, así que lo que
 * OnePay no explica se explica AQUÍ, antes de salir: qué se lleva, cuánto en
 * su moneda (COP/MXN/USD, cada una con su propio plan) y qué le van a pedir.
 *
 * Encargo de diseño: `design-ref/pagina-intermedia-pago/PROMPT-PAGINA-INTERMEDIA.md`.
 *
 * v2 + recortada (2026-11-08): `design-ref/home-v3-pago-claude-code/` — solo
 * el plan elegido y qué va a pasar en OnePay; lo demás ya lo dijo el home.
 *
 * `?ciclo=` decide con qué plan llega; `?desde=` qué botón la trajo (para el
 * embudo). Quien YA tiene membresía no tiene nada que pagar: va a Mi plan.
 */
export default async function Pagar({
  searchParams,
}: {
  searchParams: Promise<{ ciclo?: string; desde?: string }>;
}) {
  const { ciclo, desde } = await searchParams;
  const [alumna, cobro, rutaPago, { userAgent }] = await Promise.all([
    alumnaActual(),
    enlacesDeCobro(),
    rutaDePago(),
    detectarPais(),
  ]);

  if (alumna?.tieneAcceso) redirect("/app/plan");

  const frecuencia: Frecuencia = ciclo === "anual" || ciclo === "mensual" ? ciclo : FRECUENCIA_POR_DEFECTO;
  const origen = esOrigenCompra(desde) ? desde : null;

  return (
    <PuentePago
      enlaces={cobro.url}
      frecuenciaInicial={frecuencia}
      pais={cobro.pais}
      correo={alumna?.email ?? null}
      desde={origen}
      enInstagram={esNavegadorInterno(userAgent)}
      variantePrecio={cobro.variante}
      rutaPago={rutaPago}
    />
  );
}
