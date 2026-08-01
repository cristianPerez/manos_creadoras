import Link from "next/link";

export function FooterLegal() {
  return (
    <footer className="px-4 pt-10 pb-24 md:pb-10 max-w-3xl mx-auto md:px-8 border-t border-border-default">
      <div className="flex flex-wrap justify-center text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
        <Link href="/terminos" className="hover:text-text-secondary transition-colors p-2.5">Términos</Link>
        <Link href="/privacidad" className="hover:text-text-secondary transition-colors p-2.5">Privacidad</Link>
        <Link href="/reembolso" className="hover:text-text-secondary transition-colors p-2.5">Política de reembolso</Link>
        <Link href="/contacto" className="hover:text-text-secondary transition-colors p-2.5">Contacto</Link>
      </div>
      <p className="text-center text-text-tertiary mt-4" style={{ fontSize: "var(--text-xs)" }}>
        Bolsos de Lujo en Cuentas · por Manos Creadoras (Elizabeth Valencia)
      </p>
      <p className="text-center text-text-tertiary mt-1" style={{ fontSize: "var(--text-xs)" }}>
        © 2026 Manos Creadoras. Todos los derechos reservados. Este sitio no forma parte ni
        está respaldado por Meta™ o Hotmart™. Los resultados varían según el esfuerzo y la
        dedicación de cada alumna.
      </p>
    </footer>
  );
}
