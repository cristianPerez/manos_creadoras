import Link from "next/link";

/**
 * El cierre y el pie, en la paleta B. Van en la MISMA banda oscura: la
 * referencia no los separa, y una línea de 1px basta para distinguirlos.
 *
 * ⚠️ v2 (2026-11-05): EL CIERRE EMPUJA LA OFERTA GRATIS, NO EL PAGO. Antes
 * abría el pago directamente; ahora lleva al bolso gratis, igual que el botón
 * del héroe. Quien llega al final sin haber pagado todavía duda, y lo que
 * resuelve la duda es probar, no un segundo formulario de pago (que ya tuvo en
 * el precio y tiene en la barra fija). Cristian lo aprobó en el canvas.
 * `data-cta="cierre_gratis"` lo separa del botón del héroe en Mixpanel.
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
  slugGratis,
  desde,
}: {
  /** El bolso de regalo, de la base. Sin él, el botón lleva a la plataforma. */
  slugGratis: string | null;
  /** "$29.992 COP" — el precio por mes más bajo (el del anual), de la base. */
  desde: string;
}) {
  const destino = slugGratis ? `/app/bolsos/${slugGratis}` : "/app";

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
          {/* `de\u00a0boutique` sin corte: "de" solo al final del renglón se leía
              como una palabra suelta (revisor, escritorio). */}
          Tu primer bolso <em className="clave">de{"\u00a0"}boutique</em> empieza hoy.
        </h2>
        <p className="text-on-dark-muted mt-3 leading-snug text-balance lg:mt-4 lg:text-lg">
          Gratis, sin tarjeta. Si te gusta, el plan va desde {desde}/mes con garantía de 7 días.
        </p>
        <Link
          href={destino}
          data-cta="cierre_gratis"
          /* Morado, como el del héroe (home v3): morado = gratis, dorado =
             pagar. Hasta el 2026-11-08 era claro y no se leía como el mismo
             botón que el de arriba. */
          className="boton-accion-b mt-5.5 flex h-13 items-center justify-center rounded-full font-bold transition-transform active:scale-[0.98] lg:mt-7.5 lg:inline-flex lg:h-14 lg:px-8.5"
        >
          Empezar mi bolso gratis
        </Link>
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
