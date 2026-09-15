import { PRECIO_ANUAL_POR_MES } from "@/lib/config";

/**
 * Las tres cosas que decide quien está dudando, en una sola línea debajo del CTA.
 *
 * Faltaban en las pantallas del visitante y el revisor lo marcó como el defecto
 * más caro después del reproductor: se le pedía "ver el programa completo" sin
 * decirle cuánto cuesta, qué pasa si no le gusta, ni quién más lo hizo. Eso
 * ataca de frente las dos objeciones de FICHA-AVATAR — "¿y si no me sirve?" y
 * "¿quién me dice que esto funciona?".
 *
 * ⚠️ NO lleva un segundo botón. Ya hay un CTA justo encima y competir con él
 * repartiría el clic entre dos destinos.
 *
 * ⚠️ LOS TRES DATOS SON REALES, comprobados antes de escribirlos:
 *   · El precio sale de `lib/config`, la fuente única. Es la SUSCRIPCIÓN, no el
 *     pago único de $25 del producto viejo — ese texto ya se borró de la app por
 *     ser información falsa y hay que no revivirlo.
 *   · La garantía de 7 días es la que promete `/reembolso` palabra por palabra.
 *   · "+1.200 alumnas · 4,9/5" es el agregado real que ya usa el hero de la
 *     landing. No hay testimonios con nombre porque no los hay todavía: el
 *     agregado es lo único verificable, y con eso basta.
 */
export function OfertaEnUnaLinea() {
  return (
    <div className="mt-4">
      {/*
        El precio va en texto PRIMARIO, no en gris terciario a 12px. En la ronda
        anterior los tres datos iban juntos en letra chica y el revisor lo marcó:
        la objeción "¿y si es caro?" se estaba respondiendo en el tamaño que se
        usa para la letra pequeña de los contratos, que es justo donde nadie mira.
      */}
      <p
        className="text-text-primary text-center"
        style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}
      >
        Desde{" "}
        <span className="text-brand-primary cifra">
          USD {PRECIO_ANUAL_POR_MES.toFixed(2).replace(".", ",")}
        </span>{" "}
        al mes con el plan anual
      </p>

      {/* Las dos pruebas se separan en chips: juntas en una línea corrida se leían
          como una coletilla legal y ninguna de las dos hacía su trabajo. */}
      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
        <span
          className="inline-flex items-center rounded-full border border-border-strong px-2.5 py-1 text-text-secondary"
          style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}
        >
          Garantía de 7 días
        </span>
        <span
          className="inline-flex items-center rounded-full border border-border-strong px-2.5 py-1 text-text-secondary"
          style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}
        >
          <span className="cifra">+1.200</span>&nbsp;alumnas · <span className="cifra">4,9</span>/5
        </span>
      </div>
    </div>
  );
}
