import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { Entrada } from "@/components/home/Entrada";
import { FRECUENCIA_POR_DEFECTO, precioDesde } from "@/lib/planes";

/**
 * "Este es 1 de 16 bolsos. Llévate los otros 15." — justo después del bolso gratis.
 *
 * ⚠️ VA AQUÍ PORQUE ES EL PUNTO DE MÁS DESEO DEL HOME. Acaba de ver un bolso
 * entero, gratis y completo, y la pregunta que se hace sola es "¿y los demás?".
 * Ponerlo antes sería pedir dinero por algo que todavía no ha visto.
 *
 * Sustituye a la tarjeta "Acabas de hacer uno. Te faltan 15." de la v2: misma
 * idea, pero ahora con el precio en el botón — quien llega aquí ya quiere
 * saberlo, y "Ver los planes" a secas obligaba a bajar para enterarse.
 *
 * Las cifras se calculan con el catálogo: si entra un bolso, la frase lo sigue.
 */
export function BandaUnoDe16({ bolsos, videos }: { bolsos: number; videos: number }) {
  return (
    <section className="px-5 pb-12 md:pb-16">
      <Entrada className="mx-auto max-w-6xl">
        <div className="bg-cacao sobre-oscuro rounded-bloque flex flex-col gap-6 p-6 max-md:rounded-fila md:flex-row md:items-center md:justify-between md:px-12 md:py-10">
          <div className="max-w-2xl">
            <h2
              className="font-display text-cream text-balance"
              style={{ fontWeight: 500, fontSize: "clamp(28px, 3vw, 38px)", lineHeight: 1.1 }}
            >
              Este es 1 de {bolsos} bolsos.{" "}
              <em className="text-gold-pale italic" style={{ fontWeight: 400 }}>
                Llévate los otros {bolsos - 1}.
              </em>
            </h2>
            <p className="text-cream/80 mt-2">
              {videos} videos paso a paso, la ficha de materiales de cada bolso y el Ojo Experto
              para tus dudas.
            </p>
          </div>

          <EnlaceCompra
            href="#precio"
            origen="banda_1de16"
            plan={FRECUENCIA_POR_DEFECTO}
            className="bg-gold-pale text-espresso rounded-boton flex h-14 shrink-0 items-center justify-center px-8 font-extrabold transition-transform active:scale-[0.98]"
          >
            Ver el plan · desde {precioDesde()}/mes
          </EnlaceCompra>
        </div>
      </Entrada>
    </section>
  );
}
