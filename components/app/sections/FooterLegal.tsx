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
    <footer className="border-line border-t px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="bg-espresso flex size-9 shrink-0 items-center justify-center rounded-full"
            >
              <span
                className="font-display text-gold-light text-lg italic"
                style={{ fontWeight: 500, lineHeight: 1 }}
              >
                M
              </span>
            </span>
            <span className="font-display text-espresso text-lg" style={{ fontWeight: 500 }}>
              Manos Creadoras
            </span>
          </Link>

          <nav className="flex flex-wrap justify-center">
            {[
              { href: "/terminos", texto: "Términos" },
              { href: "/privacidad", texto: "Privacidad" },
              { href: "/reembolso", texto: "Reembolsos" },
              { href: "/contacto", texto: "Contacto" },
            ].map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="text-ink-muted hover:text-espresso flex h-11 items-center px-3 text-sm transition-colors"
              >
                {e.texto}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-ink-muted border-line mt-8 border-t pt-6 text-center text-xs">
          © 2026 Manos Creadoras (Elizabeth Valencia). Hecho a mano, también el sitio. Este sitio no
          forma parte ni está respaldado por Meta™. Los resultados varían según el esfuerzo y la
          dedicación de cada alumna.
        </p>
      </div>
    </footer>
  );
}
