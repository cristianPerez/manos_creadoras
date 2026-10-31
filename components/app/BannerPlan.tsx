import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PagoConPlan } from "@/components/app/PagoConPlan";
import type { OrigenCompra } from "@/components/home/EnlaceCompra";
import type { Frecuencia } from "@/lib/planes";

/**
 * "¿Y si sigues hasta el bolso terminado?": la tarjeta café con el selector y
 * el botón de pagar.
 *
 * ⚠️ UN SOLO BANNER PARA LAS DOS PANTALLAS (2026-10-23, pedido de Cristian):
 * Mis bolsos y la ficha de un bolso que viene con el plan. Antes la ficha
 * tenía su propia caja arena, con otro texto y otro botón; ahora es la misma
 * pieza, así no pueden contar dos ofertas distintas.
 *
 * Se ordena por el ancho de SU contenedor (`@container`), no el de la
 * pantalla: en Mis bolsos va a todo el ancho y cabe en una fila; en la ficha
 * va en la columna del video y se apila.
 */
export function BannerPlan({
  gratisNombre,
  bolsos,
  llaveros,
  desde,
  enlaces,
  origen,
  compactoEnMovil = false,
}: {
  /** El bolso que ya es suyo, si hay uno gratis. */
  gratisNombre: string | null;
  /** Solo bolsos, sin llaveros. */
  bolsos: number;
  llaveros: number;
  /** "US$13,92": el precio al mes, ya formateado en el servidor. */
  desde: string;
  enlaces: Record<Frecuencia, string | null>;
  origen: OrigenCompra;
  /** En móvil, solo una fila tocable a Mi plan (Mis bolsos). */
  compactoEnMovil?: boolean;
}) {
  return (
    <>
      <section
        className={`bg-cacao sobre-oscuro @container rounded-(--radius-foto) ${
          compactoEnMovil ? "max-lg:hidden" : ""
        }`}
      >
        <div className="flex flex-col gap-6 px-6 py-7 @4xl:flex-row @4xl:items-center @4xl:gap-8 @4xl:px-8">
          <div className="min-w-0 flex-1">
            <h2
              className="font-display text-cream text-balance"
              style={{ fontWeight: 500, fontSize: "clamp(26px, 2.4vw, 30px)", lineHeight: 1.15 }}
            >
              ¿Y si sigues hasta el <em className="clave">bolso terminado</em>?
            </h2>
            <p className="text-sand mt-1.5">
              {gratisNombre ? `${gratisNombre} es tuyo ahora mismo. ` : ""}
              {/* ⚠️ Decía "se abren los 23, uno nuevo cada mes": contaba los
                  llaveros como bolsos y prometía un bolso nuevo al mes, que no
                  existe (corregido el 2026-10-21). */}
              Con el plan se abren los {bolsos} bolsos
              {llaveros > 0 ? ` y ${llaveros} llaveros` : ""}, el directorio de proveedores y el Ojo
              Experto · garantía de 7 días.
            </p>
          </div>
          {/* ⚠️ Antes: "Crear mi cuenta gratis" → /entrar. Desde el 2026-10-21
              lleva a PAGAR, con anual por defecto (pedido de Cristian). */}
          <div className="shrink-0">
            <PagoConPlan enlaces={enlaces} origen={origen} tono="oscuro" disposicion="fila" />
          </div>
        </div>
      </section>

      {/* En Mis bolsos, en móvil se resume en una fila tocable: la tarjeta
          entera empujaba los bolsos fuera de la primera pantalla. */}
      {compactoEnMovil && (
        <Link
          href="/app/plan"
          className="bg-cacao sobre-oscuro flex items-center gap-4 rounded-(--radius-foto) px-5 py-4 lg:hidden"
        >
          <span className="min-w-0 flex-1">
            <span className="font-display text-cream block" style={{ fontWeight: 500, fontSize: 21 }}>
              ¿Sigues hasta el <em className="clave">bolso terminado</em>?
            </span>
            <span className="text-sand mt-0.5 block text-sm">Desde {desde}/mes · garantía 7 días</span>
          </span>
          <ChevronRight size={22} className="text-cream shrink-0" aria-hidden="true" />
        </Link>
      )}
    </>
  );
}
