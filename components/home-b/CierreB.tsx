import Link from "next/link";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { FRECUENCIA_POR_DEFECTO, type Frecuencia } from "@/lib/planes";

/**
 * El cierre y el pie, en la paleta B. Van en la MISMA banda oscura: la
 * referencia no los separa, y una línea de 1px basta para distinguirlos.
 *
 * ⚠️ EL BOTÓN ABRE EL PAGO DIRECTAMENTE, no baja a `#precio`. Quien llega
 * hasta aquí ya leyó el precio, las preguntas y la garantía: mandarla otra vez
 * arriba sería hacerle subir a pulsar lo mismo.
 *
 * ⚠️ EL PIE NO REUTILIZA `FooterLegal` porque aquel abre su propia banda
 * espresso debajo de esta, y quedarían dos bloques oscuros pegados con un
 * corte visible entre ellos. Mismos cuatro enlaces y MISMO texto legal (el
 * descargo de Meta™ es obligatorio, no decorativo).
 */
const LEGALES = [
  { href: "/contacto", texto: "Contacto" },
  { href: "/legal/terminos", texto: "Términos" },
  { href: "/legal/privacidad", texto: "Privacidad" },
  { href: "/legal/reembolso", texto: "Reembolsos" },
];

export function CierreB({
  enlaces,
  desde,
  resumen,
}: {
  enlaces: Record<Frecuencia, string | null>;
  /** "US$8" — el precio por mes más bajo, de la base. */
  desde: string;
  /** "US$14,60 al mes o US$96 al año" — las dos cifras reales. */
  resumen: string;
}) {
  const enlace = enlaces[FRECUENCIA_POR_DEFECTO];

  return (
    <section
      data-seccion="cierre"
      className="bg-espresso-2 sobre-oscuro grain-oscuro reserva-barra-compra"
    >
      <div className="mx-auto max-w-190 px-6 pt-12 pb-10 text-center lg:pt-20 lg:pb-16">
        <h2
          className="font-display text-ivory text-balance"
          style={{ fontWeight: 500, fontSize: "clamp(40px, 4.4vw, 60px)", lineHeight: 1.05 }}
        >
          ¿Te gustó? Esto <em className="clave">apenas empieza.</em>
        </h2>
        <p className="text-on-dark-muted mt-3.5 leading-snug text-balance lg:mt-4 lg:text-lg">
          {resumen} · cancelas cuando quieras · garantía de 7 días.
        </p>
        <EnlaceCompra
          href={enlace ?? `/pagar?ciclo=${FRECUENCIA_POR_DEFECTO}`}
          origen="cierre"
          plan={FRECUENCIA_POR_DEFECTO}
          abrePago={Boolean(enlace)}
          className="bg-ivory text-espresso-2 mt-6 flex h-13 items-center justify-center rounded-full font-bold transition-transform active:scale-[0.98] lg:mt-7.5 lg:inline-flex lg:h-14 lg:px-8.5"
        >
          Inscribirme · desde {desde}/mes
        </EnlaceCompra>
      </div>

      <footer className="contenedor-b pb-9">
        <div className="border-espresso-line flex flex-col items-center gap-4 border-t pt-7 lg:flex-row lg:justify-between lg:gap-8">
          <Link href="/" className="font-display text-ivory" style={{ fontSize: 28 }}>
            Manos <em className="clave">Creadoras</em>
          </Link>
          <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-6">
            {LEGALES.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="text-on-dark-muted hover:text-ivory flex h-11 items-center transition-colors"
              >
                {e.texto}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-on-dark-muted mt-4 max-w-190 text-nota leading-relaxed max-lg:text-center">
          © {new Date().getFullYear()} Manos Creadoras (Elizabeth Valencia). Hecho a mano,
          también el sitio. Este sitio no forma parte ni está respaldado por Meta™. Los
          resultados varían según el esfuerzo y la dedicación de cada alumna.
        </p>
      </footer>
    </section>
  );
}
