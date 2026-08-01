import Link from "next/link";

export default function Reembolso() {
  return (
    <article className="px-4 py-16 max-w-2xl mx-auto md:px-8">
      <Link href="/" className="text-brand-primary" style={{ fontSize: "var(--text-sm)" }}>
        ← Volver
      </Link>
      <h1 className="font-display font-normal text-text-primary mt-6" style={{ fontSize: "var(--text-3xl)" }}>
        Política de reembolso
      </h1>
      <p className="text-text-tertiary mt-1" style={{ fontSize: "var(--text-xs)" }}>
        Última actualización: 31 de julio de 2026
      </p>

      <div className="mt-8 flex flex-col gap-6 text-text-secondary" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)" }}>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>La Garantía del Primer Bolso Bien Hecho</h2>
          <p className="mt-2">
            Tienes 7 días desde tu compra para pedir el reembolso completo, sin preguntas.
            Este plazo está gestionado directamente por Hotmart, la plataforma que procesó tu
            pago.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>Cómo pedirlo</h2>
          <p className="mt-2">
            Escríbenos desde la página de{" "}
            <Link href="/contacto" className="text-brand-primary">Contacto</Link>, o solicita
            el reembolso directamente desde tu panel de compras de Hotmart.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>Después de los 7 días</h2>
          <p className="mt-2">
            Pasado el plazo de garantía, la compra no es reembolsable, ya que el acceso al
            contenido digital ya fue entregado.
          </p>
        </section>
      </div>
    </article>
  );
}
