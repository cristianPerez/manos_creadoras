import { ArrowDown } from "lucide-react";

/**
 * "Ver los planes" — el puente entre cada bloque de valor y el precio.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ BAJA A LA SECCIÓN, NO NAVEGA A OTRA PÁGINA
 * ════════════════════════════════════════════════════════════════════════════
 * Hasta el 2026-10-16 estos botones llevaban a `/pagar`. Eso cobraba un peaje
 * en el momento más delicado del embudo: una carga de página entera, el home
 * perdido detrás, y la vuelta atrás reiniciando el scroll. Y para qué — si el
 * precio ya está en esta misma página, más abajo.
 *
 * Ahora es un ancla a `#precio`. La página no se recarga, el contexto no se
 * pierde y quien solo quería echar un ojo sigue leyendo sin haber "entrado" a
 * ningún sitio. El scroll suave y el hueco bajo el header pegajoso los pone
 * `html` en `globals.css`.
 *
 * ⚠️ `<a>` NATIVO, NO `<Link>`. El `Link` de Next intercepta el clic y lo trata
 * como navegación de ruta; para un ancla dentro de la misma página eso estorba
 * y rompe el `scroll-behavior` del navegador.
 * ════════════════════════════════════════════════════════════════════════════
 */
export function LlamadaAPlanes({
  titulo,
  texto,
  /** `dorado` para el momento de más deseo; `discreto` para los intermedios. */
  tono = "discreto",
}: {
  titulo: string;
  texto?: string;
  tono?: "dorado" | "discreto";
}) {
  const dorado = tono === "dorado";

  return (
    <div className="px-5 pb-10 md:pb-12">
      <div
        className={`mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-[var(--radius-lg)] p-6 text-center md:p-8 ${
          dorado ? "text-white" : "bg-ivory border-line border"
        }`}
        style={dorado ? { backgroundImage: "var(--card-destacada)" } : undefined}
      >
        <div>
          <p
            className={`font-display text-xl text-balance md:text-2xl ${dorado ? "" : "text-espresso"}`}
            style={{ fontWeight: 500 }}
          >
            {titulo}
          </p>
          {texto && (
            <p className={`mt-2 text-sm ${dorado ? "text-white/70" : "text-ink-body"}`}>{texto}</p>
          )}
        </div>

        <a
          href="#precio"
          className={`flex h-12 items-center gap-2 rounded-full px-7 font-semibold transition-transform active:scale-[0.98] [touch-action:manipulation] ${
            dorado ? "text-espresso" : "bg-espresso text-white"
          }`}
          style={dorado ? { backgroundImage: "var(--boton-dorado)" } : undefined}
        >
          Ver los planes
          <ArrowDown size={17} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
