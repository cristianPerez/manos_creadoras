import Link from "next/link";

/**
 * El pie.
 *
 * ⚠️ SE CAE LA MENCIÓN A HOTMART. El texto legal decía "no forma parte ni está
 * respaldado por Meta™ o Hotmart™" — un descargo que tenía sentido cuando el
 * cobro pasaba por ahí. Nombrar a una pasarela que ya no se usa confunde a
 * quien compara, así que queda solo Meta™, que es donde está la publicidad.
 * Cuando OnePay esté integrado se decide si hace falta nombrarlo.
 */
export function FooterLegal() {
  return (
    /* `reserva-barra-compra`: en móvil deja libre el alto de la barra fija de
       compra (home v3). Sin él, el copyright quedaba tapado debajo.
       Home a color (2026-10-22): espresso. Mismos enlaces y mismo texto legal;
       solo cambian los colores. */
    <footer className="bg-espresso sobre-oscuro reserva-barra-compra px-5 py-12 md:py-14">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="font-display text-cream text-2xl" style={{ fontWeight: 500 }}>
            Manos <em className="clave">Creadoras</em>
          </Link>

          <nav className="flex flex-wrap justify-center">
            {[
              { href: "/contacto", texto: "Contacto" },
              { href: "/legal/terminos", texto: "Términos" },
              { href: "/legal/privacidad", texto: "Privacidad" },
              { href: "/legal/reembolso", texto: "Reembolsos" },
            ].map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="text-on-dark-muted hover:text-cream flex h-11 items-center px-3 text-sm transition-colors"
              >
                {e.texto}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-on-dark-muted border-espresso-line mt-8 border-t pt-6 text-center text-xs md:text-left">
          © 2026 Manos Creadoras (Elizabeth Valencia). Hecho a mano, también el sitio. Este sitio no
          forma parte ni está respaldado por Meta™. Los resultados varían según el esfuerzo y la
          dedicación de cada alumna.
        </p>
      </div>
    </footer>
  );
}
